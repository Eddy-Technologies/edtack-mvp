import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const { email, password, firstName, lastName } = await readBody(event);

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, password, first name, and last name are required for registration.',
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a valid email address.',
    });
  }

  // Password validation
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters long.',
    });
  }

  try {
    // 1. Create user in Supabase auth
    const { data: newUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError || !newUser.user) {
      console.error('Supabase auth.signUp error:', authError);
      throw createError({
        statusCode: 400,
        statusMessage: authError ? authError.message : 'Failed to create user.'
      });
    }

    //  Insert profile data into 'user_infos' table, linked to the new app_user
    const { data: newUserInfo, error: insertUserInfoError } = await supabase
      .from('user_infos')
      .insert({
        user_id: newUser.user.id,
        first_name: firstName,
        last_name: lastName,
        onboarding_completed: false,
        is_active: true,
      })
      .select(
        'id, first_name, last_name, gender, address, country_code, postal_code, date_of_birth, level_type, profile_picture_url, onboarding_completed, payment_customer_id, is_active, created_at, updated_at'
      )
      .single();

    if (insertUserInfoError || !newUserInfo) {
      console.error('Supabase insert error during user_info registration:', insertUserInfoError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user profile.',
      });
    }

    return {
      user: { ...newUser, user_info_id: newUserInfo.id, ...newUserInfo },
      type: 'user',
      message: 'Username registration successful!',
      session: newUser.session,
    };
  } catch (err: any) {
    console.error('Email registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Registration failed.',
    });
  }
});
