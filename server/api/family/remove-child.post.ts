import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { childId } = body;

    if (!childId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Child ID is required'
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

    // Check if user is a parent by looking for parent_child relationships
    const { data: parentCheck } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentInfo.user_info_id)
      .limit(1);

    if (!parentCheck || parentCheck.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only parents can remove children'
      });
    }

    // Verify the parent-child relationship exists
    const { data: relationship, error: relationshipError } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentInfo.user_info_id)
      .eq('child_user_info_id', childId)
      .single();

    if (relationshipError || !relationship) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child is not linked to your account'
      });
    }

    // Get child info for response from all_users view
    const { data: childInfo } = await supabase
      .from('all_users')
      .select('user_info_id, email, first_name, last_name')
      .eq('user_info_id', childId)
      .single();

    // Start a transaction to handle all related data

    // 1. Cancel all pending tasks for this child from this parent
    const { error: tasksError } = await supabase
      .from('user_tasks')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('creator_user_info_id', parentInfo.user_info_id)
      .eq('assignee_user_info_id', childId)
      .in('status', ['pending', 'in_progress', 'completed']);

    if (tasksError) {
      console.warn('Failed to cancel child tasks:', tasksError);
    }

    // 2. Remove the parent-child relationship
    const { error: removeError } = await supabase
      .from('parent_child')
      .delete()
      .eq('parent_user_info_id', parentInfo.user_info_id)
      .eq('child_user_info_id', childId);

    if (removeError) {
      console.error('Failed to remove parent-child relationship:', removeError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove child from your family'
      });
    }

    // Note: We don't delete the child's user_credits record as they should keep their credits

    const childName = childInfo ? `${childInfo.first_name} ${childInfo.last_name}`.trim() : 'Child';

    return {
      success: true,
      message: `${childName} has been removed from your family`,
      removedChild: {
        id: childId,
        name: childName,
        email: childInfo?.email
      }
    };
  } catch (error) {
    console.error('Failed to remove child:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove child'
    });
  }
});
