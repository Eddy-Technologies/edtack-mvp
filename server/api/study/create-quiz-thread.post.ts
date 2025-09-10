import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_THREAD_STATUS } from '~~/shared/constants/codes';

interface CreateQuizThreadRequest {
  chapterName: string;
  subjectName: string;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const body: CreateQuizThreadRequest = await readBody(event);

    const { chapterName, subjectName } = body;

    // Validate required fields
    if (!chapterName || !subjectName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'chapterName and subjectName are required'
      });
    }

    // First, check if a task thread already exists for this chapter and user
    const { data: existingTaskThreads, error: existingError } = await supabase
      .from('task_threads')
      .select(`
        id,
        thread_id,
        status,
        user_tasks!inner(
          id,
          assignee_user_info_id,
          subject
        )
      `)
      .eq('chapter', chapterName)
      .eq('user_tasks.subject', subjectName)
      .eq('user_tasks.assignee_user_info_id', userInfo.id)
      .eq('status', TASK_THREAD_STATUS.OPEN);

    if (existingError) {
      console.error('Error checking existing task threads:', existingError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing task threads'
      });
    }

    // If an open task thread already exists, return it
    if (existingTaskThreads && existingTaskThreads.length > 0) {
      return {
        success: true,
        threadId: existingTaskThreads[0].thread_id,
        taskThreadId: existingTaskThreads[0].id,
        isExisting: true
      };
    }

    // Check if user has an available task for this chapter and subject
    const { data: availableTasks, error: tasksError } = await supabase
      .from('user_tasks')
      .select(`
        id,
        credit,
        name,
        user_tasks_chapters!inner(
          chapter_name
        )
      `)
      .eq('assignee_user_info_id', userInfo.id)
      .eq('subject', subjectName)
      .eq('status', 'OPEN')
      .eq('user_tasks_chapters.chapter_name', chapterName);

    if (tasksError) {
      console.error('Error fetching available tasks:', tasksError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch available tasks'
      });
    }

    if (!availableTasks || availableTasks.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No available tasks found for this chapter'
      });
    }

    const task = availableTasks[0];

    // Get chapter display name for thread title
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapters')
      .select('display_name')
      .eq('name', chapterName)
      .single();

    if (chapterError) {
      console.error('Error fetching chapter data:', chapterError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch chapter data'
      });
    }

    // Calculate due date - end of today
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setHours(23, 59, 59, 999);

    const threadTitle = `${chapterData.display_name} Quiz`;

    // Create chat thread
    const { data: newChatThread, error: chatThreadError } = await supabase
      .from('threads')
      .insert({
        subject: subjectName,
        user_infos_id: userInfo.id,
        title: threadTitle
      })
      .select('id')
      .single();

    if (chatThreadError) {
      console.error('Failed to create chat thread:', chatThreadError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create chat thread'
      });
    }

    // Create task thread
    const { data: newTaskThread, error: taskThreadError } = await supabase
      .from('task_threads')
      .insert({
        user_task_id: task.id,
        thread_id: newChatThread.id,
        chapter: chapterName,
        due_date: dueDate.toISOString(),
        status: TASK_THREAD_STATUS.OPEN,
        init_prompt: {
          taskType: 'quiz',
          chapterName,
          subjectName
        }
      })
      .select('id')
      .single();

    if (taskThreadError) {
      console.error('Failed to create task thread:', taskThreadError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task thread'
      });
    }

    console.log(`Successfully created quiz thread ${newTaskThread.id} for chapter "${chapterName}"`);

    return {
      success: true,
      threadId: newChatThread.id,
      taskThreadId: newTaskThread.id,
      isExisting: false
    };
  } catch (error: any) {
    console.error('Error creating quiz thread:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create quiz thread'
    });
  }
});
