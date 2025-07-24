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

    // Find customer by email
    const customer: Stripe.Customer = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
      expand: ['data.subscriptions']
    }).then((res) => res.data[0]);

    if (!customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found'
      });
    }
    return {
      id: customer.id,
      email: customer.email,
      subscriptions: customer.subscriptions?.data.map((sub) => ({
        id: sub.id,
        status: sub.status,
        plan: {
          id: sub.items.data[0].price.id,
          amount: sub.items.data[0].price.unit_amount,
          currency: sub.items.data[0].price.currency,
          interval: sub.items.data[0].price.recurring?.interval,
          product: sub.items.data[0].price.product
        }
      }))
    };
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});
