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
    const { userId, planType } = body;

    if (!userId || !planType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: userId, planType'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get user email
    const { data: userEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (emailError || !userEmail) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User email not found'
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

    // Create or get Stripe customer
    let customerId = userInfo.payment_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail.email,
        name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        metadata: {
          user_info_id: userInfo.id,
          user_id: userId
        }
      });
      customerId = customer.id;

      // Update user_infos with customer ID
      await supabase
        .from('user_infos')
        .update({ payment_customer_id: customerId })
        .eq('id', userInfo.id);
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

    // Create Setup Intent for saving payment method and immediate subscription
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        user_info_id: userInfo.id,
        user_id: userId,
        plan_id: plan.id,
        plan_type: planType,
        action: 'create_subscription'
      }
    });

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId,
      planDetails: {
        id: plan.id,
        name: plan.display_name,
        price: plan.price_sgd,
        interval: plan.interval_type
      }
    };
  } catch (error: any) {
    console.error('Custom checkout setup error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to setup custom checkout'
    });
  }
});
