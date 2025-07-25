import type Stripe from 'stripe';
import { getSupabaseClient } from '#imports';
import { getPriceWithProductByPriceId } from '~~/server/utils/stripe';

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

    // Find customer by email
    const customer: Stripe.Customer = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
      expand: ['data.subscriptions']
    }).then((res) => res.data[0]);

    if (!customer) {
      return null; // No customer found, return null
    }

    const activeSubscription = customer.subscriptions?.data.find((sub) => sub.status === 'active');
    if (!activeSubscription) {
      return 'CUSTOMER_HAS_NO_ACTIVE_SUBSCRIPTION'; // No active subscription found
    }

    const price = await getPriceWithProductByPriceId(activeSubscription.plan.id);
    return {
      id: customer.id,
      email: customer.email,
      subscriptionId: activeSubscription.id,
      subscriptionStatus: activeSubscription.status,
      ...price
    };
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});
