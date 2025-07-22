import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(useRuntimeConfig().stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
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
    const { planType, userId } = body;

    if (!planType || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: planType and userId'
      });
    }

    // Get user info from Supabase
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, first_name, last_name, payment_customer_id')
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
      .from('user_emails')
      .select('email')
      .eq('user_info_id', userInfo.id)
      .eq('is_primary', true)
      .single();

    if (emailError || !userEmail) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User email not found'
      });
    }

    // Get subscription plan from database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Subscription plan not found'
      });
    }

    let customerId = userInfo.payment_customer_id;

    // Create or retrieve Stripe customer
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

    // Create Stripe Price if it doesn't exist
    const planId = plan.stripe_product_id;

    // Get Stripe Price
    const product = await stripe.products.retrieve(planId, {
      expand: ['default_price']
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price: product.default_price.id,
        },
      ],
      mode: 'subscription',
      success_url: `${useRuntimeConfig().public.baseUrl}/dashboard?tab=subscription&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${useRuntimeConfig().public.baseUrl}/subscription?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
      metadata: {
        user_info_id: userInfo.id,
        user_id: userId,
        plan_id: plan.id,
        plan_type: planType
      },
      subscription_data: {
        metadata: {
          user_info_id: userInfo.id,
          user_id: userId,
          plan_id: planId,
          plan_type: planType
        },
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error: any) {
    console.error('Stripe checkout error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create checkout session'
    });
  }
});
