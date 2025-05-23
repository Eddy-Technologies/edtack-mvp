import bcrypt from 'bcryptjs';
import { authenticateAppUserJWT } from '../../utils/authHelpers'; // Import helper
import { privilegedSupabaseClient } from '../../utils/authConfig'; // Import privileged client
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching app_users and user_infos)
  const { newEmail, password } = await readBody(event);

  // 1. Authenticate the incoming request using the custom JWT for 'app_users'
  await authenticateAppUserJWT(event);
  const appUser = event.context.user; // Get authenticated app_user from middleware context

  // Validate required fields for migration
  if (!newEmail || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New email and current password are required for migration.',
    });
  }

  try {
    // 2. Verify current password for the authenticated 'app_user' from app_users table
    const { data: appUserRecord, error: selectAppUserError } = await supabase
      .from('app_users')
      .select('id, username, encrypted_password')
      .eq('id', appUser.app_user_id)
      .single();

    if (selectAppUserError || !appUserRecord) {
      console.error('Supabase select error during app_user verification:', selectAppUserError);
      throw createError({ statusCode: 404, statusMessage: 'App user not found or database error.' });
    }

    const passwordMatch = await bcrypt.compare(password, appUserRecord.encrypted_password);
    if (!passwordMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Incorrect current password.' });
    }

    // 3. Register the user with Supabase Auth using the provided email and password.
    // Fetch profile data from user_infos to pass as user_metadata to Supabase Auth
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
      password: password,
      options: {
        data: {
          username: appUserRecord.username,
          ...(userInfoForSupabase || {})
        }
      }
    });

    if (supabaseAuthError) {
      console.error('Supabase Auth signUp error during migration:', supabaseAuthError);
      throw createError({
        statusCode: supabaseAuthError.status || 500,
        statusMessage: supabaseAuthError.message || 'Supabase email registration failed.',
      });
    }

    const supabaseAuthUserId = supabaseAuthData.user?.id;
    if (!supabaseAuthUserId) {
      throw createError({ statusCode: 500, statusMessage: 'Supabase user ID not returned after signup.' });
    }

    // 4. Update the existing 'user_infos' table entry to link to the new Supabase Auth user ID
    // and set app_user_id to NULL (as per your CHECK constraint)
    const { data: updatedUserInfo, error: updateUserInfoError } = await supabase
      .from('user_infos')
      .update({
        user_id: supabaseAuthUserId,
        app_user_id: null
      })
      .eq('app_user_id', appUser.app_user_id)
      .select('*')
      .single();

    if (updateUserInfoError) {
      console.error('Supabase update error during user_infos linking:', updateUserInfoError);
      throw createError({ statusCode: 500, statusMessage: updateUserInfoError.message });
    }

    // 5. Optionally, delete the old app_user record (since it's no longer the primary auth)
    // const { error: deleteAppUserError } = await supabase.from('app_users').delete().eq('id', appUser.app_user_id);
    // if (deleteAppUserError) { console.error('Failed to delete old app_user record:', deleteAppUserError); }

    return {
      message: 'Account successfully migrated to email. Please check your new email to confirm.',
      supabase_auth_id: supabaseAuthUserId,
      type: 'migration_success',
      profile: updatedUserInfo
    };
  } catch (err: any) {
    console.error('Server-side migration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal server error during account migration.',
    });
  }
});
