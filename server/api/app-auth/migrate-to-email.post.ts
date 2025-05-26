// /server/api/app-auth/migrate-account.post.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Comment out the real import
import type { H3Event } from 'h3';
import { JWT_SECRET, getPrivilegedSupabaseClient, getSupabaseClient } from '../../utils/authConfig';
// import { authenticateAppUserJWT } from '../../utils/authHelpers'; // Import helper
import type { Database } from '~/types/supabase';

// Helper function to authenticate requests based on the custom JWT issued for 'app_users'.
// It's designed to be used before handlers that require an authenticated 'app_user'.
export async function authenticateAppUserJWT(event: H3Event) {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token missing.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET); // Use STUB
    // Ensure the token is for an 'app_user' and contains the app_user_id
    if (decoded.user_type !== 'app_user' || !decoded.app_user_id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not an app_user or invalid token type.' });
    }
    // Attach decoded user information to the event context for access in the main handler
    event.context.user = decoded;
  } catch (err: any) {
    console.error('JWT verification failed:', err);
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired token.' });
  }
}

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const serviceSupabase = getPrivilegedSupabaseClient(event);
  const { newEmail, currentPassword, newSupabasePassword } = await readBody(event);

  // await authenticateAppUserJWT(event);
  const appUser = event.context.user;

  if (!newEmail || !currentPassword || !newSupabasePassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New email, current password, and a new password for the email account are required for migration.',
    });
  }

  if (newSupabasePassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The new password must be at least 6 characters long.',
    });
  }

  try {
    const { data: appUserRecord, error: selectAppUserError } = await supabase
      .from('app_users')
      .select('id, username, encrypted_password')
      .eq('id', appUser.app_user_id)
      .single();

    if (selectAppUserError || !appUserRecord) {
      throw createError({ statusCode: 404, statusMessage: 'App user not found.' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, appUserRecord.encrypted_password);
    if (!passwordMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' });
    }

    const { data: userInfoForSupabase } = await supabase
      .from('user_infos')
      .select('first_name, last_name, gender, country_code, level_type, profile_picture_url, created_at, updated_at')
      .eq('app_user_id', appUser.app_user_id)
      .single();

    const { data: supabaseAuthData, error: supabaseAuthError } = await serviceSupabase.auth.admin.createUser({
      email: newEmail,
      password: newSupabasePassword,
      user_metadata: {
        username_migrated_from: appUserRecord.username,
        ...(userInfoForSupabase || {})
      }
    });

    if (supabaseAuthError) {
      throw createError({ statusCode: 500, statusMessage: supabaseAuthError.message });
    }

    const supabaseAuthUserId = supabaseAuthData.user?.id;
    if (!supabaseAuthUserId) {
      throw createError({ statusCode: 500, statusMessage: 'Supabase user ID not returned after signup.' });
    }

    const { error: updateUserInfoError } = await supabase
      .from('user_infos')
      .update({ user_id: supabaseAuthUserId, app_user_id: null })
      .eq('app_user_id', appUser.app_user_id)
      .single();

    if (updateUserInfoError) {
      await serviceSupabase.auth.admin.deleteUser(supabaseAuthUserId);
      throw createError({ statusCode: 500, statusMessage: updateUserInfoError.message });
    }

    const { error: deleteAppUserError } = await serviceSupabase
      .from('app_users')
      .delete()
      .eq('id', appUser.app_user_id);

    if (deleteAppUserError) {
      console.warn('Failed to delete old app_user record:', deleteAppUserError);
    }

    return {
      message: 'Account successfully migrated. Check your email to confirm your account.',
      supabase_auth_id: supabaseAuthUserId,
      type: 'migration_success',
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal server error during account migration.',
    });
  }
});
