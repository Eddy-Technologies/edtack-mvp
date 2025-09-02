import { getSupabaseClient } from '#imports';
import { TASK_STATUS } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const taskId = getRouterParam(event, 'id');

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required'
      });
    }

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Get the task and verify user is the creator
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('creator_user_info_id', userInfo.id)
      .single();

    if (taskError || !task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found or you do not have permission to close it'
      });
    }

    // Check if task can be closed
    if (task.status !== TASK_STATUS.OPEN) {
      throw createError({
        statusCode: 400,
        statusMessage: `Task cannot be closed. Current status: ${task.status}`
      });
    }

    // Close the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update({
        status: TASK_STATUS.CLOSED,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('creator_user_info_id', userInfo.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to close task:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to close task'
      });
    }

    return {
      success: true,
      message: 'Task closed successfully. No new instances will be created.',
      task: {
        id: updatedTask.id,
        name: updatedTask.name,
        status: updatedTask.status
      }
    };
  } catch (error) {
    console.error('Failed to close task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to close task'
    });
  }
});
