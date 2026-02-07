/**
 * Stop Anonymous Chat Stream Endpoint
 *
 * POST /api/chat/anon/[threadId]/stop
 *
 * Stops an active anonymous chat stream.
 */

import { chatStreamManager } from '~~/server/utils/chatStreamManager';
import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { getAnonymousSessionId } from '~~/server/utils/anonymousSession';

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  // Get anonymous session
  const sessionId = getAnonymousSessionId(event);

  if (!sessionId) {
    throw createError({
      statusCode: 401,
      message: 'No anonymous session found',
    });
  }

  // Verify thread belongs to this anonymous session
  const supabase = getPrivilegedSupabaseClient(event);
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id, anon_session_id, is_anonymous')
    .eq('id', threadId)
    .single();

  if (threadError || !thread) {
    throw createError({
      statusCode: 404,
      message: 'Thread not found',
    });
  }

  if (!thread.is_anonymous || thread.anon_session_id !== sessionId) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    });
  }

  try {
    chatStreamManager.stopStream(threadId);

    return {
      success: true,
      message: 'Stream stopped',
    };
  } catch (err: any) {
    console.error(`[Anon Stop Chat] Error stopping stream:`, err);
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to stop chat stream',
    });
  }
});
