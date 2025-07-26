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

    // Check if customer already exists with this email
    const existingCustomer = await stripe.customers.list({
      email: user.email || '',
      limit: 1
    });

    if (existingCustomer.data.length > 0) {
      // Customer exists in Stripe, return login URL with prefilled email
      const encodedEmail = encodeURIComponent(user.email || '');
      const runtimeConfig = useRuntimeConfig();

      return {
        success: false,
        customerExists: true,
        loginUrl: `${runtimeConfig.public.stripeCustomerPortalUrl}?prefilled_email=${encodedEmail}`, // N Code customer portal URL
        message: 'Customer already exists. Please use the customer portal to manage your subscription.'
      };
    }

    // No existing customer in Stripe, create new one
    const customer = await stripe.customers.create({
      email: user.email || '',
      name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
      metadata: {
        user_info_id: userInfo.id,
        user_id: userId
      }
    });

    // Update user_infos with new customer ID
    await supabase
      .from('user_infos')
      .update({ payment_customer_id: customer.id })
      .eq('id', userInfo.id);

    const customerId = customer.id;
    console.log(baseUrl, 'Customer ID:', customerId);

    // Create embedded checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer: customerId,
      return_url: `${baseUrl}/subscription/complete?session_id={CHECKOUT_SESSION_ID}`,
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
