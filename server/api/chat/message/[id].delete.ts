import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const messageId = getRouterParam(event, 'id');

    if (!messageId) {
      throw createError({ statusCode: 400, statusMessage: 'Message ID is required' });
    }

    const { error } = await supabase
      .from('thread_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Failed to delete message:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete message: ${error.message}`,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Delete message API error:', err.message);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete message' });
  }
});
