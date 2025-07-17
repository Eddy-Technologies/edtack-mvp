import { getSupabaseClient } from '~~/server/utils/authConfig';
import type { SignUpInput } from '~~/app/composables/useAuth';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const { email, password, firstName, lastName, onboardingData }: SignUpInput = await readBody(event);

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !onboardingData) {
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

    if (authError || !newUser.user) throw authError;

    // Get role_id from roles table
    const { data: roleData, error: roleFetchError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', onboardingData.userRole)
      .single();
    if (roleFetchError) throw roleFetchError;

    // Create user profile in user_infos table
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .insert({
        user_id: newUser.user.id,
        first_name: firstName,
        last_name: lastName,
        level_type: onboardingData?.studentLevel,
        onboarding_completed: true,
        is_active: true,
      })
      .select()
      .single();

    if (userInfoError) throw userInfoError;

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_info_id: userInfo.id,
        role_id: roleData.id,
      });
    if (roleError) throw roleError;

    // setCookie(event, 'supabase_access_token', newUser.session.access_token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    //   path: '/',
    //   sameSite: 'lax',
    // });

    return newUser;
  } catch (err: any) {
    console.error('Email registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Registration failed.',
    });
  }
});
