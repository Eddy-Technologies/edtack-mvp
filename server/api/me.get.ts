import { getSupabaseClient } from '../utils/authConfig';
import { serverSupabaseUser } from '#supabase/server';

export interface GetMeRes {
  id: string;
  email: string;
  user_info_id: string;
  first_name: string;
  last_name: string;
  gender?: string;
  address?: string;
  country_code?: string;
  postal_code?: string;
  date_of_birth?: string;
  level_type?: string;
  profile_picture_url?: string;
  onboarding_completed: boolean;
  payment_customer_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_role: string;
}

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    // Fetch user profile data from user_infos table
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('*, user_roles(roles(*))')
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
      id: user.id,
      email: user.email,
      user_info_id: userInfo.id,
      ...userInfo,
      user_role: userInfo.user_roles[0].roles.role_name
    } as GetMeRes;
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
