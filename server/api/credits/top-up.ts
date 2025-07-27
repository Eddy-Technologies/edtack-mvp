import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);
    const { amount, recipient_type } = body;
    const baseUrl = useRuntimeConfig().public.baseUrl;

    // Validate input
    if (!amount || amount < 1 || amount > 500) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid amount. Must be between $1 and $500.'
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }
    const customers = await stripe.customers.list({
      email: user.email, // Use actual user email
      limit: 1
    });

    if (customers.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stripe customer not found'
      });
    }

    // Determine recipient customer ID for metadata
    const recipientCustomerId = customers.data[0].id;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: recipientCustomerId, // Always charge the recipient
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            unit_amount: amount * 100, // Convert dollars to cents
            product_data: {
              name: 'Credit Top-up',
              description: `Add ${amount} SGD to your account`,
              metadata: {
                product_type: 'credit_topup'
              }
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?tab=credits`,
      metadata: {
        recipient_type,
        recipient_customer_id: recipientCustomerId,
        amount: amount.toString(),
        credits: (amount * 10).toString(), // 1 USD = 10 credits
        user_id: user.id,
        operation_type: 'topup'
      },
    });

    return {
      url: session.url,
      session_id: session.id
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    });
  }
});
