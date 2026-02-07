/**
 * Create Anonymous Thread Endpoint
 *
 * POST /api/chat/anon/thread
 *
 * Creates a new chat thread for an anonymous user.
 * Thread is linked to the anonymous session via anon_session_id.
 */

import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { getOrCreateAnonymousSession, checkRateLimit } from '~~/server/utils/anonymousSession';

export default defineEventHandler(async (event) => {
  try {
    // Get or create anonymous session
    const { sessionId } = getOrCreateAnonymousSession(event);

    // Check rate limit
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

    const body = await readBody<{ title?: string; subject?: string }>(event);

    // Use privileged client since we're not authenticated
    const supabase = getPrivilegedSupabaseClient(event);

    const { data, error } = await supabase
      .from('threads')
      .insert({
        user_infos_id: null, // No user_info for anonymous
        title: body?.title ?? null,
        subject: body?.subject ?? null,
        is_anonymous: true,
        anon_session_id: sessionId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Anon Thread] Failed to create thread:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create thread: ${error.message}`,
      });
    }

    return {
      success: true,
      data,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt?.toISOString(),
      },
    };
  } catch (err: any) {
    console.error('[Anon Thread] Create thread API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create thread',
    });
  }
});
