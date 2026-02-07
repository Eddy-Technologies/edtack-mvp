/**
 * Get Anonymous Rate Limit Status
 *
 * GET /api/chat/anon/rate-limit
 *
 * Returns the current rate limit status for the anonymous user.
 */

import { getRateLimitStatus, DAILY_MESSAGE_LIMIT } from '~~/server/utils/anonymousSession';

export default defineEventHandler(async (event) => {
  try {
    const rateLimit = await getRateLimitStatus(event);

    return {
      success: true,
      data: {
        limit: DAILY_MESSAGE_LIMIT,
        remaining: rateLimit.remaining,
        used: DAILY_MESSAGE_LIMIT - rateLimit.remaining,
        resetAt: rateLimit.resetAt?.toISOString() || null,
        allowed: rateLimit.allowed,
      },
    };
  } catch (err: any) {
    console.error('[Anon Rate Limit] Error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get rate limit status',
    });
  }
});
