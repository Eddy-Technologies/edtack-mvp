import { getUserInfo } from '../../utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import type { MessageAttachment } from '~/types/fileUpload';

export interface PostMessageReq {
  thread_id: string;
  content: string;
  isUser: boolean;
  type?: string;
  uuid?: string;
  status?: 'sending' | 'sent' | 'failed' | 'cancelled';
  file_attachments?: MessageAttachment[];
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const { thread_id, content, isUser, type, uuid, status, file_attachments } = await readBody<PostMessageReq>(event);

    if (!thread_id || !content) {
      console.error('Missing required fields:', { thread_id: !!thread_id, content: !!content });
      throw createError({ statusCode: 400, statusMessage: 'thread_id and content are required' });
    }

    // Serialize content if it's an object (e.g., slides data)
    const serializedContent = typeof content === 'object' ? JSON.stringify(content) : content;

    console.log('Inserting message:', {
      thread_id,
      type: type || (isUser ? 'text' : 'json'),
      contentLength: serializedContent.length,
      isUser,
      uuid,
      fileCount: file_attachments?.length || 0
    });

    const { data, error } = await supabase
      .from('thread_messages')
      .upsert({
        id: uuid,
        thread_id,
        sender: isUser ? userInfo.id : null,
        content: serializedContent,
        type: type ? type : isUser ? 'text' : 'json',
        status: status || null,
        file_attachments: file_attachments && file_attachments.length > 0 ? file_attachments : null
      }, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send message: ${error.message}`,
      });
    }

    console.log('Message inserted successfully:', { id: data?.id, thread_id });
    return { success: true, data };
  } catch (err: any) {
    console.error('Send message API error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack
    });
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to send message' });
  }
});
