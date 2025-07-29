import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const body = await readRawBody(event);
    const signature = getHeader(event, 'stripe-signature');
    const webhookSecret = useRuntimeConfig().stripeWebhookSecret;
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
        case 'customer.updated':
          await handleCustomerEvent(privilegedSupabase, stripeEvent);
          break;

        case 'checkout.session.completed':
          await handleCheckoutCompleted(privilegedSupabase, stripeEvent, stripe);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(privilegedSupabase, stripeEvent);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(privilegedSupabase, stripeEvent);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Note: We're using Stripe as source of truth for subscriptions
          // These events are logged but not processed for local storage
          console.log(`Subscription event ${stripeEvent.type} logged but not processed locally`);
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

// Handle customer creation/updates
async function handleCustomerEvent(supabase: SupabaseClient, event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;

  if (!customer.email) {
    console.log('Customer has no email, skipping user update');
    return;
  }

  // Find user by email and update payment_customer_id
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('email', customer.email)
    .single();

  if (error || !userInfo) {
    console.log(`No user found with email ${customer.email}`);
    return;
  }

  await supabase
    .from('user_infos')
    .update({ payment_customer_id: customer.id })
    .eq('id', userInfo.id);

  console.log(`Updated payment_customer_id for user ${userInfo.id}`);
}

// Handle completed checkout sessions
async function handleCheckoutCompleted(supabase: SupabaseClient, event: Stripe.Event, stripe: Stripe) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.customer || !session.payment_intent) {
    console.log('Checkout session missing customer or payment_intent');
    return;
  }

  // Get customer to find user
  const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
  if (!customer.email) {
    console.log('Customer has no email, cannot process checkout');
    return;
  }

  // Find user
  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('id')
    .eq('email', customer.email)
    .single();

  if (error || !userInfo) {
    console.log(`No user found with email ${customer.email}`);
    return;
  }

  // Check if this is a credit purchase (based on metadata or line items)
  if (session.metadata?.type === 'credit_topup' || session.mode === 'payment') {
    const amountTotal = session.amount_total || 0;
    const creditAmount = Math.floor(amountTotal / 10); // 1 SGD cent = 0.1 credits, so 100 cents = 10 credits

    // Create credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: userInfo.id,
        transaction_type: 'purchase',
        amount: creditAmount,
        stripe_payment_intent_id: session.payment_intent,
        stripe_checkout_session_id: session.id,
        description: `Credit purchase via Stripe`,
        metadata: {
          stripe_session: session.id,
          amount_sgd_cents: amountTotal
        }
      });

    console.log(`Created credit transaction for user ${userInfo.id}: ${creditAmount} credits`);
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

    if (purchase) {
      // Grant product access
      await grantProductAccess(supabase, userInfo.id, productId, purchase.id);
      console.log(`Created purchase and granted access for user ${userInfo.id}, product ${productId}`);
    }
  }
}

// Handle successful payment intents
async function handlePaymentSucceeded(supabase: any, event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // Update any pending purchases to completed
  await supabase
    .from('user_purchases')
    .update({ status: 'completed' })
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .eq('status', 'pending');

  console.log(`Updated purchases for payment intent ${paymentIntent.id}`);
}

// Handle invoice payment succeeded (for subscriptions)
async function handleInvoicePaymentSucceeded(supabase: any, event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  if (!invoice.customer) {
    return;
  }

  // This is logged but since we're using Stripe as source of truth for subscriptions,
  // we don't create local records
  console.log(`Invoice payment succeeded for customer ${invoice.customer}: ${invoice.amount_paid / 100} ${invoice.currency}`);
}

// Grant access to a product
async function grantProductAccess(supabase: any, userInfoId: string, productId: string, purchaseId: string) {
  // Get product details to determine access duration
  const { data: product } = await supabase
    .from('products')
    .select('access_duration_days')
    .eq('id', productId)
    .single();

  let expiresAt = null;
  if (product?.access_duration_days) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + product.access_duration_days);
    expiresAt = expiryDate.toISOString();
  }

  // Deactivate any existing access for this user/product combo
  await supabase
    .from('user_product_access')
    .update({ is_active: false })
    .eq('user_info_id', userInfoId)
    .eq('product_id', productId)
    .eq('is_active', true);

  // Grant new access
  await supabase
    .from('user_product_access')
    .insert({
      user_info_id: userInfoId,
      product_id: productId,
      purchase_id: purchaseId,
      access_type: 'purchased',
      expires_at: expiresAt,
      is_active: true
    });
}
