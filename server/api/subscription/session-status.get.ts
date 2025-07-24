import { getStripe } from '../../utils/stripe';
import type Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const query = getQuery(event);
    const sessionId = query.session_id as string;

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing session_id parameter'
      });
    }

    // Retrieve the checkout session with expanded line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price', 'line_items.data.price.product']
    });

    let planDetails = null;
    let invoiceDetails = null;

    // Extract plan and invoice details if session is complete
    if (session.status === 'complete' && session.line_items?.data.length) {
      const lineItem = session.line_items.data[0];
      const price = lineItem.price as Stripe.Price;
      const product = price?.product as Stripe.Product;

      if (product && price) {
        planDetails = {
          name: product.name,
          description: product.description,
          price: price.unit_amount ? (price.unit_amount / 100) : 0,
          currency: price.currency.toUpperCase(),
          interval: price.recurring?.interval || 'month',
          features: product.marketing_features?.map(f => f.name) || []
        };

        invoiceDetails = {
          amount_total: session.amount_total ? (session.amount_total / 100) : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          payment_method_types: session.payment_method_types || [],
          invoice_creation: session.invoice_creation,
          payment_status: session.payment_status
        };
      }
    }

    return {
      status: session.status,
      customer_email: session.customer_details?.email || null,
      client_secret: session.client_secret || null,
      plan: planDetails,
      invoice: invoiceDetails
    };
  } catch (error: any) {
    console.error('Session status retrieval error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to retrieve session status'
    });
  }
});