import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getCodes, getOperationTypes } from '~~/server/services/codeService';

// Generate order number function
function generateOrderNumber(): string {
  const now = new Date();
  const yearMonth = now.getFullYear().toString() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6); // Use last 6 digits of timestamp for uniqueness
  return `ORD-${yearMonth}-${timestamp}`;
}

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
      .select('id')
      .eq('stripe_event_id', stripeEvent.id)
      .single();

    if (existingEvent) {
      return { received: true, message: 'Event already processed' };
    }

    // Process the event based on type - only store events we actually handle
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
          // Don't store unhandled event types
          return { received: true, message: 'Event type not handled' };
      }

      // Store the event after successful processing
      await privilegedSupabase
        .from('stripe_webhook_events')
        .insert({
          stripe_event_id: stripeEvent.id,
          event_type: stripeEvent.type,
          processed: true,
          data: JSON.stringify(stripeEvent.data.object),
        });

      return { received: true };
    } catch (processingError) {
      console.error(`Error processing ${stripeEvent.type}:`, processingError);

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
  console.log('Handling customer.created event');
  const customer = event.data.object as Stripe.Customer;

  if (!customer.email) {
    console.log(`[StripeWebhook] Customer has no email, skipping user update`);
    return;
  }

  // Find user by email and update payment_customer_id
  const { data: userInfo, error } = await supabase
    .from('all_users')
    .select('id, payment_customer_id')
    .eq('email', customer.email)
    .single();

  if (error || !userInfo) {
    console.log(`[StripeWebhook] No user found with email ${customer.email}`);
    return;
  }
  if (userInfo.payment_customer_id) {
    console.log(`[StripeWebhook] User ${userInfo.id} already has a payment_customer_id, skipping update`);
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
  console.log(`[StripeWebhook] Handling checkout.session.completed event`);
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.customer || !session.payment_intent) {
    console.log(`[StripeWebhook] Checkout session missing customer or payment_intent`);
    return;
  }

  // Find user directly by payment_customer_id (much faster and more reliable)
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', session.customer)
    .single();

  if (error || !userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: `User not found for payment_customer_id ${session.customer}`
    });
  }

  // Get operation codes
  const operationCodes = await getOperationTypes(supabase);

  // Check if this is a credit purchase (based on metadata or line items)
  if (session.metadata?.operation_type === operationCodes.credit_topup || session.mode === 'payment') {
    // Create credit transaction
    const { error: creditTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: userInfo.id,
        transaction_type: operationCodes.credit_topup,
        currency: session.currency?.toUpperCase(),
        amount: session.amount_total,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        description: `Credit purchase via Stripe`,
        metadata: JSON.stringify({
          stripe_session: session.id,
          amount_sgd_cents: session.amount_total,
        })
      });
    if (creditTransactionError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create credit transaction for user ${userInfo.id}`
      });
    }

    console.log(`[StripeWebhook] Created credit transaction for user ${userInfo.id}: ${session.amount_total} cents or ${session.amount_total / 100} SGD, type: ${operationCodes.credit_topup}`);
  }

  // Check if this is a product purchase
  if (session.metadata?.product_id) {
    const productId = session.metadata.product_id;
    const quantity = parseInt(session.metadata?.quantity);
    const unitPrice = Math.floor((session.amount_total || 0) / quantity);

    // Get status codes
    const statusCodes = await getCodes(supabase, 'order_status');

    // Create order record
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_info_id: userInfo.id,
        status_code: statusCodes.PAID,
        total_amount_cents: session.amount_total,
        currency: session.currency?.toUpperCase() || 'SGD',
        payment_method: 'stripe_checkout',
        stripe_balance_transaction_id: session.id,
        paid_at: new Date().toISOString(),
        notes: `Stripe checkout purchase - External fulfillment`
      })
      .select()
      .single();

    if (orderError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create order record for user ${userInfo.id}`
      });
    }

    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: productId,
        quantity,
        unit_price_cents: unitPrice,
        total_price_cents: session.amount_total,
        status_code: statusCodes.PAID // Order items start as paid since payment processed
      });

    if (itemError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create order item for order ${order.id}`
      });
    }

    console.log(`[StripeWebhook] Processed checkout session and created order ${order.order_number} for user ${userInfo.id}: ${session.amount_total} cents or ${session.amount_total / 100} SGD`);
  }
}

// Handle customer cash balance transactions (transfers)
async function handleCashBalanceTransaction(supabase: SupabaseClient, event: Stripe.Event) {
  console.log('Handling customer_cash_balance_transaction.created event');
  const transaction = event.data.object as Stripe.CustomerCashBalanceTransaction;

  if (!transaction.customer) {
    console.log('Cash balance transaction has no customer, skipping');
    return;
  }

  // Get operation codes
  const operationCodes = await getCodes(supabase, 'operation_type');

  // Find user by payment_customer_id
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', transaction.customer as string)
    .single();

  if (error || !userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: `User not found for payment_customer_id ${transaction.customer}`
    });
  }

  // Parse transfer information from description
  const description = transaction.description || '';
  let transactionType = operationCodes.balance_adjustment;
  let transferMetadata = {};

  if (description.includes('Transfer') && description.includes('credits to child')) {
    transactionType = operationCodes.transfer_out;
    // Extract child info from description if available
    const childMatch = description.match(/Transfer (\d+) credits to child/);
    if (childMatch) {
      transferMetadata = {
        transfer_type: 'parent_to_child',
        credits_transferred: childMatch[1]
      };
    }
  } else if (description.includes('Received') && description.includes('credits from parent')) {
    transactionType = operationCodes.transfer_in;
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
  const { error: creditTransactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_info_id: userInfo.id,
      transaction_type: transactionType,
      amount: transaction.net_amount,
      currency: transaction.currency?.toUpperCase() || 'SGD',
      stripe_payment_intent_id: transaction.id,
      stripe_checkout_session_id: transaction.id,
      description: description,
      metadata: JSON.stringify({
        stripe_customer_id: transaction.customer,
        currency: transaction.currency,
        ...transferMetadata
      })
    });

  if (creditTransactionError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create credit transaction for user ${userInfo.id}`
    });
  }

  console.log(`[StripeWebhook] Created credit transaction for user ${userInfo.id}: ${transaction.net_amount} ${transaction.currency}, type: ${transactionType}`);
}
