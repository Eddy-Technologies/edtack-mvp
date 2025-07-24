import type Stripe from 'stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    const userInfo = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (!userInfo.data || !userInfo.data?.payment_customer_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User payment information not found'
      });
    }
    // Find customer by email
    const customer: Stripe.Customer = await stripe.customers.retrieve(userInfo.data.payment_customer_id, {
      expand: ['subscriptions']
    });
    // filter active subscription
    const activeSubscription = customer.subscriptions?.data.find((sub) => sub.status === 'active');
    return activeSubscription || null;
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});
