import type Stripe from 'stripe';
import { getStripe } from '../../plugins/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);
    const { action, userId } = body;

    if (!action || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: action, userId'
      });
    }

    // Route to appropriate handler based on action
    switch (action) {
      case 'cancel':
        return await handleCancel(supabase, stripe, body);
      case 'upgrade':
        return await handleUpgrade(supabase, stripe, body);
      case 'update-payment':
        return await handleUpdatePayment(supabase, stripe, body);
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action. Must be: cancel, upgrade, or update-payment'
        });
    }
  } catch (error: any) {
    console.error('Subscription management error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to manage subscription'
    });
  }
});

// Handle subscription cancellation
async function handleCancel(supabase: any, stripe: Stripe, body: any) {
  const { userId, reason } = body;

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

  // Cancel subscription in Stripe
  await stripe.subscriptions.cancel(userInfo., {
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
}

// Handle subscription upgrade
async function handleUpgrade(supabase: any, stripe: any, body: any) {
  const { userId, newPlanType } = body;

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

  // Get new plan details
  const { data: newPlan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('plan_type', newPlanType)
    .single();

  if (planError || !newPlan) {
    throw createError({
      statusCode: 404,
      statusMessage: 'New subscription plan not found'
    });
  }

  // Get current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

  // Update subscription in Stripe
  const updatedSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    items: [{
      id: stripeSubscription.items.data[0].id,
      price: newPlan.stripe_price_id
    }],
    proration_behavior: 'create_prorations'
  });

  // Update subscription in database
  await supabase
    .from('user_subscriptions')
    .update({
      plan_id: newPlan.id,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.stripe_subscription_id);

  return {
    success: true,
    message: 'Subscription upgraded successfully',
    subscriptionId: updatedSubscription.id
  };
}

// Handle payment method update
async function handleUpdatePayment(supabase: any, stripe: any, body: any) {
  const { userId, paymentMethodId } = body;

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

  // Update customer's default payment method
  await stripe.customers.update(userInfo.payment_customer_id, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });

  // Get current subscription to update its default payment method
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_subscription_id')
    .eq('user_info_id', userInfo.id)
    .eq('status', 'active')
    .single();

  if (subscription) {
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      default_payment_method: paymentMethodId
    });
  }

  return {
    success: true,
    message: 'Payment method updated successfully'
  };
}
