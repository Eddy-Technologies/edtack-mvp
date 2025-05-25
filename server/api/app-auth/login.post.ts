import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../utils/authConfig'; // Import JWT_SECRET
import { serverSupabaseClient } from '#supabase/server';

// Define a stub for jwt
const jwtStub = {
  sign: (payload: any, secretOrPrivateKey: any, options?: any): string => {
    console.log('[STUB] jwt.sign called with payload:', payload, 'options:', options);
    // Return a consistent, fake token. This is not a real JWT.
    return 'fake-jwt-token-for-stubbing-purposes-' + Date.now();
  },
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching app_users and user_infos)
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required for login.' });
  }

  try {
    const { data: appUserRecord, error: selectAppUserError } = await supabase
      .from('app_users')
      .select('id, username, encrypted_password')
      .eq('username', username)
      .single();

    if (selectAppUserError || !appUserRecord) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, appUserRecord.encrypted_password);
    if (!validPassword) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign( // Use the stubbed sign method
      { app_user_id: appUserRecord.id, username: appUserRecord.username, user_type: 'app_user' },
      JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
    );

    // Set HttpOnly cookie
    setCookie(event, 'app_user_jwt', token, {
      httpOnly: true, // Crucial for security: JS cannot access this cookie
      secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT expiry)
      path: '/', // Accessible across the entire domain
      sameSite: 'lax', // Or 'strict' depending on your needs
    });

    // Fetch associated profile data from 'user_infos' for the response
    const { data: userInfoData, error: userInfoError } = await supabase
      .from('user_infos')
      .select('id, user_id, app_user_id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at')
      .eq('app_user_id', appUserRecord.id)
      .single();

    if (userInfoError) {
      console.error('Supabase user_infos fetch error during login:', userInfoError);
    }

    return {
      user: { ...appUserRecord, user_info_id: userInfoData?.id, ...userInfoData }, // Combine app_user and user_infos data
      type: 'app_user',
      message: 'Username login successful!'
    };
  } catch (err: any) {
    console.error('Server-side username login error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal server error during username login.',
    });
  }
});
