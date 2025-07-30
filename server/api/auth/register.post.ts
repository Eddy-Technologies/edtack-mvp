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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

    // Create user email record
    const { error: emailError } = await supabase
      .from('user_emails')
      .insert({
        user_info_id: uuid,
        email: body.email,
        is_primary: true,
        created_at: new Date().toISOString()
      });

    if (emailError) {
      console.error('Error creating user_emails record:', emailError);
      // Don't throw error here as user_infos was created successfully
    }

    // Get the role ID and create user role assignment
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', body.userRole)
      .single();

    if (roleData) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_info_id: uuid,
          role_id: roleData.id
        });

      if (roleError) {
        console.error('Error creating user_roles record:', roleError);
        // Don't throw error here as user_infos was created successfully
      }
    }

    return { user };
  } catch (err: any) {
    console.error('Registration error:', {
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code,
      statusCode: err.statusCode,
      full_error: err
    });
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
