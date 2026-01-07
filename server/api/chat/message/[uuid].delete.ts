import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const uuid = getRouterParam(event, 'uuid');

    if (!uuid) {
      throw createError({ statusCode: 400, statusMessage: 'uuid is required' });
    }

    console.log('Deleting message:', uuid);

    const { error } = await supabase
      .from('thread_messages')
      .delete()
      .eq('id', uuid);

    if (error) {
      console.error('Supabase delete error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete message: ${error.message}`,
      });
    }

    console.log('Message deleted successfully:', uuid);
    return { success: true };
  } catch (err: any) {
    console.error('Delete message API error:', {
      message: err.message,
      statusCode: err.statusCode,
    });
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete message' });
  }
});
