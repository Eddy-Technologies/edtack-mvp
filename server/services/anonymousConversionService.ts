import type { H3Event } from 'h3';
import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { getAnonymousSessionId, clearAnonymousSession } from '~~/server/utils/anonymousSession';

/**
 * Convert anonymous threads to a user account
 *
 * This function:
 * 1. Finds all threads belonging to the anonymous session
 * 2. Updates them to be owned by the authenticated user
 * 3. Clears the is_anonymous flag and anon_session_id
 * 4. Deletes the rate limit record
 * 5. Clears the anonymous session cookie
 *
 * @param event - H3Event for accessing cookies and creating Supabase client
 * @param userInfoId - The user_infos.id of the authenticated user
 * @returns Number of threads converted
 */
export async function convertAnonymousToUser(
  event: H3Event,
  userInfoId: string
): Promise<{ success: boolean; convertedThreads: number }> {
  const anonSessionId = getAnonymousSessionId(event);

  if (!anonSessionId) {
    // No anonymous session to convert
    return { success: true, convertedThreads: 0 };
  }

  const supabase = getPrivilegedSupabaseClient(event);

  try {
    // 1. Find all anonymous threads for this session
    const { data: threads, error: fetchError } = await supabase
      .from('threads')
      .select('id')
      .eq('anon_session_id', anonSessionId)
      .eq('is_anonymous', true);

    if (fetchError) {
      console.error('[AnonymousConversion] Error fetching threads:', fetchError);
      throw fetchError;
    }

    const threadCount = threads?.length || 0;

    if (threadCount > 0) {
      // 2. Update threads to be owned by the authenticated user
      const { error: updateError } = await supabase
        .from('threads')
        .update({
          user_infos_id: userInfoId,
          is_anonymous: false,
          anon_session_id: null,
        })
        .eq('anon_session_id', anonSessionId)
        .eq('is_anonymous', true);

      if (updateError) {
        console.error('[AnonymousConversion] Error updating threads:', updateError);
        throw updateError;
      }

      console.log(`[AnonymousConversion] Converted ${threadCount} threads for session ${anonSessionId}`);
    }

    // 3. Delete the rate limit record
    const { error: deleteError } = await supabase
      .from('anonymous_rate_limits')
      .delete()
      .eq('session_id', anonSessionId);

    if (deleteError) {
      // Log but don't fail - rate limit cleanup is not critical
      console.warn('[AnonymousConversion] Error deleting rate limit record:', deleteError);
    }

    // 4. Clear the anonymous session cookie
    clearAnonymousSession(event);

    return { success: true, convertedThreads: threadCount };
  } catch (error) {
    console.error('[AnonymousConversion] Conversion failed:', error);
    return { success: false, convertedThreads: 0 };
  }
}

/**
 * Check if there are any anonymous threads to convert
 *
 * @param event - H3Event for accessing cookies and creating Supabase client
 * @returns Number of anonymous threads
 */
export async function getAnonymousThreadCount(event: H3Event): Promise<number> {
  const anonSessionId = getAnonymousSessionId(event);

  if (!anonSessionId) {
    return 0;
  }

  const supabase = getPrivilegedSupabaseClient(event);

  const { count, error } = await supabase
    .from('threads')
    .select('id', { count: 'exact', head: true })
    .eq('anon_session_id', anonSessionId)
    .eq('is_anonymous', true);

  if (error) {
    console.error('[AnonymousConversion] Error counting threads:', error);
    return 0;
  }

  return count || 0;
}
