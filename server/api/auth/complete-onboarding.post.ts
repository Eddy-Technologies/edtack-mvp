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

      // Create Stripe customer
      const stripeCustomerId = await createStripeCustomer({
        email: user.email!,
        firstName,
        lastName,
        user_info_id: userInfoId
      });

      // Use RPC to atomically create user_infos with relations
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_user_info_with_relations', {
        p_user_info_id: userInfoId,
        p_user_id: user.id,
        p_first_name: firstName,
        p_last_name: lastName,
        p_level_type: body.studentLevel || null,
        p_payment_customer_id: stripeCustomerId,
        p_is_active: true,
        p_onboarding_completed: true,
        p_role_name: body.userRole,
        p_email: user.email
      });

      if (rpcError || !rpcResult) {
        console.error('Error creating user profile via RPC:', rpcError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create user profile'
        });
      }

      // Set userInfo from RPC result
      userInfo = rpcResult.user_info;
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
