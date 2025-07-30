import { getSupabaseClient } from '~~/server/utils/authConfig';
import type { SignUpReq } from '~~/app/composables/useAuth';
import { USER_ROLE } from '~~/app/constants/User';
import { validateEmail, validatePassword } from '~~/utils/validation';
import { createStripeCustomer } from '~~/server/utils/stripe';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const body: SignUpReq = await readBody(event);
  const uuid: string = crypto.randomUUID();

  // Simple validation
  const requiredFields = ['email', 'password', 'firstName', 'lastName', 'acceptTerms'];
  for (const field of requiredFields) {
    if (!body[field as keyof SignUpReq]) {
      throw createError({ statusCode: 400, statusMessage: `Missing required field: ${field}` });
    }
  }
  const emailValidation = validateEmail(body.email);
  if (!emailValidation.isValid) {
    throw createError({ statusCode: 400, statusMessage: emailValidation.error });
  }
  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.isValid) {
    throw createError({ statusCode: 400, statusMessage: passwordValidation.error });
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
    // Create user in Supabase Auth
    const { data: { user }, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (error || !user) {
      console.error('Supabase signUp error:', error);
      throw createError({
        statusCode: error?.status || 500,
        statusMessage: error?.message || 'Failed to create user.'
      });
    }

    // Create Stripe customer for new registration user
    const paymentCustomerId = await createStripeCustomer({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      user_info_id: uuid
    });

    // Get the role ID first for the trigger to use
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', body.userRole)
      .single();

    if (!roleData) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid user role: ${body.userRole}`
      });
    }

    // Create user_infos record with all registration data
    const { data: newUserInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .insert({
        id: uuid,
        user_id: user.id,
        first_name: body.firstName,
        last_name: body.lastName,
        level_type: body.studentLevel || null,
        payment_customer_id: paymentCustomerId,
        is_active: true,
        onboarding_completed: true, // Registration users complete onboarding during signup
        raw_user_meta_data: {
          user_role: body.userRole,
        }
      })
      .select('id')
      .single();

    if (userInfoError || !newUserInfo) {
      console.error('Error creating user_infos record:', userInfoError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user profile'
      });
    }

    return { user };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || err.statusMessage || 'Registration failed.',
      data: {
        details: err.details,
        hint: err.hint,
        code: err.code
      }
    });
  }
});
