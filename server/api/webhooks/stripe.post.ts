import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { OPERATION_TYPE } from '~~/utils/stripe';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const body = await readRawBody(event);
    const signature = getHeader(event, 'stripe-signature');
    const webhookSecret = useRuntimeConfig().private.stripeWebhookSecret;
    const privilegedSupabase = await getPrivilegedSupabaseClient(event);

    if (!signature || !webhookSecret) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing stripe signature or webhook secret'
      });
    }

    // Verify webhook signature
    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body!, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      });
    }

    // Check if we've already processed this event (idempotency)
    const { data: existingEvent } = await privilegedSupabase
      .from('stripe_webhook_events')
      .select('processed')
      .eq('stripe_event_id', stripeEvent.id)
      .single();

    if (existingEvent?.processed) {
      return { received: true, message: 'Event already processed' };
    }

    // Store the event for idempotency
    await privilegedSupabase
      .from('stripe_webhook_events')
      .upsert({
        stripe_event_id: stripeEvent.id,
        event_type: stripeEvent.type,
        processed: false,
        data: JSON.stringify(stripeEvent.data.object),
      });

    // Process the event based on type
    try {
      switch (stripeEvent.type) {
        case 'customer.created':
          await handleCustomerEvent(privilegedSupabase, stripeEvent);
          break;

        case 'checkout.session.completed':
          await handleCheckoutCompleted(privilegedSupabase, stripeEvent);
          break;

        case 'customer_cash_balance_transaction.created':
          await handleCashBalanceTransaction(privilegedSupabase, stripeEvent);
          break;

        default:
          console.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      // Mark event as processed
      await privilegedSupabase
        .from('stripe_webhook_events')
        .update({ processed: true })
        .eq('stripe_event_id', stripeEvent.id);

      return { received: true };
    } catch (processingError) {
      console.error(`Error processing ${stripeEvent.type}:`, processingError);

      // Don't mark as processed if there was an error
      throw createError({
        statusCode: 500,
        statusMessage: `Error processing ${stripeEvent.type}`
      });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed'
    });
  }
});

// Handle customer creation (backup mechanism for edge cases)
async function handleCustomerEvent(supabase: SupabaseClient, event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;

  if (!customer.email) {
    console.log('Customer has no email, skipping user update');
    return;
  }

  // Find user by email and update payment_customer_id
  const { data: userInfo, error } = await supabase
    .from('all_users')
    .select('id, payment_customer_id')
    .eq('email', customer.email)
    .single();

  if (error || !userInfo) {
    console.log(`No user found with email ${customer.email}`);
    return;
  }
  if (userInfo.payment_customer_id) {
    console.log(`User ${userInfo.id} already has a payment_customer_id, skipping update`);
    return; // Already has a customer ID, no need to update
  }

  await supabase
    .from('user_infos')
    .update({ payment_customer_id: customer.id })
    .eq('id', userInfo.id);

  console.log(`Updated payment_customer_id for user ${userInfo.id}`);
}

// Handle completed checkout sessions
async function handleCheckoutCompleted(supabase: SupabaseClient, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.customer || !session.payment_intent) {
    console.log('Checkout session missing customer or payment_intent');
    return;
  }

  // Find user directly by payment_customer_id (much faster and more reliable)
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', session.customer)
    .single();

  if (error || !userInfo) {
    console.log(`No user found with payment_customer_id ${session.customer}`);
    return;
  }

  // Check if this is a credit purchase (based on metadata or line items)
  if (session.metadata?.operation_type === OPERATION_TYPE.CREDIT_TOPUP || session.mode === 'payment') {
    // Create credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: userInfo.id,
        transaction_type: OPERATION_TYPE.CREDIT_TOPUP,
        amount: session.amount_total,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        description: `Credit purchase via Stripe`,
        metadata: {
          stripe_session: session.id,
          amount_sgd_cents: session.amount_total,
        }
      });

    console.log(`Created credit transaction for user ${userInfo.id}: ${session.amount_total} cents or ${session.amount_total / 100} SGD, type: ${OPERATION_TYPE.CREDIT_TOPUP}`);
  }

  // Check if this is a product purchase
  if (session.metadata?.product_id) {
    const productId = session.metadata.product_id;
    const quantity = parseInt(session.metadata?.quantity || '1');
    const unitPrice = Math.floor((session.amount_total || 0) / quantity);

    // Create purchase record
    const { data: purchase } = await supabase
      .from('user_purchases')
      .insert({
        user_info_id: userInfo.id,
        product_id: productId,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        status: 'completed',
        quantity,
        unit_price_cents: unitPrice,
        total_amount_cents: session.amount_total || 0,
        currency: session.currency?.toUpperCase() || 'SGD'
      })
      .select()
      .single();
  }
}

// Handle customer cash balance transactions (transfers)
async function handleCashBalanceTransaction(supabase: SupabaseClient, event: Stripe.Event) {
  const transaction = event.data.object as Stripe.CustomerCashBalanceTransaction;

  if (!transaction.customer) {
    console.log('Cash balance transaction has no customer, skipping');
    return;
  }

  // Find user by payment_customer_id
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', transaction.customer as string)
    .single();

  if (error || !userInfo) {
    console.log(`No user found with payment_customer_id ${transaction.customer}`);
    return;
  }

  // Parse transfer information from description
  const description = transaction.description || '';
  let transactionType = OPERATION_TYPE.BALANCE_ADJUSTMENT;
  let transferMetadata = {};

  if (description.includes('Transfer') && description.includes('credits to child')) {
    transactionType = OPERATION_TYPE.TRANSFER_OUT;
    // Extract child info from description if available
    const childMatch = description.match(/Transfer (\d+) credits to child/);
    if (childMatch) {
      transferMetadata = {
        transfer_type: 'parent_to_child',
        credits_transferred: childMatch[1]
      };
    }
  } else if (description.includes('Received') && description.includes('credits from parent')) {
    transactionType = OPERATION_TYPE.TRANSFER_IN;
    // Extract parent info from description if available
    const parentMatch = description.match(/Received (\d+) credits from parent/);
    if (parentMatch) {
      transferMetadata = {
        transfer_type: 'parent_to_child',
        credits_received: parentMatch[1]
      };
    }
  }

  // Create credit transaction record
  await supabase
    .from('credit_transactions')
    .insert({
      user_info_id: userInfo.id,
      transaction_type: transactionType,
      amount: transaction.net_amount,
      stripe_payment_intent_id: transaction.id,
      stripe_checkout_session_id: transaction.id,
      description: description,
      metadata: {
        stripe_customer_id: transaction.customer,
        currency: transaction.currency,
        ...transferMetadata
      }
    });

  console.log(`Created credit transaction for user ${userInfo.id}: ${transaction.net_amount} ${transaction.currency}, type: ${transactionType}`);
}
