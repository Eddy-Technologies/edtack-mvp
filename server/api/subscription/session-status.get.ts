import { getStripe } from '../../utils/stripe';

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

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      status: session.status,
      customer_email: session.customer_details?.email || null,
      client_secret: session.client_secret || null,
    };
  } catch (error: any) {
    console.error('Session status retrieval error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to retrieve session status'
    });
  }
});