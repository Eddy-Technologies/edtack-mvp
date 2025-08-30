import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Thread ID is required' });
    }

    const threadId = parseInt(id);
    if (isNaN(threadId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid thread ID' });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch messages: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
