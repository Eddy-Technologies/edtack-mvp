import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const query = getQuery(event);
    const { session_id } = query;

    if (!session_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Session ID is required'
      });
    }

    // Retrieve and validate checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ['payment_intent']
    });

    if (session.payment_status !== 'paid') {
      // Redirect to dashboard with error
      return sendRedirect(event, `/dashboard?tab=credits&error=payment_failed`);
    }

    // Extract metadata from session
    const { recipient_customer_id, amount } = session.metadata || {};

    const sgdAmount = parseInt(amount || '0');

    // Add credits to recipient's Stripe Customer Balance
    const recipientCustomerId = recipient_customer_id || session.customer as string;

    // Verify customer exists before creating balance transaction
    let customer;
    try {
      customer = await stripe.customers.retrieve(recipientCustomerId);
      console.log(`Customer found: ${customer.id}, current balance: ${customer.balance}`);
    } catch (customerError) {
      console.error('Customer not found:', customerError);
      return sendRedirect(event, `/dashboard?tab=credits&error=customer_not_found`);
    }

    try {
      // Validate we have amount to add
      if (sgdAmount <= 0) {
        throw new Error(`Invalid SGD amount: ${sgdAmount}`);
      }

      // Convert SGD amount to cents for Stripe balance transaction
      // Note: For customer balance, positive amount = credit added to customer
      const sgdAmountInCents = sgdAmount * 100;

      if (sgdAmountInCents <= 0) {
        throw new Error(`Invalid SGD amount in cents: ${sgdAmountInCents}`);
      }

      // Add SGD balance to Stripe Customer Balance
      // Positive amount = customer gets store credit
      const balanceTransaction = await stripe.customers.createBalanceTransaction(recipientCustomerId, {
        amount: sgdAmountInCents,
        currency: 'sgd',
        description: `Top-up: $${sgdAmount} SGD`,
        metadata: {
          operation_type: (await getCodes(supabase, 'operation_type')).credit_topup,
          payment_intent_id: typeof session.payment_intent === 'string' ?
            session.payment_intent :
            session.payment_intent?.id || '',
          sgd_amount: sgdAmount.toString()
        }
      });

      console.log(`Successfully added ${sgdAmountInCents} cents (${sgdAmount} SGD) to customer ${recipientCustomerId}. Balance transaction ID: ${balanceTransaction.id}`);
    } catch (balanceError) {
      console.error('Failed to add SGD balance to Stripe balance:', balanceError);
      // Continue anyway - webhook will handle the transaction record
    }

    // Note: Database credit_transactions record is handled by webhook
    // This endpoint only handles Stripe customer balance operations

    // Redirect to dashboard with success message
    const redirectUrl = `/dashboard?tab=credits&success=true&amount=${sgdAmount}`;
    return sendRedirect(event, redirectUrl);
  } catch (error) {
    console.error('Failed to process payment success:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process payment'
    });
  }
});
