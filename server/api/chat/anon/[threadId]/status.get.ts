/**
 * Anonymous Chat Stream Status Endpoint
 *
 * GET /api/chat/anon/[threadId]/status
 *
 * Check the status of an anonymous chat stream.
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

  const streamInfo = chatStreamManager.getStreamInfo(threadId);

  if (!streamInfo) {
    return {
      active: false,
      status: 'not_found',
      bufferedEvents: 0,
      connectedClients: 0,
    };
  }

  return streamInfo;
});
