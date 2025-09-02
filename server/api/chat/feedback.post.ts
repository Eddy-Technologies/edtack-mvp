import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody<{ message_id: number; feedback_type: 'like' | 'dislike' }>(event);
    const user = event.context.user;

    if (!user?.id) {
      throw createError({ statusCode: 401, statusMessage: 'User not authenticated' });
    }

    if (!body.message_id || !body.feedback_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'message_id and feedback_type are required',
      });
    }

    const { data, error } = await supabase
      .from('message_feedback')
      .upsert(
        {
          message_id: body.message_id,
          user_infos_id: user.id,
          feedback_type: body.feedback_type,
        },
        { onConflict: 'message_id,user_infos_id' }
      )
      .select('*')
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to submit feedback: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Feedback API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to submit feedback' });
  }
});
