import { getUserInfo } from '../../utils/auth';
import { getSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

interface PostMessageRes {
  success: boolean;
  data?: Database['public']['Tables']['thread_messages']['Row'];
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const { thread_id, content, isUser, type } = await readBody<{ thread_id: string; content: string; isUser: boolean; type?: string }>(event);

    if (!thread_id || !content) {
      throw createError({ statusCode: 400, statusMessage: 'thread_id and content are required' });
    }

    const { data, error } = await supabase
      .from('thread_messages')
      .insert({
        thread_id,
        sender: isUser ? userInfo.id : null,
        content,
        type: type ? type : isUser ? 'text' : 'json'
      })
      .select('*')
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send message: ${error.message}`,
      });
    }

    return { success: true, data } as PostMessageRes;
  } catch (err: any) {
    console.error('Send message API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to send message' });
  }
});
