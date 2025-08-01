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

        // Removed customer_cash_balance_transaction handling for internal credit system

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
    // Add credits to user's internal balance
    const { error: creditUpdateError } = await supabase
      .from('user_credits')
      .update({
        credit: supabase.raw(`credit + ${session.amount_total}`)
      })
      .eq('user_info_id', userInfo.id);

    if (creditUpdateError) {
      console.error('Failed to update internal credits:', creditUpdateError);
      // Try to create the record if it doesn't exist
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_info_id: userInfo.id,
          credit: session.amount_total
        });

      if (insertError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to add credits to user ${userInfo.id}`
        });
      }
    }

    // Create credit transaction record
    const { error: creditTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: userInfo.id,
        transaction_type: operationCodes.credit_topup,
        currency: session.currency?.toUpperCase(),
        amount: session.amount_total,
        description: `Credit purchase via Stripe`,
        is_internal: true,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
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

    console.log(`[StripeWebhook] Added ${session.amount_total} cents to internal credits for user ${userInfo.id}, type: ${operationCodes.credit_topup}`);
  }

  // Check if this is a parent-approved credit purchase
  if (session.metadata?.order_id) {
    const orderId = session.metadata.order_id;
    const childUserInfoId = session.metadata.child_user_info_id;

    // Get status codes
    const statusCodes = await getCodes(supabase, 'order_status');

    // Update existing order to paid status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status_code: statusCodes.paid || 'paid',
        payment_method: 'parent_approved_stripe',
        stripe_balance_transaction_id: session.payment_intent,
        paid_at: new Date().toISOString(),
        notes: supabase.raw(`notes || ' - Parent payment completed via Stripe'`)
      })
      .eq('id', orderId);

    if (updateOrderError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update order ${orderId} to paid status`
      });
    }

    // Update order items to paid status
    const { error: updateItemsError } = await supabase
      .from('order_items')
      .update({
        status_code: statusCodes.paid || 'paid'
      })
      .eq('order_id', orderId);

    if (updateItemsError) {
      console.error('Failed to update order items status:', updateItemsError);
    }

    // Get order total for credit deduction
    const { data: order } = await supabase
      .from('orders')
      .select('total_amount_cents, order_number')
      .eq('id', orderId)
      .single();

    if (order && childUserInfoId) {
      // Now deduct the reserved credits and remove from reserved
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({
          credit: supabase.raw(`credit - ${order.total_amount_cents}`),
          reserved_credit: supabase.raw(`reserved_credit - ${order.total_amount_cents}`)
        })
        .eq('user_info_id', childUserInfoId);

      if (deductError) {
        console.error('Failed to deduct credits after parent payment:', deductError);
      }

      // Create credit transaction record
      const operationCodes = await getCodes(supabase, 'operation_type');
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_info_id: childUserInfoId,
          transaction_type: operationCodes.purchase || 'purchase',
          amount: -order.total_amount_cents, // Negative for deduction
          currency: 'SGD',
          description: `Purchase: ${order.order_number} (Parent approved)`,
          is_internal: true,
          stripe_payment_intent_id: session.payment_intent,
          stripe_checkout_session_id: session.id,
          metadata: JSON.stringify({
            order_id: orderId,
            order_number: order.order_number,
            parent_approved: true,
            parent_user_info_id: session.metadata.parent_user_info_id
          })
        });

      if (transactionError) {
        console.error('Failed to create credit transaction:', transactionError);
      }
    }

    console.log(`[StripeWebhook] Parent approved purchase completed for order ${orderId}: ${session.amount_total} cents`);
  } 
  // Check if this is a direct product purchase (not parent-approved)
  else if (session.metadata?.user_info_id && session.metadata?.operation_type === operationCodes.purchase) {
    // This is a direct purchase (use_credits = false)
    // Find the pending order by user and amount
    const { data: pendingOrder } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('user_info_id', userInfo.id)
      .eq('status_code', 'pending_payment')
      .eq('total_amount_cents', session.amount_total)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pendingOrder) {
      // Get status codes
      const statusCodes = await getCodes(supabase, 'order_status');

      // Update order to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status_code: statusCodes.paid || 'paid',
          stripe_balance_transaction_id: session.payment_intent,
          paid_at: new Date().toISOString(),
          notes: supabase.raw(`notes || ' - Direct payment completed via Stripe'`)
        })
        .eq('id', pendingOrder.id);

      if (updateError) {
        console.error('Failed to update direct purchase order:', updateError);
      }

      // Update order items
      const { error: updateItemsError } = await supabase
        .from('order_items')
        .update({
          status_code: statusCodes.paid || 'paid'
        })
        .eq('order_id', pendingOrder.id);

      if (updateItemsError) {
        console.error('Failed to update order items for direct purchase:', updateItemsError);
      }

      console.log(`[StripeWebhook] Direct purchase completed for order ${pendingOrder.order_number}: ${session.amount_total} cents`);
    }
  }
}

// Note: handleCashBalanceTransaction removed - no longer needed for internal credit system
