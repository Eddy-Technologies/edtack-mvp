import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const {
      status,
      child_user_info_id,
      category,
      subject,
      min_credit,
      max_credit,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Role-based filtering: Parents see tasks they created, Students see tasks assigned to them
    const isParent = userInfo.user_role === 'PARENT';

    // Get user tasks with detailed chapter information
    let tasksQuery = supabase
      .from('user_tasks')
      .select(`
        *,
        creator:user_infos!creator_user_info_id(*),
        assignee:user_infos!assignee_user_info_id(*),
        user_tasks_chapters(
          id,
          chapter_name,
          status,
          score,
          total_score,
          completed_at,
          generation_started_at,
          chapters!inner(name, display_name, subject_id)
        )
      `);

    // Apply role-based filter
    if (isParent) {
      tasksQuery = tasksQuery.eq('creator_user_info_id', userInfo.id);
    } else {
      tasksQuery = tasksQuery.eq('assignee_user_info_id', userInfo.id);
    }

    // Apply filters (before sorting and pagination)
    if (status) {
      // Map lowercase status to uppercase for user tasks
      const mappedStatus = status === 'open' ?
        TASK_STATUS.OPEN :
        status === 'closed' ?
          TASK_STATUS.CLOSED :
          status === 'expired' ? TASK_STATUS.EXPIRED : status;
      tasksQuery = tasksQuery.eq('status', mappedStatus);
    }

    if (child_user_info_id && isParent) {
      // Only allow parents to filter by child
      tasksQuery = tasksQuery.eq('assignee_user_info_id', child_user_info_id);
    }

    if (category || subject) {
      tasksQuery = tasksQuery.eq('subject', category || subject);
    }

    // Apply sorting (before pagination)
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

    // Apply pagination LAST (after all filters and sorting)
    tasksQuery = tasksQuery.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    const { data: tasks, error: tasksError } = await tasksQuery;

    // Post-process filtering for credit range (since it's calculated from credit * chapters)
    let filteredTasks = tasks || [];

    if (min_credit || max_credit) {
      filteredTasks = filteredTasks.filter((task) => {
        const totalCredits = task.credit * (task.user_tasks_chapters?.length || 0);
        if (min_credit && totalCredits < parseInt(min_credit as string)) return false;
        if (max_credit && totalCredits > parseInt(max_credit as string)) return false;
        return true;
      });
    }

    if (tasksError) {
      console.error('Failed to fetch user tasks:', tasksError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user tasks'
      });
    }

    // Format tasks for frontend consumption with enhanced chapter data
    const formattedTasks = filteredTasks.map((task) => {
      const chapters = task.user_tasks_chapters?.map((utc: any) => ({
        id: utc.id,
        name: utc.chapters.name,
        displayName: utc.chapters.display_name,
        subjectName: utc.chapters.subject_id,
        status: utc.status,
        score: utc.score,
        bestScore: utc.score && utc.total_score ? Math.round((utc.score / utc.total_score) * 100) : 0,
        totalScore: utc.total_score,
        completedAt: utc.completed_at,
        generationStartedAt: utc.generation_started_at,
        credit: task.credit, // Credit per chapter
        hasQuiz: !!utc.completed_at || utc.status === 'GENERATING' // Simplified check
      })) || [];

      const totalCredits = task.credit * chapters.length;

      return {
        id: task.id,
        parentTaskId: task.id,
        creatorUserInfoId: task.creator_user_info_id,
        assigneeUserInfoId: task.assignee_user_info_id,
        name: task.name,
        credit: task.credit,
        creditPerChapter: task.credit,
        totalCredits,
        status: task.status,
        dueDate: task.due_date,
        subject: task.subject,
        subjectName: task.subject,
        category: task.subject,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        questionsPerQuiz: task.questions_per_quiz,
        requiredScore: task.required_score,
        recurrenceFrequency: task.recurrence_frequency,
        chapters,
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
      };
    });

    // Use filtered tasks count (since credit filtering is post-process)
    const totalCount = filteredTasks.length;
    const limitInt = parseInt(limit as string);
    const offsetInt = parseInt(offset as string);
    const currentPage = Math.floor(offsetInt / limitInt) + 1;
    const totalPages = Math.ceil(totalCount / limitInt);

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
