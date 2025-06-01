import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event); // Use RLS-aware client
  const { firstName, lastName, username, password } = await readBody(event);

  // Validate required fields for registration
  if (!username || !password || !firstName || !lastName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username, password, first name, and last name are required for registration.',
    });
  }

  try {
    // 1. Check if username already exists in 'app_users' table
    const { data: userExists, error: selectError } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (selectError) {
      console.error('Supabase select error during username existence check:', selectError);
      throw createError({
        statusCode: 500,
        statusMessage: selectError.message,
      });
    }

    if (userExists && userExists.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already registered.',
      });
    }

    // 2. Hash the provided plain password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert new user into 'app_users' table (authentication credentials ONLY)
    const { data: newAppUser, error: insertAppUserError } = await supabase
      .from('app_users')
      .insert({
        username: username,
        encrypted_password: hashedPassword,
      })
      .select('id, username')
      .single();

    if (insertAppUserError || !newAppUser) {
      console.error('Supabase insert error during app_user registration:', insertAppUserError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create app user.',
      });
    }

    // 4. Insert profile data into 'user_infos' table, linked to the new app_user
    const { data: newUserInfo, error: insertUserInfoError } = await supabase
      .from('user_infos')
      .insert({
        app_user_id: newAppUser.id,
        first_name: firstName,
        last_name: lastName,
        onboarding_completed: false,
        is_active: true,
      })
      .select(
        'id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at'
      )
      .single();

    if (insertUserInfoError) {
      console.error('Supabase insert error during user_infos creation:', insertUserInfoError);
      // IMPORTANT: If user_infos creation fails, you might want to delete the app_user as well
      // to prevent orphaned records. This requires a transaction or a separate delete call.
      throw createError({
        statusCode: 500,
        statusMessage: insertUserInfoError.message,
      });
    }

    return {
      user: { ...newAppUser, user_info_id: newUserInfo.id, ...newUserInfo },
      type: 'app_user',
      message: 'Username registration successful!',
    };
  } catch (err: any) {
    console.error('Server-side username registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage:
        err.statusMessage || err.message || 'Internal server error during username registration.',
    });
  }
});
