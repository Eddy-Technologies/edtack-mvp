import type Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const sessionId = query.session_id as string;

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing session_id parameter'
      });
    }

    const stripe = getStripe();

    // Retrieve the checkout session with expanded subscription data
    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    const priceId = session.subscription?.plan.id;
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });
    const product = price.product as Stripe.Product;

    // Format the response data
    const response = {
      status: session.status,
      customerEmail: session.customer_email || null,
      customerName: session.customer_details?.name || null,
      amountTotal: (session.amount_total! / 100).toFixed(2),
      currency: session.currency?.toUpperCase(),
      productName: product.name as string,
      productDescription: product.description || null,
      marketingFeatures: product.marketing_features.map((feature) => feature.name) || null,
      monthOrYear: price.recurring?.interval,
      amount: (price.unit_amount! / 100).toFixed(2),
    };

    return response;
  } catch (error: any) {
    console.error('Failed to retrieve checkout session:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve checkout session'
    });
  }
});
