import { getSupabaseClient } from '../utils/authConfig';
import { serverSupabaseUser } from '#supabase/server';

export interface GetMeRes {
  email: string;
  user_info_id: string;
  first_name: string;
  last_name: string;
  country_code?: string;
  level_type?: string;
  syllabus_type?: string;
  onboarding_completed: boolean;
  payment_customer_id?: string;
  is_active: boolean;
  user_role: string;
  auth_provider: string;
  id: string;
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

    // Get auth provider from Supabase user metadata
    const authProvider = user.app_metadata?.provider;

    const res: GetMeRes = {
      id: user.id,
      user_info_id: userInfo.id,
      email: user.email!,
      user_role: userInfo.user_roles[0].roles.role_name,
      auth_provider: authProvider!,
      first_name: userInfo.first_name!,
      last_name: userInfo.last_name!,
      level_type: userInfo.level_type || undefined,
      syllabus_type: userInfo.syllabus_type || undefined,
      country_code: userInfo.country_code || undefined,
      onboarding_completed: !!userInfo.onboarding_completed,
      payment_customer_id: userInfo.payment_customer_id || undefined,
      is_active: !!userInfo.is_active,
    };
    // Return combined user data
    return res;
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
