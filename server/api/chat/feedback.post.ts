import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody<{
      message_id: string;
      feedback_type: 'like' | 'dislike';
      category?: string;
      feedback_text?: string;
    }>(event);

    const user = await getUserInfo(event);

    if (!body.message_id || !body.feedback_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'message_id and feedback_type are required',
      });
    }

    // Validate feedback_type
    if (!['like', 'dislike'].includes(body.feedback_type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'feedback_type must be "like" or "dislike"',
      });
    }

    const { data, error } = await supabase
      .from('message_feedback')
      .upsert(
        {
          message_id: body.message_id,
          user_infos_id: user.id,
          feedback_type: body.feedback_type,
          category: body.category || null,
          feedback_text: body.feedback_text || null,
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
