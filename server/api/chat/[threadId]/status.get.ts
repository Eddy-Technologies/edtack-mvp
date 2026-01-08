/**
 * Chat Stream Status Endpoint
 *
 * GET /api/chat/[threadId]/status
 *
 * Check the status of a chat stream on this Nuxt instance.
 *
 * Response:
 * {
 *   active: boolean,
 *   status: 'active' | 'completed' | 'error' | 'cancelled' | 'not_found',
 *   bufferedEvents: number,
 *   connectedClients: number
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
