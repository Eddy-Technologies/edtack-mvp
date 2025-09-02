import { getSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

export interface GetChatThreadRes {
  success: boolean;
  threadData: Database['public']['Tables']['chat_threads']['Row'] | null;
  messageData: Database['public']['Tables']['chat_messages']['Row'][] | null;
  task: Database['public']['Tables']['task_threads']['Row'] | null;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'threadId');

    const { data: threadData, error: threadError } = await supabase
      .from('chat_threads') // also: your table is "chat_threads", not "chat_thread"
      .select('*, chat_messages(*), task_threads(*)')
      .eq('id', id)
      .single();

    if (threadError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch thread: ${threadError.message}`,
      });
    }

    return { success: true, threadData, messageData: threadData.chat_messages.length > 0 ? threadData.chat_messages : null, task: threadData.task_threads } as GetChatThreadRes;
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
