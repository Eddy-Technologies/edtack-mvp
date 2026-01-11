import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { email } = body;

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      });
    }

    // Get authenticated user (parent)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get parent's user_info_id and verify they are a parent
    const { data: parentInfo, error: parentError } = await supabase
      .from('user_infos')
      .select('*, user_roles(role_id, roles(role_name))')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent info not found'
      });
    }

    if (parentInfo.user_roles[0].roles.role_name !== 'PARENT') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only parents can send invites'
      });
    }

    // Check if user already exists and get their info
    const { data: existingUser } = await supabase
      .from('user_infos')
      .select('id, email, first_name, last_name')
      .eq('email', email.toLowerCase())
      .single();

    // Get or create family group for the parent
    let familyGroupId;
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('created_by', parentInfo.id)
      .eq('group_type', 'family')
      .single();

    if (existingGroup) {
      familyGroupId = existingGroup.id;
    } else {
      // Create family group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: `${parentInfo.first_name}'s Family`,
          description: 'Family group for managing children and credits',
          group_type: 'family',
          created_by: parentInfo.id
        })
        .select('id')
        .single();

      if (groupError || !newGroup) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create family group'
        });
      }

      familyGroupId = newGroup.id;

      // Add parent as active member of their own family group
      await supabase
        .from('group_members')
        .insert({
          group_id: familyGroupId,
          user_info_id: parentInfo.id,
          status: 'active',
          is_creator: true,
          invited_by: parentInfo.id
        });
    }

    if (existingUser) {
      // Check if already a member of this family group
      const { data: existingMembership } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('group_id', familyGroupId)
        .eq('user_info_id', existingUser.id)
        .single();

      if (existingMembership) {
        throw createError({
          statusCode: 400,
          statusMessage: existingMembership.status === 'pending' ?
            'An invitation is already pending for this user.' :
            'This user is already a member of your family group.'
        });
      }

      // Create invitation for existing user
      const { data: invitation, error: inviteError } = await supabase
        .from('group_members')
        .insert({
          group_id: familyGroupId,
          user_info_id: existingUser.id,
          status: 'pending',
          invited_by: parentInfo.id,
          invited_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (inviteError || !invitation) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create invitation'
        });
      }

      return {
        success: true,
        message: `Invitation sent to ${existingUser.first_name} ${existingUser.last_name} at ${email}`,
        invite: {
          id: invitation.id,
          memberName: `${existingUser.first_name} ${existingUser.last_name}`,
          memberEmail: email,
          parentName: parentInfo.first_name,
          sentAt: new Date().toISOString(),
          status: 'pending'
        }
      };
    } else {
      // For non-existing users, create email-based invitation
      // Check if there's already a pending invitation for this email
      const { data: existingEmailInvite } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', familyGroupId)
        .eq('invited_email', email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (existingEmailInvite) {
        throw createError({
          statusCode: 400,
          statusMessage: 'An invitation is already pending for this email.'
        });
      }

      // Create invitation with email only (no user_info_id)
      const { data: invitation, error: inviteError } = await supabase
        .from('group_members')
        .insert({
          group_id: familyGroupId,
          user_info_id: null,
          invited_email: email.toLowerCase(),
          status: 'pending',
          invited_by: parentInfo.id,
          invited_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (inviteError || !invitation) {
        console.error('Failed to create email invitation:', inviteError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create invitation'
        });
      }

      // Generate invite link (just points to register page)
      const config = useRuntimeConfig();
      const baseUrl = config.public.baseUrl || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/register`;

      return {
        success: true,
        message: `Invitation created for ${email}. Share the link with them to register.`,
        inviteLink: inviteLink,
        invite: {
          id: invitation.id,
          memberEmail: email,
          parentName: parentInfo.first_name,
          sentAt: new Date().toISOString(),
          status: 'pending',
          isEmailInvite: true
        }
      };
    }
  } catch (error) {
    console.error('Failed to send invite:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send invite'
    });
  }
});
