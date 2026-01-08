import { getSupabaseClient } from '~~/server/utils/authConfig';

export interface UpdateMessageStatusReq {
  status: 'sending' | 'sent' | 'failed' | 'cancelled';
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const messageId = getRouterParam(event, 'id');
    const { status } = await readBody<UpdateMessageStatusReq>(event);

    if (!messageId) {
      throw createError({ statusCode: 400, statusMessage: 'Message ID is required' });
    }

    if (!status || !['sending', 'sent', 'failed', 'cancelled'].includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid status is required' });
    }

    const { data, error } = await supabase
      .from('thread_messages')
      .update({ status })
      .eq('id', messageId)
      .select('id, status')
      .single();

    if (error) {
      console.error('Failed to update message status:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update message status: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Update message status API error:', err.message);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to update message status' });
  }
});
