import type Stripe from 'stripe';
import { getStripe } from '../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);
    const { setupIntentId, userId, planType } = body;

    if (!setupIntentId || !userId || !planType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: setupIntentId, userId, planType'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo.payment_customer_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: userInfo.payment_customer_id,
      price: planType,

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
