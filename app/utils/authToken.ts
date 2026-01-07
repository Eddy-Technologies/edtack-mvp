/**
 * Auth token utility for chat connections.
 * Separated from useChat.ts to avoid circular dependencies with messageQueue.ts
 */

import { useSupabaseClient } from '#imports';

/**
 * Get a fresh Supabase access token for authentication.
 * Uses refreshSession() to ensure the token is valid, since getSession()
 * only returns the cached token which may be expired.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const supabase = useSupabaseClient();

  try {
    // refreshSession() ensures we get a valid token, unlike getSession() which
    // just returns the cached token from localStorage (potentially expired)
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.warn('[authToken] Token refresh failed, falling back to cached session:', error.message);
      // If refresh fails (e.g., refresh token expired), fall back to cached session
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    }
    return data.session?.access_token || null;
  } catch (error) {
    console.error('[authToken] Failed to get Supabase access token:', error);
    return null;
  }
}
