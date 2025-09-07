import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_THREAD_STATUS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  const taskThreadId = getRouterParam(event, 'taskThreadId');

  if (!taskThreadId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task thread ID is required'
    });
  }

  const supabase = await getSupabaseClient(event);
  const userInfo = await getUserInfo(event);

  try {
    // Get the task thread with user task details to verify ownership
    const { data: taskThread, error: taskThreadError } = await supabase
      .from('task_threads')
      .select(`
        id,
        status,
        user_tasks!inner(
          id,
          assignee_user_info_id,
          credit
        )
      `)
      .eq('id', taskThreadId)
      .single();

    if (taskThreadError || !taskThread) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task thread not found'
      });
    }

    // Verify the task is assigned to the current user
    if (taskThread.user_tasks.assignee_user_info_id !== userInfo.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only complete your own tasks'
      });
    }

    // Check if task is already completed
    if (taskThread.status === TASK_THREAD_STATUS.COMPLETED) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task is already completed'
      });
    }

    // Mark task thread as completed
    const { error: updateError } = await supabase
      .from('task_threads')
      .update({
        status: TASK_THREAD_STATUS.COMPLETED,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskThreadId);

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to mark task as completed'
      });
    }

    return {
      success: true,
      message: 'Task completed successfully',
      creditsEarned: taskThread.user_tasks.credit
    };
  } catch (error: any) {
    console.error('Error completing task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to complete task'
    });
  }
});
