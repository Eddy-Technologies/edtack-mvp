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
          assignee_user_info_id,
          user_tasks_chapters!inner(
            chapter_name,
            chapters!inner(
              name,
              display_name
            )
          )
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
        chapters: Array<{
          name: string;
          display_name: string;
        }>;
      }>;
      availableChapters: Set<string>;
    }> = {};

    taskData?.forEach((taskThread: any) => {
      const subject = taskThread.user_tasks.subject;
      const credits = taskThread.user_tasks.credit;
      const chapters = taskThread.user_tasks.user_tasks_chapters?.map((utc: any) => ({
        name: utc.chapters.name,
        display_name: utc.chapters.display_name
      })) || [];

      if (!subjectCredits[subject]) {
        subjectCredits[subject] = {
          totalCredits: 0,
          creditsPerQuiz: credits,
          availableTasks: [],
          availableChapters: new Set()
        };
      }

      subjectCredits[subject].totalCredits += credits;
      subjectCredits[subject].availableTasks.push({
        taskThreadId: taskThread.id,
        threadId: taskThread.thread_id,
        taskId: taskThread.user_tasks.id,
        chapters: chapters
      });

      // Track which chapters have tasks available
      chapters.forEach((chapter) => {
        subjectCredits[subject].availableChapters.add(chapter.name);
      });
    });

    // Convert Sets to Arrays for JSON serialization
    const serializedSubjectCredits: Record<string, any> = {};
    Object.entries(subjectCredits).forEach(([subject, data]) => {
      serializedSubjectCredits[subject] = {
        ...data,
        availableChapters: Array.from(data.availableChapters)
      };
    });

    return {
      success: true,
      subjectCredits: serializedSubjectCredits
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
