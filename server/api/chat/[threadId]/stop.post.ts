/**
 * Stop Chat Stream Endpoint
 *
 * POST /api/chat/[threadId]/stop
 *
 * Stops an active chat stream on this Nuxt instance.
 * Also calls Python backend to stop processing.
 *
 * Response:
 * {
 *   success: boolean,
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

  console.log(`[Stop Chat] Stopping stream for thread ${threadId}`);

  try {
    const success = await chatStreamManager.stopStream(threadId);

    return {
      success,
      message: success ? 'Stream stopped' : 'No active stream found',
    };
  } catch (err: any) {
    console.error(`[Stop Chat] Error stopping stream:`, err);
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to stop chat stream',
    });
  }
});
