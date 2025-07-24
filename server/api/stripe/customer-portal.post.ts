import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const { data: { user } } = await supabase.auth.getUser();
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const stripe = getStripe();

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Find customer by email
    const customer = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (!customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found'
      });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.data[0].id,
      return_url: `${baseUrl}/dashboard?tab=subscription`
    });

    return {
      url: session.url
    };
  } catch (error) {
    console.error('Failed to create customer portal session:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create customer portal session'
    });
  }
});
