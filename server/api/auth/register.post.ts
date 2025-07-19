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
  if (!Object.values(USER_ROLE).includes(body.userRole as USER_ROLE)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user role.' });
  }
  if (body.userRole === USER_ROLE.STUDENT && !body.studentLevel) {
    throw createError({ statusCode: 400, statusMessage: 'Student level is required for students.' });
  }
  if (!body.acceptTerms) {
    throw createError({ statusCode: 400, statusMessage: 'You must accept the terms and conditions.' });
  }

  try {
    // Create user in Supabase Auth - database trigger will handle user_infos creation
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          user_role: body.userRole,
          student_level: body.studentLevel || null,
        }
      },
    });

    if (error || !data) {
      throw error; // This will be caught by the catch block
    }
    return { user: data.user };
  } catch (err: any) {
    console.error('Registration error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Registration failed.',
    });
  }
});
