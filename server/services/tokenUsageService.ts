import type { SupabaseClient } from '@supabase/supabase-js';

export interface TokenLimitCheck {
  allowed: boolean;
  isWarning: boolean;
  isExceeded: boolean;
  usagePercentage: number;
  tokensUsed: number;
  tokenLimit: number;
  message?: string;
}

export interface TokenUsageSummary {
  tokensUsed: number;
  tokenLimit: number;
  usagePercentage: number;
  billingCycle: {
    start: string;
    end: string;
  };
  subscription: {
    tierDisplayName: string;
  };
  warnings: {
    isApproachingLimit: boolean; // > 80%
    isLimitExceeded: boolean; // > 100%
    warningMessage?: string;
  };
}

/**
 * Get user's subscription from local database (fast!)
 */
export async function getUserSubscription(supabase: SupabaseClient, userInfoId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_info_id', userInfoId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('[TokenUsage] Error fetching subscription:', error);
    throw error;
  }

  return data;
}

/**
 * Get token limit for a subscription tier
 */
export async function getTierTokenLimit(supabase: SupabaseClient, tierLookupKey: string): Promise<number> {
  const { data, error } = await supabase
    .from('subscription_tier_limits')
    .select('token_limit_monthly')
    .eq('tier_lookup_key', tierLookupKey)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('[TokenUsage] Error fetching tier limit:', error);
    return 0; // Default to no limit
  }

  return data?.token_limit_monthly || 0;
}

/**
 * Get token usage from pre-aggregated summary table (fast!)
 */
export async function getTokenUsageFromSummary(
  supabase: SupabaseClient,
  userInfoId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const { data, error } = await supabase
    .from('token_usage_summary')
    .select('total_tokens')
    .eq('user_info_id', userInfoId)
    .eq('period_start', periodStart.toISOString())
    .eq('period_end', periodEnd.toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[TokenUsage] Error fetching usage summary:', error);
    return 0;
  }

  return data?.total_tokens || 0;
}

/**
 * Main function to get comprehensive token usage summary for a user
 */
export async function getTokenUsageSummary(
  supabase: SupabaseClient,
  userInfoId: string
): Promise<TokenUsageSummary> {
  // Get user's subscription
  const subscription = await getUserSubscription(supabase, userInfoId);

  if (!subscription) {
    // No active subscription - return default/free tier
    return {
      tokensUsed: 0,
      tokenLimit: 0,
      usagePercentage: 0,
      billingCycle: { start: '', end: '' },
      subscription: { tierDisplayName: 'No Active Subscription' },
      warnings: { isApproachingLimit: false, isLimitExceeded: false }
    };
  }

  const periodStart = new Date(subscription.current_period_start);
  const periodEnd = new Date(subscription.current_period_end);

  // Get token limit for this tier
  const tokenLimit = await getTierTokenLimit(supabase, subscription.tier_lookup_key);

  // Get individual usage
  const tokensUsed = await getTokenUsageFromSummary(supabase, userInfoId, periodStart, periodEnd);

  // Calculate warnings based on individual usage only
  const usagePercentage = tokenLimit > 0 ? (tokensUsed / tokenLimit) * 100 : 0;
  const isApproachingLimit = usagePercentage >= 80 && usagePercentage < 100;
  const isLimitExceeded = usagePercentage >= 100;

  let warningMessage;
  if (isLimitExceeded) {
    warningMessage = `You've exceeded your token limit for this billing period. Consider upgrading your plan.`;
  } else if (isApproachingLimit) {
    warningMessage = `You've used ${Math.round(usagePercentage)}% of your token limit. Consider upgrading to avoid interruptions.`;
  }

  // Get tier display name
  const { data: tierData } = await supabase
    .from('subscription_tier_limits')
    .select('display_name')
    .eq('tier_lookup_key', subscription.tier_lookup_key)
    .single();

  return {
    tokensUsed,
    tokenLimit,
    usagePercentage,
    billingCycle: {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    },
    subscription: {
      tierDisplayName: tierData?.display_name || subscription.tier_lookup_key
    },
    warnings: {
      isApproachingLimit,
      isLimitExceeded,
      ...(warningMessage && { warningMessage })
    }
  };
}

/**
 * Fast check function to determine if user has exceeded token limit
 * Reads from pre-aggregated tables for minimal latency
 */
export async function checkTokenLimit(
  supabase: SupabaseClient,
  userInfoId: string
): Promise<TokenLimitCheck> {
  try {
    const subscription = await getUserSubscription(supabase, userInfoId);

    if (!subscription) {
      return {
        allowed: true,
        isWarning: false,
        isExceeded: false,
        usagePercentage: 0,
        tokensUsed: 0,
        tokenLimit: 0
      };
    }

    const periodStart = new Date(subscription.current_period_start);
    const periodEnd = new Date(subscription.current_period_end);
    const tokenLimit = await getTierTokenLimit(supabase, subscription.tier_lookup_key);

    if (tokenLimit === 0) {
      return {
        allowed: true,
        isWarning: false,
        isExceeded: false,
        usagePercentage: 0,
        tokensUsed: 0,
        tokenLimit: 0
      };
    }

    const tokensUsed = await getTokenUsageFromSummary(supabase, userInfoId, periodStart, periodEnd);
    const usagePercentage = (tokensUsed / tokenLimit) * 100;
    const isWarning = usagePercentage >= 80 && usagePercentage < 100;
    const isExceeded = usagePercentage >= 100;

    let message;
    if (isExceeded) {
      message = `Token limit exceeded (${Math.round(usagePercentage)}% of ${tokenLimit.toLocaleString()} tokens)`;
    } else if (isWarning) {
      message = `Approaching token limit (${Math.round(usagePercentage)}% of ${tokenLimit.toLocaleString()} tokens)`;
    }

    return {
      allowed: true,
      isWarning,
      isExceeded,
      usagePercentage,
      tokensUsed,
      tokenLimit,
      ...(message && { message })
    };
  } catch (error) {
    console.error('[TokenLimitCheck] Error checking limit:', error);
    return {
      allowed: true,
      isWarning: false,
      isExceeded: false,
      usagePercentage: 0,
      tokensUsed: 0,
      tokenLimit: 0,
      message: 'Error checking token limit'
    };
  }
}
