import { getSupabaseClient } from '#imports';

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

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Get the task and verify it belongs to this assignee
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('assignee_user_info_id', userInfo.id)
      .single();

    if (taskError || !task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found or not assigned to you'
      });
    }

    // Check if task can be started
    if (task.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task cannot be started from current status'
      });
    }

    // Update task status to in_progress
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Failed to start task:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to start task'
      });
    }

    return {
      success: true,
      message: 'Task started successfully',
      taskId: taskId
    };
  } catch (error) {
    console.error('Failed to start task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to start task'
    });
  }
});
