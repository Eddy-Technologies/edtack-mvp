import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../utils/authConfig'; // Import JWT_SECRET
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching user_infos)
  const token = getCookie(event, 'app_user_jwt'); // Get the HttpOnly cookie

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No app user session found.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.user_type !== 'app_user' || !decoded.app_user_id) {
      throw createError({ statusCode: 403, statusMessage: 'Invalid app user token.' });
    }

    // Fetch user_infos data based on the app_user_id from the token
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('id, user_id, app_user_id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at')
      .eq('app_user_id', decoded.app_user_id)
      .single();

    if (userInfoError || !userInfo) {
      console.error('Error fetching user info for app user:', userInfoError);
      throw createError({ statusCode: 404, statusMessage: 'App user profile not found.' });
    }

    return { user: userInfo, type: 'app_user' };
  } catch (err: any) {
    console.error('App user token verification failed:', err);
    // Clear the invalid cookie if verification fails
    setCookie(event, 'app_user_jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired app user session.' });
  }
});
