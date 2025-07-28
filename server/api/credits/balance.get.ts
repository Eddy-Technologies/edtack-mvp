import { getStripe } from '~~/server/utils/stripe';
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

    // Try to find existing customer by email (placeholder implementation)
    const customers = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
    });
    const customer = customers.data[0];
    if (!customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stripe customer not found'
      });
    }

    return {
      balance: customer.balance,
      currency: customer.currency ? customer.currency : 'SGD',
      customerId: customer.id // Include customer ID for caching
    };
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve credit balance'
    });
  }
});
