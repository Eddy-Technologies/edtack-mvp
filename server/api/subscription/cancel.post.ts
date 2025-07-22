import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(useRuntimeConfig().stripeSecretKey, {
  apiVersion: '2025-06-30.basil'
});

const supabase = createClient(
  useRuntimeConfig().private.supabaseUrl,
  useRuntimeConfig().private.supabaseServiceRoleKey
);

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    const body = await readBody(event);
    const { userId, reason } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: userId'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get current active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !subscription?.stripe_subscription_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe (at period end)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          cancellation_reason: reason || 'Customer requested'
        }
      }
    );

    // Update local database
    await supabase
      .from('user_subscriptions')
      .update({
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    return {
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period'
    };
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to cancel subscription'
    });
  }
});
