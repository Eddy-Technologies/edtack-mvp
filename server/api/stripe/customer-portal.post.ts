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
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found'
      });
    }

    const customer = customers.data[0];

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${getOrigin(event)}/dashboard?tab=subscription`
    });

    return {
      url: session.url
    };
  } catch (error) {
    console.error('Failed to create customer portal session:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create customer portal session'
    });
  }

  function getOrigin(event: any) {
    const headers = getHeaders(event);
    const protocol = headers['x-forwarded-proto'] || 'http';
    const host = headers.host || headers['x-forwarded-host'];
    return `${protocol}://${host}`;
  }
});