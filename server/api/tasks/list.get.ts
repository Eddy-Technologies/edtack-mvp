import { getSupabaseClient } from '#imports';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_PRIORITY } from '~~/shared/constants';

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
      offset = 0,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Build query - user can be either creator or assignee
    let tasksQuery = supabase
      .from('user_tasks')
      .select('*, creator:user_infos!creator_user_info_id(*), assignee:user_infos!assignee_user_info_id(*)')
      .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`);

    // For priority sorting, we need to fetch all records first, then sort and paginate in JavaScript
    // For other sorting, we can use database pagination
    if (sortBy !== 'priority') {
      tasksQuery = tasksQuery.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);
    }

    // Apply sorting
    if (sortBy === 'priority') {
      // For priority, we'll sort in JavaScript after fetching ALL records
      tasksQuery = tasksQuery.order('created_at', { ascending: false });
    } else if (sortBy === 'due_date') {
      const ascending = sortOrder === 'asc';
      tasksQuery = tasksQuery
        .order('due_date', { ascending, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else if (sortBy === 'credit') {
      const ascending = sortOrder === 'asc';
      tasksQuery = tasksQuery
        .order('credit', { ascending })
        .order('created_at', { ascending: false });
    } else {
      // Default to created_at sorting
      const ascending = sortOrder === 'asc';
      tasksQuery = tasksQuery.order('created_at', { ascending });
    }

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

    // Apply priority sorting and pagination if needed (JavaScript sorting)
    let sortedTasks = tasks || [];
    if (sortBy === 'priority') {
      const priorityOrder = { [TASK_PRIORITY.HIGH]: 1, [TASK_PRIORITY.MEDIUM]: 2, [TASK_PRIORITY.LOW]: 3 };
      sortedTasks = [...sortedTasks].sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;

        if (aPriority !== bPriority) {
          return aPriority - bPriority; // high(1) comes before medium(2), medium before low(3)
        }

        // If same priority, sort by created_at desc (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Apply pagination after sorting for priority
      const offsetInt = parseInt(offset as string);
      const limitInt = parseInt(limit as string);
      sortedTasks = sortedTasks.slice(offsetInt, offsetInt + limitInt);
    }

    // Format the response
    const formattedTasks = sortedTasks?.map((task) => ({
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
    let totalCount;
    if (sortBy === 'priority') {
      // For priority sorting, we already have all the data, so count from the original tasks array
      totalCount = (tasks || []).length;
    } else {
      // For other sorting, use the database count
      let countQuery = supabase
        .from('user_tasks')
        .select('*', { count: 'exact', head: true })
        .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`);

      if (status) countQuery = countQuery.eq('status', status);
      if (child_user_info_id) countQuery = countQuery.eq('assignee_user_info_id', child_user_info_id);
      if (priority) countQuery = countQuery.eq('priority', priority);
      if (category) countQuery = countQuery.eq('category', category);

      const { count } = await countQuery;
      totalCount = count || 0;
    }

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

    const limitInt = parseInt(limit as string);
    const offsetInt = parseInt(offset as string);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const totalPages = Math.ceil(totalCount / limitInt);

    return {
      success: true,
      tasks: formattedTasks,
      isParent: isParent,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: limitInt,
        offset: offsetInt,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        // Legacy fields for backward compatibility
        total: totalCount,
        hasNext: (offsetInt + limitInt) < totalCount
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
