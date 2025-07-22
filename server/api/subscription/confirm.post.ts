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
    const { setupIntentId, userId, planType } = body;

    if (!setupIntentId || !userId || !planType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: setupIntentId, userId, planType'
      });
    }

    // Retrieve the setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment method setup failed'
      });
    }

    if (!setupIntent.payment_method) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No payment method found'
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

    // Get subscription plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', planType)
      .single();

    if (planError || !plan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Subscription plan not found'
      });
    }

    // Get Stripe Price
    const product = await stripe.products.retrieve(plan.stripe_product_id, {
      expand: ['default_price']
    });

    if (!product.default_price) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Plan price not found in Stripe'
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: setupIntent.customer as string,
      items: [{
        price: (product.default_price as Stripe.Price).id
      }],
      default_payment_method: setupIntent.payment_method as string,
      metadata: {
        user_info_id: userInfo.id,
        user_id: userId,
        plan_id: plan.id,
        plan_type: planType,
        setup_intent_id: setupIntentId
      }
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      message: 'Subscription created successfully'
    };
  } catch (error: any) {
    console.error('Subscription confirmation error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to confirm subscription'
    });
  }
});
