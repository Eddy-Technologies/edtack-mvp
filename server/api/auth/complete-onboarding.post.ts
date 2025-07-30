import { getSupabaseClient } from '~~/server/utils/authConfig';
import { serverSupabaseUser } from '#supabase/server';
import { createStripeCustomer } from '~~/server/utils/stripe';
import { USER_ROLE } from '~/constants/User';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const body = await readBody(event);

  try {
    // Get the authenticated user
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    // Validate required fields
    if (!body.userRole) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User role is required'
      });
    }

    if (body.userRole === USER_ROLE.STUDENT && !body.studentLevel) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Student level is required for student accounts'
      });
    }

    if (!body.acceptTerms) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Terms and conditions must be accepted'
      });
    }

    // Get user's current user_infos record or create if it doesn't exist
    let { data: userInfo } = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userInfo?.onboarding_completed) {
      console.error('Onboarding already completed for user:', user.id);
      // Return early if onboarding is already completed
      return {
        message: 'Onboarding already completed',
      };
    }

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();

    // Create userInfo if it doesn't exist
    if (!userInfo) {
      const userInfoId = crypto.randomUUID();

      // Role assignment will be handled automatically by the handle_new_user_info trigger

      // Create Stripe customer
      const stripeCustomerId = await createStripeCustomer({
        email: user.email!,
        firstName,
        lastName,
        user_info_id: userInfoId
      });

      // Insert new user_info record
      const { data: newUserInfo, error: insertError } = await supabase
        .from('user_infos')
        .insert({
          id: userInfoId,
          user_id: user.id,
          onboarding_completed: true,
          first_name: firstName,
          last_name: lastName,
          payment_customer_id: stripeCustomerId,
          level_type: body.studentLevel || null,
          is_active: true,
          raw_user_meta_data: {
            user_role: body.userRole,
          }
        })
        .select('*')
        .single();

      if (insertError || !newUserInfo) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create user profile'
        });
      }

      // user_roles will be created automatically by the handle_new_user_info trigger
      userInfo = newUserInfo;
    }

    return {
      message: 'Onboarding completed successfully',
      user_info_id: userInfo.id,
      user_role: body.userRole,
      student_level: body.studentLevel || null,
      onboarding_completed: true
    };
  } catch (err: any) {
    // If the error is already a H3Error (from createError), re-throw it
    if (err.statusCode) {
      throw err;
    }
    console.error('[complete-onboarding.post.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred during onboarding completion.',
    });
  }
});
