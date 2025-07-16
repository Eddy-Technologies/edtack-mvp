import { getSupabaseClient } from '../../utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    // Get the authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      });
    }

    // Fetch user profile data from user_infos table
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select(
        'id, user_id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at'
      )
      .eq('user_id', user.id)
      .single();

    if (userInfoError || !userInfo) {
      console.error(
        `Error fetching user_info for user_id ${user.id}:`,
        userInfoError
      );
      throw createError({
        statusCode: 404,
        statusMessage: 'User profile not found.',
      });
    }

    // Return combined user data
    return {
      user: {
        id: user.id,
        email: user.email,
        user_info_id: userInfo.id,
        ...userInfo,
      },
      type: 'user'
    };
  } catch (err: any) {
    // If the error is already a H3Error (from createError), re-throw it
    if (err.statusCode) {
      throw err;
    }
    console.error('[me.get.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while fetching user details.',
    });
  }
});