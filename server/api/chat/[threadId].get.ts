import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'threadId');

    const { data: threadData, error: threadError } = await supabase
      .from('chat_threads') // also: your table is "chat_threads", not "chat_thread"
      .select('*, chat_messages(*)')
      .eq('id', id)
      .single();

    if (threadError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch thread: ${threadError.message}`,
      });
    }

    return { success: true, threadData, messageData: threadData.chat_messages };
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
