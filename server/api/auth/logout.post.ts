import { getSupabaseClient } from '../../utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    // Sign out the user from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[logout.post.ts] Supabase signOut error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to sign out user.',
      });
    }

    return {
      message: 'User logged out successfully.',
      success: true
    };
  } catch (err: any) {
    console.error('[logout.post.ts] Logout error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Logout failed.',
    });
  }
});
