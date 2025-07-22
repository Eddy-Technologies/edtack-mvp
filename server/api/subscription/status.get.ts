import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  useRuntimeConfig().private.supabaseUrl,
  useRuntimeConfig().private.supabaseServiceRoleKey
);

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId } = query;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameter: userId'
      });
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Get current subscription with plan details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          display_name,
          description,
          price_sgd,
          interval_type,
          plan_type,
          features
        )
      `)
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Subscription query error:', subscriptionError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch subscription status'
      });
    }

    // If no active subscription, return free plan
    if (!subscription) {
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_type', 'free')
        .single();

      return {
        subscription: null,
        currentPlan: freePlan || {
          name: 'free',
          display_name: 'Free Plan',
          description: 'Basic features to get started',
          price_sgd: 0,
          interval_type: 'month',
          plan_type: 'free',
          features: [
            'Limited AI queries per month',
            'Basic study tools',
            'Limited practice questions',
            'Community support'
          ]
        },
        isActive: false,
        isPremium: false,
        isTrialing: false
      };
    }

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        trialStart: subscription.trial_start,
        trialEnd: subscription.trial_end,
        canceledAt: subscription.canceled_at,
        endedAt: subscription.ended_at
      },
      currentPlan: subscription.subscription_plans,
      isActive: subscription.status === 'active',
      isPremium: subscription.subscription_plans?.plan_type?.includes('premium') || false,
      isTrialing: subscription.status === 'trialing'
    };
  } catch (error: any) {
    console.error('Subscription status error:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to get subscription status'
    });
  }
});
