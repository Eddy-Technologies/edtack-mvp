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
    const { userId, newPlanType } = body;

    if (!userId || !newPlanType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: userId, newPlanType'
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

    // Get target plan
    const { data: targetPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', newPlanType)
      .single();

    if (planError || !targetPlan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Plan not found'
      });
    }

    // Get current active subscription
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, plan_id')
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !currentSubscription?.stripe_subscription_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No active subscription found'
      });
    }

    // Get the target plan's Stripe price
    const product = await stripe.products.retrieve(targetPlan.stripe_product_id, {
      expand: ['default_price']
    });

    if (!product.default_price) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Target plan price not found in Stripe'
      });
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripe_subscription_id,
      {
        items: [{
          id: (await stripe.subscriptions.retrieve(currentSubscription.stripe_subscription_id)).items.data[0].id,
          price: (product.default_price as Stripe.Price).id,
        }],
        proration_behavior: 'create_prorations',
        metadata: {
          previous_plan_id: currentSubscription.plan_id,
          new_plan_id: targetPlan.id,
          upgrade_timestamp: new Date().toISOString()
        }
      }
    );

    // Update local database
    await supabase
      .from('user_subscriptions')
      .update({
        plan_id: targetPlan.id,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', currentSubscription.stripe_subscription_id);

    return {
      success: true,
      message: 'Plan upgraded successfully',
      newPlan: targetPlan
    };
  } catch (error: any) {
    console.error('Plan upgrade error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to upgrade plan'
    });
  }
});
