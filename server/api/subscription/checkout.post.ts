import { getStripe } from '../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const { userId, priceId } = body;
    const baseUrl = useRuntimeConfig().public.baseUrl;

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

    // Check if user already has a subscription
    const activeSubscription = await stripe.subscriptions.list({
      customer: userInfo.payment_customer_id,
      status: 'active',
      limit: 1
    });

    if (!userInfo.payment_customer_id) {
      // TODO: Create a new customer if not exists
      // Update user_infos with new customer ID
      // await supabase
      //   .from('user_infos')
      //   .update({ payment_customer_id: customer.id })
      //   .eq('id', userInfo.id);

      // const customerId = customer.id;
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment customer ID not found for user'
      });
    }

    // Create embedded checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer: userInfo.payment_customer_id,
      return_url: `${baseUrl}/subscription/complete?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      success: true,
      clientSecret: session.client_secret,
      customerId: userInfo.payment_customer_id
    };
  } catch (error: any) {
    console.error('Embedded checkout setup error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to setup embedded checkout'
    });
  }
});
