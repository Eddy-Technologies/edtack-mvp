import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(useRuntimeConfig().stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  useRuntimeConfig().private.supabaseUrl,
  useRuntimeConfig().private.supabaseServiceRoleKey
);

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    const body = await readRawBody(event, 'utf8');
    const signature = getHeader(event, 'stripe-signature');

    if (!signature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing signature or body'
      });
    }

    // Verify webhook signature
    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        useRuntimeConfig().stripeWebhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw createError({
        statusCode: 400,
        statusMessage: `Webhook signature verification failed: ${err.message}`
      });
    }

    // Check if we've already processed this event
    const { data: existingEvent } = await supabase
      .from('stripe_webhook_events')
      .select('processed')
      .eq('stripe_event_id', stripeEvent.id)
      .single();

    if (existingEvent?.processed) {
      return { received: true, message: 'Event already processed' };
    }

    // Store the event
    await supabase
      .from('stripe_webhook_events')
      .upsert({
        stripe_event_id: stripeEvent.id,
        event_type: stripeEvent.type,
        processed: false,
        data: stripeEvent.data
      });

    // Process the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Mark event as processed
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true })
      .eq('stripe_event_id', stripeEvent.id);

    return { received: true };

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed'
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionUpdated(subscription);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userInfoId = subscription.metadata.user_info_id;
  const planId = subscription.metadata.plan_id;

  if (!userInfoId || !planId) {
    console.error('Missing user_info_id or plan_id in subscription metadata');
    return;
  }

  // Upsert subscription
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_info_id: userInfoId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });

  console.log(`Subscription ${subscription.status} for user ${userInfoId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to canceled
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription canceled for subscription ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription && invoice.customer) {
    // Get subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('user_info_id, id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      // Record payment transaction
      await supabase
        .from('payment_transactions')
        .insert({
          user_info_id: subscription.user_info_id,
          subscription_id: subscription.id,
          stripe_invoice_id: invoice.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount_sgd: (invoice.amount_paid / 100), // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'succeeded',
          description: invoice.description || `Payment for subscription`,
          receipt_url: invoice.receipt_url || null,
          invoice_pdf_url: invoice.invoice_pdf || null
        });

      console.log(`Payment succeeded for invoice ${invoice.id}`);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription && invoice.customer) {
    // Get subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('user_info_id, id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      // Record failed payment transaction
      await supabase
        .from('payment_transactions')
        .insert({
          user_info_id: subscription.user_info_id,
          subscription_id: subscription.id,
          stripe_invoice_id: invoice.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount_sgd: (invoice.amount_due / 100), // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'failed',
          description: invoice.description || `Failed payment for subscription`,
          receipt_url: null,
          invoice_pdf_url: invoice.invoice_pdf || null
        });

      console.log(`Payment failed for invoice ${invoice.id}`);
    }
  }
}