import type Stripe from 'stripe';
import { getStripe } from '../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const { userId, priceId } = body;

    if (!userId || !priceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: userId, priceId'
      });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: User not authenticated'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get Stripe price information
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });

    if (!price) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Price not found'
      });
    }

    const product = price.product as Stripe.Product;

    // Create or get Stripe customer
    let customerId = userInfo.payment_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || '',
        name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        metadata: {
          user_info_id: userInfo.id,
          user_id: userId
        }
      });
      customerId = customer.id;

      // Update user_infos with customer ID
      await supabase
        .from('user_infos')
        .update({ payment_customer_id: customerId })
        .eq('id', userInfo.id);
    }

    // Create payment intent for immediate payment and then subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount!,
      currency: price.currency,
      customer: customerId,
      metadata: {
        user_info_id: userInfo.id,
        user_id: userId,
        price_id: priceId,
        product_id: product.id,
        action: 'create_subscription'
      }
    });

    return {
      success: true,
      sessionId: paymentIntent.id,
      url: `/subscription/checkout?payment_intent=${paymentIntent.id}`,
      clientSecret: paymentIntent.client_secret,
      customerId,
      planDetails: {
        id: price.id,
        name: product.name,
        description: product.description,
        price: price.unit_amount ? (price.unit_amount / 100) : 0,
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval || 'month',
        priceId: price.id,
        productId: product.id
      }
    };
  } catch (error: any) {
    console.error('Custom checkout setup error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to setup custom checkout'
    });
  }
});
