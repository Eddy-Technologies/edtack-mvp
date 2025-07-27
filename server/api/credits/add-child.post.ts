import { getSupabaseClient } from '#imports';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

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
      .from('all_users')
      .select(`
        user_info_id, email, first_name, last_name
      `)
      .eq('email', childEmail)
      .single();

    // Then check if user_infos exists and is_active in JavaScript
    if (!child?.user_info_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child user not found'
      });
    }

    // Check if relationship already exists
    const { data: existingRelationship } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentUserInfo.id)
      .eq('child_user_info_id', child.user_info_id)
      .single();

    if (existingRelationship) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Child is already linked to your account'
      });
    }

    // Create parent-child relationship
    const { error: insertError } = await supabase
      .from('parent_child')
      .insert({
        parent_user_info_id: parentUserInfo.id,
        child_user_info_id: child.user_info_id
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to create parent-child relationship:', insertError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create family relationship'
      });
    }

    // Get stripe balance for the child
    const childCustomer = await stripe.customers.search({
      query: `email:'${childEmail}'`,
      limit: 1
    });

    // TODO: Send email notifications to both parent and child
    // This would typically involve:
    // 1. Email to parent: "You have successfully added [child name] to your family"
    // 2. Email to child: "You have been added to [parent name]'s family for credit management"

    console.log(`Family relationship created: Parent ${user.email} added child ${childEmail}`);

    return {
      email: childEmail,
      id: child.user_info_id,
      firstName: child.first_name,
      lastName: child.last_name,
      balance: childCustomer.data[0]?.balance,
      active: true // TODO: Check if child is active in your business logic
    };
  } catch (error) {
    console.error('Failed to add child:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add child to family'
    });
  }
});
