import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS, TASK_THREAD_STATUS } from '~~/shared/constants/codes';

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

    // Single query to get user_task and check for existing task_threads
    const { data: taskData, error: queryError } = await supabase
      .from('user_tasks')
      .select(`
        *,
        user_tasks_chapters!inner(
          chapter_name
        ),
        task_threads(
          id,
          thread_id,
          status,
          chapter
        )
      `)
      .eq('assignee_user_info_id', userInfo.id)
      .eq('user_tasks_chapters.chapter_name', chapterName)
      .single();

    if (queryError || !taskData) {
      console.error('Error fetching task data:', queryError);
      throw createError({
        statusCode: 404,
        statusMessage: 'No task found for this chapter'
      });
    }

    // Check for existing OPEN thread for this chapter
    const existingThread = taskData.task_threads?.find(
      (thread) => thread.chapter === chapterName && thread.status === TASK_THREAD_STATUS.OPEN
    );

    if (existingThread) {
      return {
        success: true,
        threadId: existingThread.thread_id,
        taskThreadId: existingThread.id,
        isExisting: true
      };
    }

    console.log(userInfo.id, chapterName, subjectName);

    // Calculate due date - end of today
    const dueDate = new Date();
    const threadTitle = `${chapterName} Quiz`;

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
        user_task_id: taskData.id,
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
