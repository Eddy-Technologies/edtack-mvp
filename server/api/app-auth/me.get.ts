import { verifyAppUserCookieAndGetPayload } from '../../utils/authHelpers';
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching user_infos)

  try {
    // Verify JWT from cookie and get payload using the helper
    const decoded = verifyAppUserCookieAndGetPayload(event);

    // Fetch user_infos data based on the app_user_id from the token
    // At this point, decoded.app_user_id is guaranteed to exist if verifyAppUserCookieAndGetPayload didn't throw.
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('id, user_id, app_user_id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at')
      .eq('app_user_id', decoded.app_user_id)
      .single();

    if (userInfoError || !userInfo) {
      console.error(`Error fetching user_info for app_user_id ${decoded.app_user_id}:`, userInfoError);
      throw createError({ statusCode: 404, statusMessage: 'App user profile not found.' });
    }

    return { user: userInfo, type: 'app_user' };
  } catch (err: any) {
    // If the error is already a H3Error (from createError in helpers or here), re-throw it.
    // Otherwise, wrap it or create a generic server error.
    if (err.statusCode) {
      throw err;
    }
    console.error('[me.get.ts] Unexpected error:', err);
    throw createError({ statusCode: 500, statusMessage: 'An unexpected error occurred while fetching user details.' });
  }
});
