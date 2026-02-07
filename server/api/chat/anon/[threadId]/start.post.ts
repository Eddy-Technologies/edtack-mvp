/**
 * Start Anonymous Chat Stream Endpoint
 *
 * POST /api/chat/anon/[threadId]/start
 *
 * Initiates a new chat stream for an anonymous user.
 * Includes rate limit check before processing.
 */

import { chatStreamManager } from '~~/server/utils/chatStreamManager';
import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import {
  getOrCreateAnonymousSession,
  checkRateLimit,
  incrementMessageCount,
} from '~~/server/utils/anonymousSession';

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  // Get or create anonymous session
  const { sessionId } = getOrCreateAnonymousSession(event);

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

  // Verify ownership
  if (!thread.is_anonymous || thread.anon_session_id !== sessionId) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    });
  }

  // Check rate limit BEFORE processing
  const rateLimit = await checkRateLimit(event);
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Rate limit exceeded',
      data: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt?.toISOString(),
      },
    });
  }

  // Get request body
  const body = await readBody(event);

  if (!body?.message) {
    throw createError({
      statusCode: 400,
      message: 'Message is required',
    });
  }

  console.log(`[Anon Start Chat] Starting stream for thread ${threadId}, queryId: ${body.queryId || 'none'}`);

  try {
    // Check if stream already exists
    const existingInfo = chatStreamManager.getStreamInfo(threadId);

    if (existingInfo?.active) {
      console.log(`[Anon Start Chat] Stream already active for ${threadId}`);
      return {
        success: true,
        threadId,
        message: 'Stream already active',
        alreadyActive: true,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt?.toISOString(),
        },
      };
    }

    // Start the stream (no auth token for anonymous users)
    const success = await chatStreamManager.startStream(
      threadId,
      body.message,
      '', // No auth token for anonymous
      body.userInfo,
      body.queryId
    );

    if (!success) {
      throw createError({
        statusCode: 500,
        message: 'Failed to start chat stream',
      });
    }

    // Increment message count AFTER successful stream start
    const { count } = await incrementMessageCount(event);

    return {
      success: true,
      threadId,
      message: 'Stream started',
      rateLimit: {
        remaining: Math.max(0, 5 - count),
        resetAt: rateLimit.resetAt?.toISOString(),
      },
    };
  } catch (err: any) {
    console.error(`[Anon Start Chat] Error starting stream:`, err);
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to start chat stream',
    });
  }
});
