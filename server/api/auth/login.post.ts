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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Please register before logging in.',
      });
    }

    return { data, error };
  } catch (err: any) {
    console.error('Email login error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Login failed.',
    });
  }
});
