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
      userInfo.payment_customer_id, {
        expand: ['subscriptions', 'delinquent', 'default_source', 'invoice_settings.default_payment_method']
      }
    );

    if (!customer || customer.deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stripe customer not found'
      });
    }

    // Get the active subscription if it exists
    const activeSubscription = customer.subscriptions?.data[0];

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      subscription: activeSubscription,
      defaultSource: customer.default_source,
      invoiceDefaultPaymentMethod: customer.invoice_settings?.default_payment_method,
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
