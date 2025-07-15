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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.error('Supabase auth.signUp error:', authError);
      throw createError({
        statusCode: 400,
        statusMessage: authError.message,
      });
    }

    if (!authData.user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to create user account.',
      });
    }

    // 2. Fetch user profile data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found.',
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email
      },
      session: authData.session,
    };
  } catch (err: any) {
    console.error('Email registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Registration failed.',
    });
  }
});
