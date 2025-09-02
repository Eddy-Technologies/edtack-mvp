import { getUserInfo } from '../../utils/auth';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const body = await readBody<{ thread_id: string; content: string; type?: string }>(event);

    if (!body.thread_id || !body.content) {
      throw createError({ statusCode: 400, statusMessage: 'thread_id and content are required' });
    }

    const { data, error } = await supabase
      .from('thread_messages')
      .insert({
        thread_id: body.thread_id,
        sender: userInfo.id,
        content: body.content,
        type: body.type || 'text',
      })
      .select('*')
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send message: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Send message API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to send message' });
  }
});
