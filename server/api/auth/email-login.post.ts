import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const { email, password } = await readBody(event);

  // Validate required fields
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required for login.',
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

  try {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!authData.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Please register before logging in.',
      });
    }

    if (authError) {
      console.error('Supabase auth.signInWithPassword error:', authError);
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password.',
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

    setCookie(event, 'supabase_access_token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return {
      user: {
        id: user.id,
        email: user.email
      },
      session: authData.session,
    };
  } catch (err: any) {
    console.error('Email login error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Login failed.',
    });
  }
});
