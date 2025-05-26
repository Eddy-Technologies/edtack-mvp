import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Comment out the real import
import type { H3Event } from 'h3';
import { JWT_SECRET, privilegedSupabaseClient, privilegedSupabaseClientStub } from '../../utils/authConfig';
// import { authenticateAppUserJWT } from '../../utils/authHelpers'; // Import helper
import type { Database } from '~/types/supabase';
import { serverSupabaseClient } from '#supabase/server';

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
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching app_users and user_infos)
  const { newEmail, currentPassword, newSupabasePassword } = await readBody(event);

  // 1. Authenticate the incoming request using the custom JWT for 'app_users'
  await authenticateAppUserJWT(event);
  const appUser = event.context.user; // Get authenticated app_user from middleware context

  // Validate required fields for migration
  if (!newEmail || !currentPassword || !newSupabasePassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New email, current password, and a new password for the email account are required for migration.',
    });
  }

  // Basic validation for the new password
  if (newSupabasePassword.length < 6) { // Example: Supabase default minimum is 6
    throw createError({
      statusCode: 400,
      statusMessage: 'The new password for the email account must be at least 6 characters long.',
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

    const passwordMatch = await bcrypt.compare(currentPassword, appUserRecord.encrypted_password);
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
      password: newSupabasePassword, // Use the new password for Supabase Auth
      options: {
        data: {
          username_migrated_from: appUserRecord.username, // Store old username for reference
          ...(userInfoForSupabase || {})
        }
      }
    });

    if (supabaseAuthError) {
      console.error('Supabase Auth signUp error during migration:', supabaseAuthError);
      // Handle specific error for email already existing in auth.users
      if (supabaseAuthError.message.includes('User already registered') || supabaseAuthError.message.includes('already exists')) {
        throw createError({
          statusCode: 409, // Conflict
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

    // 4. Update the existing 'user_infos' table entry to link to the new Supabase Auth user ID
    // and set app_user_id to NULL (as per your CHECK constraint)
    type UserInfosUpdate = Database['public']['Tables']['user_infos']['Update'];

    const updatePayload: UserInfosUpdate = {
      user_id: supabaseAuthUserId,
      app_user_id: null, // Explicitly null
    };

    const { data: updatedUserInfo, error: updateUserInfoError } = await supabase
      .from('user_infos')
      .update(updatePayload)
      .eq('app_user_id', appUser.app_user_id)
      .select('*')
      .single();

    if (updateUserInfoError) {
      console.error('Supabase update error during user_infos linking:', updateUserInfoError);
      // Attempt to delete the newly created Supabase Auth user if linking user_infos fails
      if (supabaseAuthUserId) {
        await privilegedSupabaseClient.auth.admin.deleteUser(supabaseAuthUserId);
        console.log(`Rolled back Supabase Auth user creation (ID: ${supabaseAuthUserId}) due to user_infos update failure.`);
      }
      throw createError({ statusCode: 500, statusMessage: updateUserInfoError.message });
    }

    // 5. Optionally, delete the old app_user record (since it's no longer the primary auth)
    // Using privileged client for this deletion as well
    const { error: deleteAppUserError } = await privilegedSupabaseClient
      .from('app_users')
      .delete()
      .eq('id', appUser.app_user_id);
    if (deleteAppUserError) { console.error('Failed to delete old app_user record after migration:', deleteAppUserError); }

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
