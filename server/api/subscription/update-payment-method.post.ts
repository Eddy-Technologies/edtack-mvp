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
    const { userId, paymentMethodId } = body;

    if (!userId || !paymentMethodId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: userId, paymentMethodId'
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

    if (!userInfo.payment_customer_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User does not have a Stripe customer ID'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: userInfo.payment_customer_id
    });

    // Set as default payment method for invoices
    await stripe.customers.update(userInfo.payment_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Update default payment method on active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active');

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      for (const subscription of activeSubscriptions) {
        if (subscription.stripe_subscription_id) {
          await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            default_payment_method: paymentMethodId
          });
        }
      }
    }

    return {
      success: true,
      message: 'Payment method updated successfully'
    };
  } catch (error: any) {
    console.error('Payment method update error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to update payment method'
    });
  }
});
