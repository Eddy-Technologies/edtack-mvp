import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'threadId');

    const { data: threadData, error: threadError } = await supabase
      .from('chat_threads') // also: your table is "chat_threads", not "chat_thread"
      .select('*')
      .eq('id', id)
      .single();

    if (threadError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch thread: ${threadError.message}`,
      });
    }

    // Fetch messages
    const { data: messageData, error: messageError } = await supabase
      .from('chat_messages') // also: plural table name
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });

    if (messageError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch messages: ${messageError.message}`,
      });
    }

    return { success: true, threadData, messageData };
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
