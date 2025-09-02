import { getSupabaseClient } from '#imports';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS, TASK_THREAD_STATUS } from '~~/shared/constants';
import type { Database } from '~~/types/supabase';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const {
      status,
      child_user_info_id,
      category,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      view = 'auto' // 'auto', 'tasks', 'threads'
    } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

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

    // Determine what to show based on user role and view parameter
    const shouldShowThreads = (view === 'threads') || (view === 'auto' && !isParent);
    const shouldShowTasks = (view === 'tasks') || (view === 'auto' && isParent);

    let results = [];
    let totalCount = 0;

    if (shouldShowThreads) {
      // Show task_threads for students (actual work items)
      const { data: threadsData, count } = await getTaskThreads(supabase, userInfo.id, {
        status,
        category,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy,
        sortOrder
      });
      results = threadsData || [];
      totalCount = count || 0;
    } else if (shouldShowTasks) {
      // Show user_tasks for parents (task templates/definitions)
      const { data: tasksData, count } = await getUserTasks(supabase, userInfo.id, {
        status,
        child_user_info_id,
        category,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy,
        sortOrder
      });
      results = tasksData || [];
      totalCount = count || 0;
    }

    // Format results for response
    const formattedTasks = results;

    const limitInt = parseInt(limit as string);
    const offsetInt = parseInt(offset as string);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const totalPages = Math.ceil(totalCount / limitInt);

    return {
      success: true,
      tasks: formattedTasks,
      isParent: isParent,
      view: shouldShowThreads ? 'threads' : 'tasks',
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

/**
 * Get task threads for students - shows actual work items to complete
 */
async function getTaskThreads(supabase: any, userInfoId: string, options: any) {
  const { status, category, limit, offset, sortBy, sortOrder } = options;

  let threadsQuery = supabase
    .from('task_threads')
    .select(`
      id,
      status,
      due_date,
      created_at,
      user_tasks!inner (
        id,
        creator_user_info_id,
        assignee_user_info_id,
        name,
        subject,
        credit,
        questions_per_quiz,
        required_score,
        creator:user_infos!creator_user_info_id(first_name, last_name, email),
        assignee:user_infos!assignee_user_info_id(first_name, last_name, email)
      )
    `)
    .eq('user_tasks.assignee_user_info_id', userInfoId);

  // Apply pagination
  threadsQuery = threadsQuery.range(offset, offset + limit - 1);

  // Apply sorting
  if (sortBy === 'due_date') {
    const ascending = sortOrder === 'asc';
    threadsQuery = threadsQuery
      .order('due_date', { ascending, nullsFirst: false })
      .order('created_at', { ascending: false });
  } else if (sortBy === 'credit') {
    // Note: Can't sort by nested field directly in Supabase, will sort in-memory if needed
    threadsQuery = threadsQuery.order('created_at', { ascending: sortOrder !== 'desc' });
  } else {
    const ascending = sortOrder === 'asc';
    threadsQuery = threadsQuery.order('created_at', { ascending });
  }

  // Apply filters
  if (status) {
    // Map lowercase status to uppercase for task threads
    const mappedStatus = status === 'open' ?
      TASK_THREAD_STATUS.OPEN :
      status === 'completed' ?
        TASK_THREAD_STATUS.COMPLETED :
        status === 'expired' ? TASK_THREAD_STATUS.EXPIRED : status;
    threadsQuery = threadsQuery.eq('status', mappedStatus);
  }

  if (category) {
    threadsQuery = threadsQuery.eq('user_tasks.subject', category);
  }

  const { data: threads, error: threadsError } = await threadsQuery;

  if (threadsError) {
    console.error('Failed to fetch task threads:', threadsError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch task threads'
    });
  }

  // Format threads for frontend consumption
  const formattedThreads = threads?.map((thread) => ({
    id: thread.id,
    taskThreadId: thread.id, // For clarity in frontend
    parentTaskId: thread.user_tasks.id,
    creatorUserInfoId: thread.user_tasks.creator_user_info_id,
    assigneeUserInfoId: thread.user_tasks.assignee_user_info_id,
    name: thread.user_tasks.name,
    subtitle: `${thread.user_tasks.subject} Quiz`, // Generated subtitle
    description: `Complete this ${thread.user_tasks.questions_per_quiz}-question ${thread.user_tasks.subject} quiz. You need ${thread.user_tasks.required_score}% to earn the reward!`,
    credit: thread.user_tasks.credit,
    creditInDollars: (thread.user_tasks.credit / 100).toFixed(2),
    status: thread.status,
    dueDate: thread.due_date,
    category: thread.user_tasks.subject,
    createdAt: thread.created_at,
    updatedAt: thread.created_at, // Threads don't have updated_at
    questionsPerQuiz: thread.user_tasks.questions_per_quiz,
    requiredScore: thread.user_tasks.required_score,
    creatorInfo: {
      firstName: thread.user_tasks.creator?.first_name,
      lastName: thread.user_tasks.creator?.last_name,
      email: thread.user_tasks.creator?.email
    },
    assigneeInfo: {
      firstName: thread.user_tasks.assignee?.first_name,
      lastName: thread.user_tasks.assignee?.last_name,
      email: thread.user_tasks.assignee?.email
    },
    userRole: 'assignee',
    isThread: true // Flag to help frontend distinguish
  })) || [];

  // Get count for pagination
  let countQuery = supabase
    .from('task_threads')
    .select('*', { count: 'exact', head: true })
    .eq('user_tasks.assignee_user_info_id', userInfoId);

  if (status) {
    const mappedStatus = status === 'open' ?
      TASK_THREAD_STATUS.OPEN :
      status === 'completed' ?
        TASK_THREAD_STATUS.COMPLETED :
        status === 'expired' ? TASK_THREAD_STATUS.EXPIRED : status;
    countQuery = countQuery.eq('status', mappedStatus);
  }
  if (category) countQuery = countQuery.eq('user_tasks.subject', category);

  const { count } = await countQuery;

  return { data: formattedThreads, count: count || 0 };
}

/**
 * Get user tasks for parents - shows task templates/definitions for management
 */
async function getUserTasks(supabase: any, userInfoId: string, options: any) {
  const { status, child_user_info_id, category, limit, offset, sortBy, sortOrder } = options;

  let tasksQuery = supabase
    .from('user_tasks')
    .select('*, creator:user_infos!creator_user_info_id(*), assignee:user_infos!assignee_user_info_id(*)')
    .or(`creator_user_info_id.eq.${userInfoId},assignee_user_info_id.eq.${userInfoId}`);

  // Apply pagination
  tasksQuery = tasksQuery.range(offset, offset + limit - 1);

  // Apply sorting
  if (sortBy === 'due_date') {
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
    const ascending = sortOrder === 'asc';
    tasksQuery = tasksQuery.order('created_at', { ascending });
  }

  // Apply filters
  if (status) {
    // Map lowercase status to uppercase for user tasks
    const mappedStatus = status === 'open' ?
      TASK_STATUS.OPEN :
      status === 'closed' ?
        TASK_STATUS.CLOSED :
        status === 'expired' ? TASK_STATUS.EXPIRED : status;
    tasksQuery = tasksQuery.eq('status', mappedStatus);
  }

  if (child_user_info_id) {
    tasksQuery = tasksQuery.eq('assignee_user_info_id', child_user_info_id);
  }

  if (category) {
    tasksQuery = tasksQuery.eq('subject', category);
  }

  const { data: tasks, error: tasksError } = await tasksQuery;

  if (tasksError) {
    console.error('Failed to fetch user tasks:', tasksError);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user tasks'
    });
  }

  // Format tasks for frontend consumption
  const formattedTasks = tasks?.map((task) => ({
    id: task.id,
    parentTaskId: task.id,
    creatorUserInfoId: task.creator_user_info_id,
    assigneeUserInfoId: task.assignee_user_info_id,
    name: task.name,
    credit: task.credit,
    status: task.status,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    questionsPerQuiz: task.questions_per_quiz,
    requiredScore: task.required_score,
    recurrenceFrequency: task.recurrence_frequency,
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
    userRole: task.creator_user_info_id === userInfoId ? 'creator' : 'assignee',
    isThread: false // Flag to help frontend distinguish
  })) || [];

  // Get count for pagination
  let countQuery = supabase
    .from('user_tasks')
    .select('*', { count: 'exact', head: true })
    .or(`creator_user_info_id.eq.${userInfoId},assignee_user_info_id.eq.${userInfoId}`);

  if (status) {
    const mappedStatus = status === 'open' ?
      TASK_STATUS.OPEN :
      status === 'closed' ?
        TASK_STATUS.CLOSED :
        status === 'expired' ? TASK_STATUS.EXPIRED : status;
    countQuery = countQuery.eq('status', mappedStatus);
  }
  if (child_user_info_id) countQuery = countQuery.eq('assignee_user_info_id', child_user_info_id);
  if (category) countQuery = countQuery.eq('subject', category);

  const { count } = await countQuery;

  return { data: formattedTasks, count: count || 0 };
}
