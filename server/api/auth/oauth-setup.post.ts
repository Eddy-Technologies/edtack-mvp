import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { serverSupabaseUser } from '#supabase/server';
import { createStripeCustomer } from '~~/server/utils/stripe';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const uuid: string = uuidv4();
  try {
    // Get the authenticated user from Supabase
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    // Check if user_infos record already exists
    const { data: existingUserInfo } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingUserInfo) {
      // User profile already exists

      // Check if user has Stripe customer ID, create if missing
      if (!existingUserInfo.payment_customer_id && user.email) {
        const firstName = user.user_metadata?.first_name ||
          user.user_metadata?.given_name ||
          user.user_metadata?.full_name?.split(' ')[0] ||
          null;
        const lastName = user.user_metadata?.last_name ||
          user.user_metadata?.family_name ||
          user.user_metadata?.full_name?.split(' ').slice(1).join(' ') ||
          null;

        const customerId = await createStripeCustomer({
          email: user.email,
          firstName,
          lastName,
          user_info_id: existingUserInfo.id
        });

        if (customerId) {
          // Update user_infos with new customer ID
          await supabase
            .from('user_infos')
            .update({ payment_customer_id: customerId })
            .eq('id', existingUserInfo.id);

          console.log(`Added Stripe customer ID ${customerId} to existing user ${existingUserInfo.id}`);
        }
      }

      return { message: 'User profile already exists', user_info_id: existingUserInfo.id };
    }

    // Extract name from OAuth provider metadata
    const firstName = user.user_metadata?.first_name ||
      user.user_metadata?.given_name ||
      user.user_metadata?.full_name?.split(' ')[0] ||
      null;
    const lastName = user.user_metadata?.last_name ||
      user.user_metadata?.family_name ||
      user.user_metadata?.full_name?.split(' ').slice(1).join(' ') ||
      null;

    // Create Stripe customer for new user
    let paymentCustomerId: string | null = null;
    if (user.email) {
      paymentCustomerId = await createStripeCustomer({
        email: user.email,
        firstName,
        lastName,
        user_info_id: uuid
      });
    }

    // Create user_infos record
    const { data: newUserInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .insert({
        id: uuid,
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        payment_customer_id: paymentCustomerId,
        is_active: true,
        onboarding_completed: false, // OAuth users need to complete onboarding
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
        user_info_id: newUserInfo.id,
        email: user.email!, // Email is guaranteed to be present
        is_primary: true,
        created_at: new Date().toISOString(),
      });

    if (emailError) {
      console.error('Error creating user_emails record:', emailError);
      // Don't throw error here as user_infos was created successfully
    }

    return {
      message: 'User profile created successfully',
      user_info_id: newUserInfo.id,
      first_name: firstName,
      last_name: lastName,
      onboarding_required: true
    };
  } catch (err: any) {
    // If the error is already a H3Error (from createError), re-throw it
    if (err.statusCode) {
      throw err;
    }
    console.error('[oauth-setup.post.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred during OAuth user setup.',
    });
  }
});
