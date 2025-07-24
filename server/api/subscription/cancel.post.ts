import type Stripe from 'stripe';
import { getStripe } from '../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
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
      .select('id, payment_customer_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Active subscription not found'
      });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id, {
      cancellation_details: {
        comment: reason || 'Cancelled by user'
      }
    });

    // Update subscription status in database
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    return {
      success: true,
      message: 'Subscription cancelled successfully'
    };
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to cancel subscription'
    });
  }
});
