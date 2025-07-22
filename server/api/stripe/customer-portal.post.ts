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
    const { userId } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: userId'
      });
    }

    // Get user info from Supabase
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

    // Create Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userInfo.payment_customer_id,
      return_url: `${useRuntimeConfig().public.baseUrl}/dashboard?tab=subscription`,
    });

    return {
      url: session.url
    };

  } catch (error: any) {
    console.error('Customer portal error:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create customer portal session'
    });
  }
});