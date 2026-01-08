import type { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { getOperationTypes } from '~~/server/services/codeService';
import { ORDER_STATUS, OPERATION_TYPE, STRIPE_LOOKUP_KEYS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  console.log('[StripeWebhook] Handler started');

  try {
    console.log('[StripeWebhook] Initializing Stripe...');
    const stripe = getStripe();

    console.log('[StripeWebhook] Reading raw body...');
    const body = await readRawBody(event);
    console.log('[StripeWebhook] Body length:', body?.length || 0);

    const signature = getHeader(event, 'stripe-signature');
    console.log('[StripeWebhook] Signature present:', !!signature);

    const webhookSecret = useRuntimeConfig().private.stripeWebhookSecret;
    console.log('[StripeWebhook] Webhook secret present:', !!webhookSecret);
    console.log('[StripeWebhook] Webhook secret starts with:', webhookSecret?.substring(0, 10));

    console.log('[StripeWebhook] Getting privileged Supabase client...');
    const privilegedSupabase = await getPrivilegedSupabaseClient(event);
    console.log('[StripeWebhook] Supabase client obtained');

    if (!signature || !webhookSecret) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing stripe signature or webhook secret'
      });
    }

    // Verify webhook signature
    let stripeEvent: Stripe.Event;
    console.log('[StripeWebhook] Verifying signature...');
    try {
      stripeEvent = await stripe.webhooks.constructEventAsync(
        body!,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
      console.log('[StripeWebhook] Signature verified, event type:', stripeEvent.type);
    } catch (err) {
      console.error('[StripeWebhook] Signature verification failed:', err);
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

    let errorMsg: string | undefined;
    // Process the event based on type - only store events we actually handle
    try {
      switch (stripeEvent.type) {
        case 'customer.created':
          await handleCustomerEvent(privilegedSupabase, stripeEvent);
          break;

        case 'checkout.session.completed':
          await handleCheckoutCompleted(privilegedSupabase, stripeEvent);
          break;

        case 'customer.subscription.created':
          errorMsg = await handleSubscriptionCreated(privilegedSupabase, stripeEvent);
          break;

        case 'customer.subscription.updated':
          errorMsg = await handleSubscriptionUpdated(privilegedSupabase, stripeEvent);
          break;

        case 'customer.subscription.deleted':
          errorMsg = await handleSubscriptionDeleted(privilegedSupabase, stripeEvent);
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
          error_message: errorMsg || null,
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
    console.error('[StripeWebhook] Error:', error);
    console.error('[StripeWebhook] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[StripeWebhook] Error stack:', error instanceof Error ? error.stack : 'no stack');

    // Re-throw H3 errors as-is (they already have proper status codes)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

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
    .from('user_infos')
    .select('id, payment_customer_id')
    .eq('email', customer.email)
    .single();

  if (error || !userInfo) {
    // Graceful return - user may not exist yet during registration flow
    console.log(`[StripeWebhook] No user found with email ${customer.email}, skipping customer sync`);
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

  if (!session.payment_intent) {
    console.log(`[StripeWebhook] Checkout session missing payment_intent`);
    return;
  }

  // PRIORITY 1: Handle parent-approved orders FIRST (doesn't require user lookup by payment_customer_id)
  // This uses order_id from metadata, not the Stripe customer ID
  if (session.metadata?.order_id) {
    const orderId = session.metadata.order_id;
    const childUserInfoId = session.metadata.child_user_info_id;
    const parentUserInfoId = session.metadata.parent_user_info_id;

    console.log(`[StripeWebhook] Processing parent-approved order: ${orderId}, parent: ${parentUserInfoId}, child: ${childUserInfoId}`);

    // Get current order to append notes
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('notes, total_amount_cents, order_number')
      .eq('id', orderId)
      .single();

    if (!currentOrder) {
      console.error(`[StripeWebhook] Order not found: ${orderId}`);
      throw createError({
        statusCode: 404,
        statusMessage: `Order not found: ${orderId}`
      });
    }

    // Update existing order to paid status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status_code: ORDER_STATUS.PAID,
        payment_method: 'parent_approved_stripe',
        stripe_balance_transaction_id: session.payment_intent,
        paid_at: new Date().toISOString(),
        notes: `${currentOrder.notes || ''} - Parent payment completed via Stripe`
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
        status_code: ORDER_STATUS.PAID
      })
      .eq('order_id', orderId);

    if (updateItemsError) {
      console.error('Failed to update order items status:', updateItemsError);
    }

    if (childUserInfoId) {
      // Get child's current credits
      const { data: childCredits } = await supabase
        .from('user_credits')
        .select('credit, reserved_credit')
        .eq('user_info_id', childUserInfoId)
        .single();

      // Now deduct the reserved credits and remove from reserved
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({
          credit: (childCredits?.credit || 0) - currentOrder.total_amount_cents,
          reserved_credit: (childCredits?.reserved_credit || 0) - currentOrder.total_amount_cents
        })
        .eq('user_info_id', childUserInfoId);

      if (deductError) {
        console.error('Failed to deduct credits after parent payment:', deductError);
      }

      // Create credit transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_info_id: childUserInfoId,
          transaction_type: OPERATION_TYPE.PURCHASE,
          amount: -currentOrder.total_amount_cents, // Negative for deduction
          currency: 'SGD',
          description: `Purchase: ${currentOrder.order_number} (Parent approved)`,
          is_internal: true,
          stripe_payment_intent_id: session.payment_intent,
          stripe_checkout_session_id: session.id,
          metadata: JSON.stringify({
            order_id: orderId,
            order_number: currentOrder.order_number,
            parent_approved: true,
            parent_user_info_id: parentUserInfoId
          })
        });

      if (transactionError) {
        console.error('Failed to create credit transaction:', transactionError);
      }
    }

    console.log(`[StripeWebhook] Parent approved purchase completed for order ${orderId}: ${session.amount_total} cents`);
    return; // Done processing parent-approved order
  }

  // PRIORITY 2: Handle direct product purchases - CREATE order (not update)
  if (session.metadata?.user_info_id && session.metadata?.operation_type === OPERATION_TYPE.PURCHASE && session.metadata?.cart_items) {
    console.log(`[StripeWebhook] Processing direct purchase for user ${session.metadata.user_info_id}, amount: ${session.amount_total} cents`);

    // Parse cart items from metadata
    let cartItems;
    try {
      cartItems = JSON.parse(session.metadata.cart_items);
    } catch (e) {
      console.error('[StripeWebhook] Failed to parse cart_items from metadata:', e);
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid cart items in session metadata'
      });
    }

    // Generate order number
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    const orderNumber = `ORD-${yearMonth}-${timestamp}`;

    // Create order with PAID status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_info_id: session.metadata.user_info_id,
        status_code: ORDER_STATUS.PAID,
        total_amount_cents: session.amount_total,
        currency: 'SGD',
        payment_method: 'stripe_checkout',
        stripe_balance_transaction_id: session.payment_intent,
        paid_at: new Date().toISOString(),
        notes: `Direct purchase - ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} - Payment completed via Stripe`
      })
      .select()
      .single();

    if (orderError) {
      console.error('[StripeWebhook] Failed to create order:', orderError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order'
      });
    }

    // Create order items with PAID status
    const orderItemsData = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.price_cents,
      total_price_cents: item.subtotal_cents,
      status_code: ORDER_STATUS.PAID
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('[StripeWebhook] Failed to create order items:', itemsError);
      // Don't throw - order was created, items are secondary
    }

    console.log(`[StripeWebhook] Direct purchase completed - created order ${orderNumber}: ${session.amount_total} cents`);
    return; // Done processing direct purchase
  }

  // PRIORITY 3: For credit top-up, we need customer lookup
  if (!session.customer) {
    console.log(`[StripeWebhook] Checkout session missing customer (not a parent-approved order or direct purchase)`);
    return;
  }

  // Try to find user by payment_customer_id first, fallback to metadata user_info_id
  let userInfo: { id: string } | null = null;

  const { data: userByCustomerId } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', session.customer)
    .single();

  if (userByCustomerId) {
    userInfo = userByCustomerId;
  } else if (session.metadata?.user_info_id) {
    // Fallback: find user by metadata user_info_id
    const { data: userByMetadata } = await supabase
      .from('user_infos')
      .select('id')
      .eq('id', session.metadata.user_info_id)
      .single();

    if (userByMetadata) {
      userInfo = userByMetadata;
      // Also update payment_customer_id for future lookups
      await supabase
        .from('user_infos')
        .update({ payment_customer_id: session.customer })
        .eq('id', userByMetadata.id);
      console.log(`[StripeWebhook] Updated payment_customer_id for user ${userByMetadata.id}`);
    }
  }

  if (!userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: `User not found for customer ${session.customer} or metadata ${session.metadata?.user_info_id}`
    });
  }

  // Get operation codes
  const operationCodes = await getOperationTypes(supabase);

  // Check if this is a credit top-up purchase (only for explicit credit purchases)
  if (session.metadata?.operation_type === OPERATION_TYPE.CREDIT_TOPUP) {
    // Get current credits first
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', userInfo.id)
      .single();

    if (fetchError || !currentCredits) {
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
    } else {
      // Update with calculated value
      const { error: creditUpdateError } = await supabase
        .from('user_credits')
        .update({
          credit: (currentCredits.credit || 0) + session.amount_total
        })
        .eq('user_info_id', userInfo.id);

      if (creditUpdateError) {
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
        transaction_type: OPERATION_TYPE.CREDIT_TOPUP,
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
}

// Handle subscription created event - graceful handling if user not found
async function handleSubscriptionCreated(supabase: SupabaseClient, event: Stripe.CustomerSubscriptionCreatedEvent): Promise<string | undefined> {
  console.log(`[StripeWebhook] Handling customer.subscription.created event`);

  const subscription = event.data.object;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const subscriptionItem = subscription.items.data[0];
  const lookupKey = subscriptionItem?.price.lookup_key;
  const billingInterval = subscriptionItem?.price.recurring?.interval;

  // Validate lookup key
  if (!lookupKey || !Object.values(STRIPE_LOOKUP_KEYS).includes(lookupKey as string)) {
    console.warn(`[StripeWebhook] Invalid or missing lookup_key for subscription ${subscription.id}, skipping`);
    return `Invalid or missing lookup_key for subscription ${subscription.id}`;
  }

  // Find user by payment_customer_id - graceful handling if not found
  const { data: userInfo, error: userError } = await supabase
    .from('user_infos')
    .select('id')
    .eq('payment_customer_id', customerId)
    .single();

  if (userError || !userInfo) {
    console.warn(`[StripeWebhook] User not found for customer ${customerId}, skipping subscription sync`);
    return `User not found for customer ${customerId}`; // Graceful return - don't throw error
  }

  // Insert new subscription record
  const { error: insertError } = await supabase
    .from('user_subscriptions')
    .insert({
      user_info_id: userInfo.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      tier_lookup_key: lookupKey,
      status: subscription.status,
      billing_interval: billingInterval,
      current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString()
    });

  if (insertError) {
    // If conflict on user_info_id, subscription already exists - that's fine
    if (insertError.code === '23505') {
      console.log(`[StripeWebhook] Subscription already exists for user ${userInfo.id}, skipping insert`);
      return `[StripeWebhook] Subscription already exists for user ${userInfo.id}, skipping insert`;
    }
    console.error(`[StripeWebhook] Failed to insert subscription:`, insertError);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create subscription for user ${userInfo.id}`
    });
  }

  console.log(`[StripeWebhook] Successfully created subscription ${subscription.id} for user ${userInfo.id}, status: ${subscription.status}, tier: ${lookupKey}`);
}

// Handle subscription updated event
async function handleSubscriptionUpdated(supabase: SupabaseClient, event: Stripe.CustomerSubscriptionUpdatedEvent): Promise<string | undefined> {
  console.log(`[StripeWebhook] Handling customer.subscription.updated event`);

  const subscription = event.data.object;
  const subscriptionItem = subscription.items.data[0];
  const lookupKey = subscriptionItem?.price.lookup_key;
  const billingInterval = subscriptionItem?.price.recurring?.interval || 'month';

  // Validate lookup key
  if (!lookupKey || !Object.values(STRIPE_LOOKUP_KEYS).includes(lookupKey as string)) {
    console.warn(`[StripeWebhook] Invalid or missing lookup_key for subscription ${subscription.id}, skipping`);
    return `Invalid or missing lookup_key for subscription ${subscription.id}`;
  }

  // Update existing subscription by stripe_subscription_id
  const { data: updatedSub, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      tier_lookup_key: lookupKey,
      status: subscription.status,
      billing_interval: billingInterval,
      current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('user_info_id')
    .single();

  if (updateError) {
    // Subscription not found - throw error
    console.error(`[StripeWebhook] Subscription ${subscription.id} not found for update`);
    throw createError({
      statusCode: 404,
      statusMessage: `Subscription ${subscription.id} not found`
    });
  }

  console.log(`[StripeWebhook] Successfully updated subscription ${subscription.id} for user ${updatedSub.user_info_id}, status: ${subscription.status}, tier: ${lookupKey}`);
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(supabase: SupabaseClient, event: Stripe.CustomerSubscriptionDeletedEvent): Promise<string | undefined> {
  console.log(`[StripeWebhook] Handling customer.subscription.deleted event`);

  const subscription = event.data.object;

  // Update subscription status to canceled
  const { data: updatedSub, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      tier_lookup_key: STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY,
      status: 'active', // Free tier is active
      billing_interval: 'month',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('user_info_id')
    .single();

  if (updateError || !updatedSub) {
    // Subscription not found - might have been deleted already or never created
    console.warn(`[StripeWebhook] Subscription ${subscription.id} not found for deletion, skipping`);
    return `Subscription ${subscription.id} not found for deletion`; // Graceful return - idempotent
  }

  console.log(`[StripeWebhook] Successfully marked subscription ${subscription.id} as canceled for user ${updatedSub.user_info_id}`);
}

// Note: handleCashBalanceTransaction removed - no longer needed for internal credit system
