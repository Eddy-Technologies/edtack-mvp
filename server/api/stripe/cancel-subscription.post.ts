export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const body = await readBody(event);
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    if (!body.subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Subscription ID is required'
      });
    }

    // Get Stripe secret key from runtime config
    const config = useRuntimeConfig();
    const stripe = require('stripe')(config.stripeSecretKey);

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(body.subscriptionId, {
      cancel_at_period_end: true
    });

    return {
      success: true,
      subscription
    };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cancel subscription'
    });
  }
});