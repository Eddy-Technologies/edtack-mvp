import { getSupabaseClient } from '#imports';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const stripe = await getStripe();

  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const { childEmail } = body;

    if (!childEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Child email is required'
      });
    }

    // Get authenticated user (parent)
    const user = await requireAuth(event);

    // Get parent's user_info_id
    const { data: parentUserInfo } = await supabase
      .from('user_infos')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (!parentUserInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent user info not found'
      });
    }

    const { data: child } = await supabase
      .from('user_infos')
      .select(`
        id, email, first_name, last_name
      `)
      .eq('email', childEmail)
      .single();

    if (!child?.id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child user not found'
      });
    }

    // Get or create parent's family group
    let groupId;

    // Check if parent already has a group they created
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id, name')
      .eq('created_by', parentUserInfo.id)
      .eq('group_type', 'family')
      .single();

    if (existingGroup) {
      groupId = existingGroup.id;
    } else {
      // Create a new family group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: `${parentUserInfo.first_name || 'Family'}'s Family`,
          group_type: 'family',
          created_by: parentUserInfo.id
        })
        .select()
        .single();

      if (groupError || !newGroup) {
        console.error('Failed to create family group:', groupError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create family group'
        });
      }

      groupId = newGroup.id;

      // Add parent as group member with creator status
      const { error: parentMemberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_info_id: parentUserInfo.id,
          status: 'active',
          is_creator: true
        });

      if (parentMemberError) {
        console.error('Failed to add parent to group:', parentMemberError);
      }
    }

    // Check if child is already in the group
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('user_info_id', child.id)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Child is already in your family group'
        });
      } else if (existingMember.status === 'pending') {
        throw createError({
          statusCode: 409,
          statusMessage: 'An invitation is already pending for this child'
        });
      }
    }

    // Add child to the group with active status (for credit management purposes)
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_info_id: child.id,
        status: 'active',
        invited_by: parentUserInfo.id,
        is_creator: false
      });

    if (memberError) {
      console.error('Failed to add child to group:', memberError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to add child to family group'
      });
    }

    // Get stripe balance for the child
    const childCustomer = await stripe.customers.search({
      query: `email:'${childEmail}'`,
      limit: 1
    });

    console.log(`Family relationship created: Parent ${user.email} added child ${childEmail} to group`);

    return {
      email: childEmail,
      id: child.id,
      firstName: child.first_name,
      lastName: child.last_name,
      balance: childCustomer.data[0]?.balance,
      active: true
    };
  } catch (error) {
    console.error('Failed to add child:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add child to family'
    });
  }
});
