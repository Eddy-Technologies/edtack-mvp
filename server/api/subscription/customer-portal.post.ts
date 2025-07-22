import { getStripe } from '../../plugins/stripe';
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
