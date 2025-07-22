import { getStripe } from '../../plugins/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const { userId, priceId } = body;

    if (!userId || !priceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: userId, priceId'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get user email
    const { data: userEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (emailError || !userEmail) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User email not found'
      });
    }

    // Get Stripe price information
    const stripe = getStripe();
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
        email: userEmail.email,
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

    // Create Setup Intent for saving payment method and immediate subscription
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
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
      clientSecret: setupIntent.client_secret,
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
