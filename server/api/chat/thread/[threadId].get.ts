import { getSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

export interface GetChatThreadRes {
  success: boolean;
  threadData: Database['public']['Tables']['threads']['Row'] | null;
  messageData: Database['public']['Tables']['thread_messages']['Row'][] | null;
  task: Database['public']['Tables']['task_threads']['Row'] | null;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'threadId');

    // Fetch thread data
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*, thread_messages(*), task_threads(*)')
      .eq('id', id)
      .single();

    if (threadError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch thread: ${threadError.message}`,
      });
    }

    if (threadData?.thread_messages) {
      threadData.thread_messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return {
      success: true,
      threadData,
      messageData: threadData?.thread_messages?.length > 0 ? threadData.thread_messages : null,
      task: threadData?.task_threads?.[0] || null
    } as GetChatThreadRes;
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
