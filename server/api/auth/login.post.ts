import { isAuthError } from '@supabase/supabase-js';
import { getSupabaseClient, getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { convertAnonymousToUser } from '~~/server/services/anonymousConversionService';

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
      throw error; // This will be caught by the catch block
    }

    // Convert any anonymous threads to this user
    if (data.user) {
      const privilegedSupabase = getPrivilegedSupabaseClient(event);
      const { data: userInfo } = await privilegedSupabase
        .from('user_infos')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (userInfo?.id) {
        const conversionResult = await convertAnonymousToUser(event, userInfo.id);
        if (conversionResult.convertedThreads > 0) {
          console.log(`[Login] Converted ${conversionResult.convertedThreads} anonymous threads`);
        }
      }
    }

    return { data, error };
  } catch (err: any) {
    console.error('Email login error:', err);

    let message = '';
    let statusCode = err.status || 500;
    const statusMessage = err.statusMessage || 'Login failed.';

    if (isAuthError(err)) {
      if (err.status) {
        statusCode = err.status;
      }

      if (err.code === 'email_not_confirmed') {
        message = 'Email address not confirmed. Please check your inbox for the confirmation link.';
      } else if (err.code === 'invalid_credentials') {
        message = 'Invalid email or password.';
      } else if (err.code === 'email_address_invalid') {
        message = 'Invalid email address format. Please enter a valid email.';
      } else {
        message = 'An unexpected error occurred during login. Please try again later.';
      }
    }

    throw createError({
      statusCode: statusCode,
      statusMessage: statusMessage,
      message: message
    });
  }
});
