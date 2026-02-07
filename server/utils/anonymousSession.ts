import { randomUUID } from 'crypto';
import type { H3Event } from 'h3';
import { getCookie, setCookie } from 'h3';
import { getPrivilegedSupabaseClient } from './authConfig';

const ANONYMOUS_SESSION_COOKIE = 'anon_session_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
export const DAILY_MESSAGE_LIMIT = 5;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date | null;
  sessionId: string;
}

interface AnonymousSession {
  sessionId: string;
  isNew: boolean;
}

/**
 * Get or create an anonymous session for the user
 * Session ID is stored in an HTTP-only cookie
 */
export function getOrCreateAnonymousSession(event: H3Event): AnonymousSession {
  let sessionId = getCookie(event, ANONYMOUS_SESSION_COOKIE);
  let isNew = false;

  if (!sessionId) {
    sessionId = randomUUID();
    isNew = true;

    // Set HTTP-only cookie with 30-day expiry
    setCookie(event, ANONYMOUS_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return { sessionId, isNew };
}

/**
 * Get the anonymous session ID if it exists (doesn't create one)
 */
export function getAnonymousSessionId(event: H3Event): string | undefined {
  return getCookie(event, ANONYMOUS_SESSION_COOKIE);
}

/**
 * Clear the anonymous session cookie
 */
export function clearAnonymousSession(event: H3Event): void {
  setCookie(event, ANONYMOUS_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
}

/**
 * Check if the anonymous user has remaining messages for the day
 * Returns rate limit status including remaining messages and reset time
 */
export async function checkRateLimit(event: H3Event): Promise<RateLimitResult> {
  const { sessionId } = getOrCreateAnonymousSession(event);
  const supabase = getPrivilegedSupabaseClient(event);

  // Get or create rate limit record
  const { data: rateLimit, error } = await supabase
    .from('anonymous_rate_limits')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = row not found, which is expected for new sessions
    console.error('[AnonymousSession] Error fetching rate limit:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: DAILY_MESSAGE_LIMIT,
      resetAt: null,
      sessionId,
    };
  }

  // New session - no rate limit record yet
  if (!rateLimit) {
    return {
      allowed: true,
      remaining: DAILY_MESSAGE_LIMIT,
      resetAt: null,
      sessionId,
    };
  }

  // Check if daily reset is needed
  const now = new Date();
  const resetAt = new Date(rateLimit.daily_reset_at);
  const shouldReset = now >= resetAt;

  if (shouldReset) {
    // Reset the counter for the new day
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0); // Next midnight

    await supabase
      .from('anonymous_rate_limits')
      .update({
        message_count_daily: 0,
        daily_reset_at: nextReset.toISOString(),
      })
      .eq('session_id', sessionId);

    return {
      allowed: true,
      remaining: DAILY_MESSAGE_LIMIT,
      resetAt: nextReset,
      sessionId,
    };
  }

  // Check current count against limit
  const currentCount = rateLimit.message_count_daily || 0;
  const remaining = Math.max(0, DAILY_MESSAGE_LIMIT - currentCount);
  const allowed = currentCount < DAILY_MESSAGE_LIMIT;

  return {
    allowed,
    remaining,
    resetAt,
    sessionId,
  };
}

/**
 * Increment the message count for an anonymous session
 * Should be called after a message is successfully sent
 * Returns the new count after incrementing
 */
export async function incrementMessageCount(event: H3Event): Promise<{ count: number }> {
  const { sessionId } = getOrCreateAnonymousSession(event);
  const supabase = getPrivilegedSupabaseClient(event);

  // Calculate next midnight for daily reset
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0);

  // First, try to get existing record
  const { data: existing } = await supabase
    .from('anonymous_rate_limits')
    .select('message_count_daily, daily_reset_at')
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    // Check if we need to reset (new day)
    const resetAt = new Date(existing.daily_reset_at);
    const shouldReset = now >= resetAt;

    const newCount = shouldReset ? 1 : (existing.message_count_daily || 0) + 1;
    const newResetAt = shouldReset ? nextReset.toISOString() : existing.daily_reset_at;

    await supabase
      .from('anonymous_rate_limits')
      .update({
        message_count_daily: newCount,
        last_message_at: now.toISOString(),
        daily_reset_at: newResetAt,
      })
      .eq('session_id', sessionId);

    return { count: newCount };
  } else {
    // Insert new record
    await supabase
      .from('anonymous_rate_limits')
      .insert({
        session_id: sessionId,
        message_count_daily: 1,
        last_message_at: now.toISOString(),
        daily_reset_at: nextReset.toISOString(),
        created_at: now.toISOString(),
      });

    return { count: 1 };
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(event: H3Event): Promise<RateLimitResult> {
  return checkRateLimit(event);
}
