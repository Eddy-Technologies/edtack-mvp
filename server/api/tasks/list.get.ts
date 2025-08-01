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

    // Build query - user can be either parent or child
    let tasksQuery = supabase
      .from('task_credit')
      .select('*')
      .or(`parent_user_info_id.eq.${userInfo.id},child_user_info_id.eq.${userInfo.id}`)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters if provided
    if (status) {
      tasksQuery = tasksQuery.eq('status', status);
    }

    if (child_user_info_id) {
      tasksQuery = tasksQuery.eq('child_user_info_id', child_user_info_id);
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
      parentUserInfoId: task.parent_user_info_id,
      childUserInfoId: task.child_user_info_id,
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
      parentInfo: {
        firstName: task.parent_info?.all_users?.first_name,
        lastName: task.parent_info?.all_users?.last_name,
        email: task.parent_info?.all_users?.email
      },
      childInfo: {
        firstName: task.child_info?.all_users?.first_name,
        lastName: task.child_info?.all_users?.last_name,
        email: task.child_info?.all_users?.email
      },
      // Helper field to determine user's role in this task
      userRole: task.parent_user_info_id === userInfo.id ? 'parent' : 'child'
    })) || [];

    // Get count for pagination
    let countQuery = supabase
      .from('task_credit')
      .select('*', { count: 'exact', head: true })
      .or(`parent_user_info_id.eq.${userInfo.id},child_user_info_id.eq.${userInfo.id}`);

    if (status) countQuery = countQuery.eq('status', status);
    if (child_user_info_id) countQuery = countQuery.eq('child_user_info_id', child_user_info_id);
    if (priority) countQuery = countQuery.eq('priority', priority);
    if (category) countQuery = countQuery.eq('category', category);

    const { count } = await countQuery;

    // Check if user is a parent by checking their user_role or parent_child relationships
    const { data: parentRelationships } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', userInfo.id)
      .limit(1);

    // Get user info to check role
    const { data: userDetails } = await supabase
      .from('user_infos')
      .select('user_role')
      .eq('id', userInfo.id)
      .single();

    const isParent = (userDetails?.user_role === 'parent') || (parentRelationships && parentRelationships.length > 0);

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
