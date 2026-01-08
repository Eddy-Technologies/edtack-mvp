/**
 * Start Chat Stream Endpoint
 *
 * POST /api/chat/[threadId]/start
 *
 * Initiates a new chat stream. The Nuxt server will connect to the Python
 * backend and maintain the SSE connection, buffering events for reconnecting clients.
 *
 * Request body:
 * {
 *   message: string,        // User's message
 *   userInfo?: object       // Optional user context
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   threadId: string,
 *   message?: string
 * }
 */

import { chatStreamManager } from '~~/server/utils/chatStreamManager';

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
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

  // Get auth token from header
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  console.log(`[Start Chat] Starting stream for thread ${threadId}`);

  try {
    // Check if stream already exists
    const existingInfo = chatStreamManager.getStreamInfo(threadId);

    if (existingInfo?.active) {
      console.log(`[Start Chat] Stream already active for ${threadId}`);
      return {
        success: true,
        threadId,
        message: 'Stream already active',
        alreadyActive: true,
      };
    }

    // Start the stream
    const success = await chatStreamManager.startStream(
      threadId,
      body.message,
      token,
      body.userInfo
    );

    if (!success) {
      throw createError({
        statusCode: 500,
        message: 'Failed to start chat stream',
      });
    }

    return {
      success: true,
      threadId,
      message: 'Stream started',
    };
  } catch (err: any) {
    console.error(`[Start Chat] Error starting stream:`, err);
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to start chat stream',
    });
  }
});
