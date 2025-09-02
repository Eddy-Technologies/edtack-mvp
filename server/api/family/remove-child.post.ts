import { getSupabaseClient } from '#imports';
import { TASK_STATUS } from '~~/shared/constants';

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

    // Get parent's user_info
    const { data: parentInfo, error: parentError } = await supabase
      .from('user_infos')
      .select('id, email, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent info not found'
      });
    }

    // Find the group where both parent and child are members
    const { data: sharedGroups, error: groupError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups(
          id,
          created_by,
          group_members!inner(
            user_info_id,
            status
          )
        )
      `)
      .eq('user_info_id', parentInfo.id)
      .eq('status', 'active');

    if (groupError) {
      console.error('Failed to fetch groups:', groupError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch group information'
      });
    }

    // Find the group that contains the child and where the parent is the creator
    let targetGroup = null;
    for (const groupMember of sharedGroups || []) {
      if (groupMember.groups.created_by === parentInfo.id) {
        const hasChild = groupMember.groups.group_members.some(
          (member) => member.user_info_id === childId && member.status === 'active'
        );
        if (hasChild) {
          targetGroup = groupMember.groups;
          break;
        }
      }
    }

    if (!targetGroup) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child is not in your family group'
      });
    }

    // Get child info for response
    const { data: childInfo } = await supabase
      .from('user_infos')
      .select('id, email, first_name, last_name')
      .eq('id', childId)
      .single();

    // Cancel all pending tasks for this child from this parent
    const { error: tasksError } = await supabase
      .from('user_tasks')
      .update({
        status: TASK_STATUS.CLOSED,
        updated_at: new Date().toISOString()
      })
      .eq('creator_user_info_id', parentInfo.id)
      .eq('assignee_user_info_id', childId)
      .eq('status', TASK_STATUS.OPEN); // Only check active tasks in new architecture

    if (tasksError) {
      console.warn('Failed to cancel child tasks:', tasksError);
    }

    // Remove the child from the group
    const { error: removeError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', targetGroup.id)
      .eq('user_info_id', childId);

    if (removeError) {
      console.error('Failed to remove child from group:', removeError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove child from your family'
      });
    }

    const childName = childInfo ? `${childInfo.first_name} ${childInfo.last_name}`.trim() : 'Child';

    return {
      success: true,
      message: `${childName} has been removed from your family group`,
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
