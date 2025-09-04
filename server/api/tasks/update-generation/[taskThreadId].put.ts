import { getSupabaseClient } from '#imports';

interface UpdateTaskContentReq {
  generated_content: any;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const taskId = getRouterParam(event, 'taskThreadId');
    const body: UpdateTaskContentReq = await readBody(event);

    if (!taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task ID is required',
      });
    }

    if (!body.generated_content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Generated content is required',
      });
    }

    // Update the task thread with generated content
    const { data: updatedTask, error } = await supabase
      .from('task_threads')
      .update({
        generated_content: body.generated_content,
      })
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) {
      console.error('Database error updating task content:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update task content: ${error.message}`,
      });
    }

    if (!updatedTask) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found',
      });
    }

    return {
      success: true,
      data: updatedTask,
    };
  } catch (err: any) {
    console.error('Update task content API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update task content',
    });
  }
});
