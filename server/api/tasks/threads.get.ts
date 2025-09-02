import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '#imports';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_THREAD_STATUS } from '~~/shared/constants';
import type { Database } from '~~/types/supabase';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const {
      status,
      category,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Get task threads for the current user (student view)
    let threadsQuery = supabase
      .from('task_threads')
      .select(`*,
        user_tasks!inner (*,
          creator:user_infos!creator_user_info_id(first_name, last_name, email),
          assignee:user_infos!assignee_user_info_id(first_name, last_name, email)
        )
      `)
      .eq('user_tasks.assignee_user_info_id', userInfo.id);

    // Apply pagination
    threadsQuery = threadsQuery.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply sorting
    if (sortBy === 'due_date') {
      const ascending = sortOrder === 'asc';
      threadsQuery = threadsQuery
        .order('due_date', { ascending, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else if (sortBy === 'credit') {
      // Note: Can't sort by nested field directly in Supabase
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
      taskThreadId: thread.id,
      chatThreadId: thread.chat_thread_id, // Include chat_thread_id for navigation
      userTaskId: thread.user_task_id,
      creatorUserInfoId: thread.user_tasks.creator_user_info_id,
      assigneeUserInfoId: thread.user_tasks.assignee_user_info_id,
      name: thread.user_tasks.name,
      credit: thread.user_tasks.credit,
      status: thread.status,
      dueDate: thread.due_date,
      subject: thread.user_tasks.subject,
      category: thread.user_tasks.subject,
      createdAt: thread.created_at,
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
      isThread: true
    })) || [];

    // Get count for pagination
    let countQuery = supabase
      .from('task_threads')
      .select('*, user_tasks!inner(*)', { count: 'exact', head: true })
      .eq('user_tasks.assignee_user_info_id', userInfo.id);

    if (status) {
      const mappedStatus = status === 'open' ?
        TASK_THREAD_STATUS.OPEN :
        status === 'completed' ?
          TASK_THREAD_STATUS.COMPLETED :
          status === 'expired' ? TASK_THREAD_STATUS.EXPIRED : status;
      countQuery = countQuery.eq('status', mappedStatus);
    }
    if (category) {
      countQuery = countQuery.eq('user_tasks.subject', category);
    }

    const { count } = await countQuery;

    const limitInt = parseInt(limit as string);
    const offsetInt = parseInt(offset as string);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const totalPages = Math.ceil((count || 0) / limitInt);
    const totalCount = count || 0;

    return {
      success: true,
      threads: formattedThreads,
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
    console.error('Failed to list task threads:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list task threads'
    });
  }
});
