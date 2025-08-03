import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const {
      status,
      child_user_info_id,
      priority,
      category,
      limit = 50,
      offset = 0
    } = query;

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Build query - user can be either creator or assignee
    let tasksQuery = supabase
      .from('user_tasks')
      .select('*, creator:user_infos!creator_user_info_id(*), assignee:user_infos!assignee_user_info_id(*)')
      .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters if provided
    if (status) {
      tasksQuery = tasksQuery.eq('status', status);
    }

    if (child_user_info_id) {
      tasksQuery = tasksQuery.eq('assignee_user_info_id', child_user_info_id);
    }

    if (priority) {
      tasksQuery = tasksQuery.eq('priority', priority);
    }

    if (category) {
      tasksQuery = tasksQuery.eq('category', category);
    }

    const { data: tasks, error: tasksError } = await tasksQuery;

    if (tasksError) {
      console.error('Failed to fetch tasks:', tasksError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch tasks'
      });
    }

    // Format the response
    const formattedTasks = tasks?.map((task) => ({
      id: task.id,
      creatorUserInfoId: task.creator_user_info_id,
      assigneeUserInfoId: task.assignee_user_info_id,
      name: task.name,
      subtitle: task.subtitle,
      description: task.description,
      credit: task.credit,
      creditInDollars: (task.credit / 100).toFixed(2),
      status: task.status,
      dueDate: task.due_date,
      priority: task.priority,
      category: task.category,
      completionNotes: task.completion_notes,
      approvalNotes: task.approval_notes,
      completedAt: task.completed_at,
      approvedAt: task.approved_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      creatorInfo: {
        firstName: task.creator?.first_name,
        lastName: task.creator?.last_name,
        email: task.creator?.email
      },
      assigneeInfo: {
        firstName: task.assignee?.first_name,
        lastName: task.assignee?.last_name,
        email: task.assignee?.email
      },
      // Helper field to determine user's role in this task
      userRole: task.creator_user_info_id === userInfo.id ? 'creator' : 'assignee'
    })) || [];

    // Get count for pagination
    let countQuery = supabase
      .from('user_tasks')
      .select('*', { count: 'exact', head: true })
      .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`);

    if (status) countQuery = countQuery.eq('status', status);
    if (child_user_info_id) countQuery = countQuery.eq('assignee_user_info_id', child_user_info_id);
    if (priority) countQuery = countQuery.eq('priority', priority);
    if (category) countQuery = countQuery.eq('category', category);

    const { count } = await countQuery;

    // Check if user is a parent by checking if they created any groups
    const { data: createdGroups } = await supabase
      .from('groups')
      .select('id')
      .eq('created_by', userInfo.id)
      .limit(1);

    // Also check user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(role_name)')
      .eq('user_info_id', userInfo.id);

    const isParent = (createdGroups && createdGroups.length > 0) ||
      (userRoles && userRoles.some((ur) => ur.roles.role_name === 'PARENT'));

    return {
      success: true,
      tasks: formattedTasks,
      isParent: isParent,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNext: (parseInt(offset as string) + parseInt(limit as string)) < (count || 0)
      }
    };
  } catch (error) {
    console.error('Failed to list tasks:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list tasks'
    });
  }
});
