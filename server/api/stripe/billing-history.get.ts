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
      return { invoices: [] };
    }

    const customer = customers.data[0];

    // Get invoices for the customer
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 20
    });

    return {
      invoices: invoices.data
    };
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch billing history'
    });
  }
});