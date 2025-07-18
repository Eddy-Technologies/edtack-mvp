import { getSupabaseClient } from '~~/server/utils/authConfig';
import type { SignUpReq } from '~~/app/composables/useAuth';
import { USER_ROLE } from '~~/app/constants/User';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const body: SignUpReq = await readBody(event);

  // Simple validation
  const requiredFields = ['email', 'password', 'firstName', 'lastName', 'acceptTerms'];
  for (const field of requiredFields) {
    if (!body[field as keyof SignUpReq]) {
      throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` });
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address.' });
  }
  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters.' });
  }

  let supabaseUserId: string | undefined;
  try {
    // 1. Create user in Supabase Auth
    const { data: supabaseUser, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { first_name: body.firstName, last_name: body.lastName } },
    });
    if (authError || !supabaseUser.user) throw authError;
    supabaseUserId = supabaseUser.user.id;

    // 2. Call SQL function to insert all app tables in a single transaction
    const { error: appError } = await supabase.rpc(
      'register_user_app_tables',
      {
        p_user_id: supabaseUserId,
        p_first_name: body.firstName,
        p_last_name: body.lastName,
        p_email: body.email,
        p_user_role: body.userRole,
        p_student_level: body.userRole === USER_ROLE.STUDENT ? body.studentLevel : null,
      } as any
    );
    if (appError) {
      // Clean up Auth user if app table insert fails
      await supabase.auth.admin.deleteUser(supabaseUserId);
      throw createError({
        statusCode: 500,
        statusMessage: appError.message || 'Failed to create user profile.',
      });
    }

    return { user: supabaseUser.user };
  } catch (err: any) {
    // Clean up dangling auth user if created
    if (supabaseUserId) {
      try {
        await supabase.auth.admin.deleteUser(supabaseUserId);
      } catch (cleanupErr) {
        console.error('Failed to clean up auth user:', cleanupErr);
      }
    }
    console.error('Email registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Registration failed.',
    });
  }
});
