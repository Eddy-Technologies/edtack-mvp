export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get Stripe secret key from runtime config
    const config = useRuntimeConfig();
    const stripe = require('stripe')(config.stripeSecretKey);

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return { subscription: null, paymentMethod: null };
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return { subscription: null, paymentMethod: null };
    }

    const subscription = subscriptions.data[0];
    let paymentMethod = null;

    // Get payment method details if available
    if (subscription.default_payment_method) {
      paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method
      );
    }

    return {
      subscription,
      paymentMethod
    };
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});