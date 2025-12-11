import { STRIPE_CUSTOMER } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tier_limits!inner(display_name, token_limit_monthly)
      `)
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return { stripeCustomerState: STRIPE_CUSTOMER.NOT_EXISTENT };
    }

    return {
      stripeCustomerState: STRIPE_CUSTOMER.WITH_ACTIVE_SUBSCRIPTION,
      productName: subscription.subscription_tier_limits.display_name,
      productDescription: `${subscription.billing_interval}ly subscription`,
      email: userInfo.email,
      id: subscription.stripe_customer_id,
      subscriptionId: subscription.stripe_subscription_id,
      subscriptionStatus: subscription.status,
    };
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscription'
    });
  }
});
