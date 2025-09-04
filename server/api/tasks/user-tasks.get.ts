import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS } from '~~/shared/constants';
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
      sortOrder = 'desc'
    } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Get user tasks (parent view - task templates/definitions)
    let tasksQuery = supabase
      .from('user_tasks')
      .select('*, creator:user_infos!creator_user_info_id(*), assignee:user_infos!assignee_user_info_id(*)')
      .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`);

    // Apply pagination
    tasksQuery = tasksQuery.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

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
      subject: task.subject,
      category: task.subject,
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
      userRole: task.creator_user_info_id === userInfo.id ? 'creator' : 'assignee',
      isThread: false
    })) || [];

    // Get count for pagination
    let countQuery = supabase
      .from('user_tasks')
      .select('*', { count: 'exact', head: true })
      .or(`creator_user_info_id.eq.${userInfo.id},assignee_user_info_id.eq.${userInfo.id}`);

    if (status) {
      const mappedStatus = status === 'open' ?
        TASK_STATUS.OPEN :
        status === 'closed' ?
          TASK_STATUS.CLOSED :
          status === 'expired' ? TASK_STATUS.EXPIRED : status;
      countQuery = countQuery.eq('status', mappedStatus);
    }
    if (child_user_info_id) {
      countQuery = countQuery.eq('assignee_user_info_id', child_user_info_id);
    }
    if (category) {
      countQuery = countQuery.eq('subject', category);
    }

    const { count } = await countQuery;

    const limitInt = parseInt(limit as string);
    const offsetInt = parseInt(offset as string);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const totalPages = Math.ceil((count || 0) / limitInt);
    const totalCount = count || 0;

    return {
      success: true,
      tasks: formattedTasks,
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
    console.error('Failed to list user tasks:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list user tasks'
    });
  }
});
