import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { codeService, getOperationTypes } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);

    // Get operation codes
    const operationCodes = await getOperationTypes(supabase);
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
    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo.payment_customer_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: userInfo.payment_customer_id, // Always charge the recipient
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            unit_amount: amount * 100, // Convert dollars to cents
            product_data: {
              name: 'Credit Top-up',
              description: `Add ${amount} SGD to your account`,
              metadata: {
                product_type: 'credit_topup',
                operation_type: operationCodes.credit_topup, // Use database-driven operation type
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
        recipient_customer_id: userInfo.payment_customer_id,
        amount: amount.toString(),
        user_id: user.id,
        operation_type: operationCodes.credit_topup, // Use database-driven operation type
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
