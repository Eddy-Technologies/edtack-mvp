import type Stripe from 'stripe';
import { getSupabaseClient } from '#imports';
import { getPriceWithProductByPriceId } from '~~/server/utils/stripe';
import { STRIPE_CUSTOMER } from '~~/shared/constants';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const user = await requireAuth(event);

    // Find customer by email
    const customer: Stripe.Customer = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
      expand: ['data.subscriptions']
    }).then((res) => res.data[0]);

    if (!customer) {
      return { stripeCustomerState: STRIPE_CUSTOMER.NOT_EXISTENT }; // No customer found, return null
    }

    const activeSubscription = customer.subscriptions?.data.find((sub) => sub.status === 'active');
    if (!activeSubscription) {
      return { stripeCustomerState: STRIPE_CUSTOMER.NO_ACTIVE_SUBSCRIPTION, email: customer.email }; // No active subscription found
    }

    const price = await getPriceWithProductByPriceId(activeSubscription.plan.id);
    return {
      ...price,
      stripeCustomerState: STRIPE_CUSTOMER.WITH_ACTIVE_SUBSCRIPTION,
      email: customer.email,
      id: customer.id,
      subscriptionId: activeSubscription.id,
      subscriptionStatus: activeSubscription.status,
    };
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});
