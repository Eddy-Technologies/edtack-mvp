import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
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

    // Get parent's user_info_id from all_users view
    const { data: parentInfo, error: parentError } = await supabase
      .from('all_users')
      .select('user_info_id, email, first_name, last_name')
      .eq('prefixed_auth_id', `auth.${user.id}`)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent info not found'
      });
    }

    // Find the child user by email
    const { data: childUserData } = await supabase
      .from('all_users')
      .select('user_info_id, email, first_name, last_name')
      .eq('email', childEmail.toLowerCase())
      .single();

    if (!childUserData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No user found with that email address'
      });
    }

    // Check if relationship already exists
    const { data: existingRelationship } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentInfo.user_info_id)
      .eq('child_user_info_id', childUserData.user_info_id)
      .single();

    if (existingRelationship) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This child is already linked to your account'
      });
    }

    // Create the parent-child relationship
    const { error: linkError } = await supabase
      .from('parent_child')
      .insert({
        parent_user_info_id: parentInfo.user_info_id,
        child_user_info_id: childUserData.user_info_id
      });

    if (linkError) {
      console.error('Failed to create parent-child relationship:', linkError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to link child to your account'
      });
    }

    // Ensure child has a user_credits record
    const { error: creditsError } = await supabase
      .from('user_credits')
      .upsert({
        user_info_id: childUserData.user_info_id,
        credit: 0
      }, { onConflict: 'user_info_id' });

    if (creditsError) {
      console.warn('Failed to ensure child credits record:', creditsError);
    }

    return {
      success: true,
      message: `${childUserData.first_name} ${childUserData.last_name} has been successfully linked to your family`,
      child: {
        id: childUserData.user_info_id,
        name: `${childUserData.first_name} ${childUserData.last_name}`.trim(),
        email: childEmail
      }
    };
  } catch (error) {
    console.error('Failed to link child:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to link child'
    });
  }
});
