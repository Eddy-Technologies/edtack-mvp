import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { task_id, completion_notes } = body;

    if (!task_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'task_id is required'
      });
    }

    // Get authenticated user (child)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get child's user_info_id
    const { data: childInfo, error: childError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (childError || !childInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child user info not found'
      });
    }

    // Get the task and verify child owns it
    const { data: task, error: taskError } = await supabase
      .from('task_credit')
      .select('*')
      .eq('id', task_id)
      .eq('child_user_info_id', childInfo.id)
      .single();

    if (taskError || !task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found or you do not have permission to complete it'
      });
    }

    // Check if task can be completed
    if (task.status !== 'pending' && task.status !== 'in_progress') {
      throw createError({
        statusCode: 400,
        statusMessage: `Task cannot be completed. Current status: ${task.status}`
      });
    }

    // Update task to completed status
    const { data: updatedTask, error: updateError } = await supabase
      .from('task_credit')
      .update({
        status: 'completed',
        completion_notes: completion_notes || null,
        completed_at: new Date().toISOString()
      })
      .eq('id', task_id)
      .eq('child_user_info_id', childInfo.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to complete task:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to complete task'
      });
    }

    return {
      success: true,
      message: 'Task completed successfully. Waiting for parent approval.',
      task: {
        id: updatedTask.id,
        name: updatedTask.name,
        status: updatedTask.status,
        completedAt: updatedTask.completed_at,
        completionNotes: updatedTask.completion_notes
      }
    };
  } catch (error) {
    console.error('Failed to complete task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to complete task'
    });
  }
});
