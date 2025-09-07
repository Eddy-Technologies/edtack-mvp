import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_THREAD_STATUS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const userInfo = await getUserInfo(event);

  try {
    // Get task threads with credits information grouped by subject
    const { data: taskData, error: taskError } = await supabase
      .from('task_threads')
      .select(`
        id,
        thread_id,
        status,
        user_tasks!inner(
          id,
          subject,
          credit,
          assignee_user_info_id
        )
      `)
      .eq('user_tasks.assignee_user_info_id', userInfo.id)
      .eq('status', TASK_THREAD_STATUS.OPEN); // Only get open tasks

    if (taskError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch task data'
      });
    }

    // Group by subject and calculate totals
    const subjectCredits: Record<string, {
      totalCredits: number;
      creditsPerQuiz: number;
      availableTasks: Array<{
        taskThreadId: string;
        threadId: string;
        taskId: string;
      }>;
    }> = {};

    taskData?.forEach((taskThread: any) => {
      const subject = taskThread.user_tasks.subject;
      const credits = taskThread.user_tasks.credit;

      if (!subjectCredits[subject]) {
        subjectCredits[subject] = {
          totalCredits: 0,
          creditsPerQuiz: credits,
          availableTasks: []
        };
      }

      subjectCredits[subject].totalCredits += credits;
      subjectCredits[subject].availableTasks.push({
        taskThreadId: taskThread.id,
        threadId: taskThread.thread_id,
        taskId: taskThread.user_tasks.id
      });
    });

    return {
      success: true,
      subjectCredits
    };
  } catch (error: any) {
    console.error('Error fetching task credits by subject:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch task credits'
    });
  }
});
