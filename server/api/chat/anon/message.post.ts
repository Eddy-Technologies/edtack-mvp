/**
 * Create Anonymous Message Endpoint
 *
 * POST /api/chat/anon/message
 *
 * Creates a message for an anonymous thread.
 */

import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { getAnonymousSessionId } from '~~/server/utils/anonymousSession';
import type { MessageAttachment } from '~/types/fileUpload';

export interface PostAnonMessageReq {
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
    const sessionId = getAnonymousSessionId(event);

    if (!sessionId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No anonymous session found',
      });
    }

    const { thread_id, content, isUser, type, uuid, status, file_attachments } =
      await readBody<PostAnonMessageReq>(event);

    if (!thread_id || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'thread_id and content are required',
      });
    }

    const supabase = getPrivilegedSupabaseClient(event);

    // Verify thread belongs to this anonymous session
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id, anon_session_id, is_anonymous')
      .eq('id', thread_id)
      .single();

    if (threadError || !thread) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Thread not found',
      });
    }

    if (!thread.is_anonymous || thread.anon_session_id !== sessionId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      });
    }

    // Serialize content if it's an object
    const serializedContent = typeof content === 'object' ? JSON.stringify(content) : content;

    console.log('[Anon Message] Inserting message:', {
      thread_id,
      type: type || (isUser ? 'text' : 'json'),
      contentLength: serializedContent.length,
      isUser,
      uuid,
    });

    const { data, error } = await supabase
      .from('thread_messages')
      .upsert(
        {
          id: uuid,
          thread_id,
          sender: null, // Anonymous - no sender ID
          content: serializedContent,
          type: type ? type : isUser ? 'text' : 'json',
          status: status || null,
          file_attachments: file_attachments && file_attachments.length > 0 ? file_attachments : null,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('[Anon Message] Insert error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to send message: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Anon Message] API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send message',
    });
  }
});
