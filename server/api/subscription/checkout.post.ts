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

    // Create embedded checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer: customerId,
      return_url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscription/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      success: true,
      clientSecret: session.client_secret,
      customerId
    };
  } catch (error: any) {
    console.error('Embedded checkout setup error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to setup embedded checkout'
    });
  }
});
