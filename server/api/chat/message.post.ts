import { getUserInfo } from '../../utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export interface PostMessageReq {
  thread_id: string;
  content: string;
  isUser: boolean;
  type?: string;
  uuid?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const body = await readBody<PostMessageReq>(event);

    // Debug: Log what server received
    console.log('[message.post] Received:', {
      thread_id: body.thread_id,
      uuid: body.uuid,
      type: body.type,
      contentType: typeof body.content,
      contentLength: typeof body.content === 'string' ? body.content.length : JSON.stringify(body.content).length,
    });

    const { thread_id, content, isUser, type, uuid } = body;
    if (!thread_id || !content) {
      throw createError({ statusCode: 400, statusMessage: 'thread_id and content are required' });
    }

    const { data, error } = await supabase
      .from('thread_messages')
      .upsert({
        id: uuid,
        thread_id,
        sender: isUser ? userInfo.id : null,
        content,
        type: type ? type : isUser ? 'text' : 'json'
      }, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('[message.post] Supabase error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send message: ${error.message}`,
      });
    }

    console.log('[message.post] Successfully saved message:', uuid);
    return { success: true, data };
  } catch (err: any) {
    console.error('[message.post] API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to send message' });
  }
});
