import type Stripe from 'stripe';
import { getStripe } from '../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const query = getQuery(event);
    const userId = query.userId as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: userId'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo.payment_customer_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User payment_customer_id not found'
      });
    }

    // Get Stripe Customer with expanded subscriptions and payment sources
    const customer = await stripe.customers.retrieve(
      userInfo.payment_customer_id,
      {
        expand: ['subscriptions']
      }
    );

    if (!customer || customer.deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stripe customer not found'
      });
    }

    // Filter subscription - by default each user only can have one active subscription
    const subscriptionsList = customer.subscriptions?.data || [];
    const filterSubscriptions = () => {
      if (subscriptionsList.length > 1) {
        return subscriptionsList.filter((sub) => sub.status === 'active')[0];
      }
      return subscriptionsList[0];
    };
    const subscription = filterSubscriptions();
    // To get plan details, use subscription?.items?.data[0]?.plan if items exist
    const plan = subscription?.items?.data[0]?.plan;
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      subscriptionDisplayName: subscription?.metadata.display_name || null,
      plan: plan || null,
      delinquent: customer.delinquent
    };
  } catch (error: any) {
    console.error('Customer fetch error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to get customer information'
    });
  }
});
