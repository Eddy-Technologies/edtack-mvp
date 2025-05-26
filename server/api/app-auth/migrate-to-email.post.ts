import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { JWT_SECRET, getPrivilegedSupabaseClient } from '../../utils/authConfig'; // Updated import
import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

// Helper: Authenticate custom JWT for 'app_users'
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
    if (decoded.user_type !== 'app_user' || !decoded.app_user_id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Not an app_user or invalid token type.' });
    }
    event.context.user = decoded;
  } catch (err: any) {
    console.error('JWT verification failed:', err);
    throw createError({ statusCode: 403, statusMessage: 'Invalid or expired token.' });
  }
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client
  const { newEmail, currentPassword, newSupabasePassword } = await readBody(event);

  await authenticateAppUserJWT(event);
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
      statusMessage: 'The new password for the email account must be at least 6 characters long.',
    });
  }

  try {
    // Initialize privileged client (runtime-safe)
    const privilegedSupabaseClient = getPrivilegedSupabaseClient();

    const { data: appUserRecord, error: selectAppUserError } = await supabase
        .from('app_users')
        .select('id, username, encrypted_password')
        .eq('id', appUser.app_user_id)
        .single();

    if (selectAppUserError || !appUserRecord) {
      console.error('Supabase select error during app_user verification:', selectAppUserError);
      throw createError({ statusCode: 404, statusMessage: 'App user not found or database error.' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, appUserRecord.encrypted_password);
    if (!passwordMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' });
    }

    const { data: userInfoForSupabase, error: userInfoForSupabaseError } = await supabase
        .from('user_infos')
        .select('first_name, last_name, gender, country_code, level_type, profile_picture_url, created_at, updated_at')
        .eq('app_user_id', appUser.app_user_id)
        .single();

    if (userInfoForSupabaseError) {
      console.warn('Supabase user_infos fetch warning during migration for metadata:', userInfoForSupabaseError);
    }

    const { data: supabaseAuthData, error: supabaseAuthError } = await privilegedSupabaseClient.auth.signUp({
      email: newEmail,
      password: newSupabasePassword,
      options: {
        data: {
          username_migrated_from: appUserRecord.username,
          ...(userInfoForSupabase || {})
        }
      }
    });

    if (supabaseAuthError) {
      console.error('Supabase Auth signUp error during migration:', supabaseAuthError);
      if (supabaseAuthError.message.includes('User already registered') || supabaseAuthError.message.includes('already exists')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This email address is already registered. Please use a different email or log in with that email.',
        });
      }
      throw createError({
        statusCode: supabaseAuthError.status || 500,
        statusMessage: supabaseAuthError.message || 'Supabase email registration failed.',
      });
    }

    const supabaseAuthUserId = supabaseAuthData.user?.id;
    if (!supabaseAuthUserId) {
      throw createError({ statusCode: 500, statusMessage: 'Supabase user ID not returned after signup.' });
    }

    type UserInfosUpdate = Database['public']['Tables']['user_infos']['Update'];
    const updatePayload: UserInfosUpdate = {
      user_id: supabaseAuthUserId,
      app_user_id: null,
    };

    const { data: updatedUserInfo, error: updateUserInfoError } = await supabase
        .from('user_infos')
        .update(updatePayload)
        .eq('app_user_id', appUser.app_user_id)
        .select('*')
        .single();

    if (updateUserInfoError) {
      console.error('Supabase update error during user_infos linking:', updateUserInfoError);
      if (supabaseAuthUserId) {
        await privilegedSupabaseClient.auth.admin.deleteUser(supabaseAuthUserId);
        console.log(`Rolled back Supabase Auth user creation (ID: ${supabaseAuthUserId}) due to user_infos update failure.`);
      }
      throw createError({ statusCode: 500, statusMessage: updateUserInfoError.message });
    }

    const { error: deleteAppUserError } = await privilegedSupabaseClient
        .from('app_users')
        .delete()
        .eq('id', appUser.app_user_id);
    if (deleteAppUserError) {
      console.error('Failed to delete old app_user record after migration:', deleteAppUserError);
    }

    return {
      message: 'Account successfully migrated to email. Please check your new email to confirm your account, then log in.',
      supabase_auth_id: supabaseAuthUserId,
      type: 'migration_success',
      profile: updatedUserInfo
    };
  } catch (err: any) {
    console.error('Server-side migration error:', err);
    throw createError({
      statusCode: err.statusCode || (err.status ? Number(err.status) : 500),
      statusMessage: err.statusMessage || err.message || 'Internal server error during account migration.',
    });
  }
});
