import { ref, computed, readonly } from 'vue';
import type { TokenUsageSummary } from '~~/server/services/tokenUsageService';

// Shared state
const tokenUsageData = ref<TokenUsageSummary | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const lastFetchTime = ref(0);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useTokenUsage = () => {
  // Computed values
  const tokensUsed = computed(() => tokenUsageData.value?.tokensUsed || 0);
  const tokenLimit = computed(() => tokenUsageData.value?.tokenLimit || 0);

  const usagePercentage = computed(() => {
    return tokenUsageData.value?.usagePercentage || 0;
  });

  const isApproachingLimit = computed(() =>
    tokenUsageData.value?.warnings?.isApproachingLimit || false
  );

  const isLimitExceeded = computed(() =>
    tokenUsageData.value?.warnings?.isLimitExceeded || false
  );

  const warningMessage = computed(() =>
    tokenUsageData.value?.warnings?.warningMessage || null
  );

  const tierDisplayName = computed(() =>
    tokenUsageData.value?.subscription?.tierDisplayName || 'Free'
  );

  const isUnlimited = computed(() => tokenLimit.value === 0);

  const formattedUsage = computed(() => {
    if (isUnlimited.value) {
      return 'Unlimited';
    }
    return `${tokensUsed.value.toLocaleString()} / ${tokenLimit.value.toLocaleString()} tokens`;
  });

  /**
   * Fetch token usage data from API
   */
  const fetchTokenUsage = async (forceRefresh = false): Promise<void> => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && Date.now() - lastFetchTime.value < CACHE_DURATION && tokenUsageData.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<TokenUsageSummary>('/api/tokens/usage');
      tokenUsageData.value = response;
      lastFetchTime.value = Date.now();
    } catch (err) {
      console.error('Failed to fetch token usage:', err);
      error.value = 'Failed to load token usage data. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Refresh token usage data
   */
  const refreshTokenUsage = async (): Promise<void> => {
    await fetchTokenUsage(true);
  };

  /**
   * Open upgrade portal (uses existing Stripe composable)
   */
  const openUpgradePortal = async () => {
    const { openCustomerPortal } = useStripe();
    await openCustomerPortal();
  };

  return {
    // State
    tokenUsageData: readonly(tokenUsageData),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Individual usage
    usagePercentage: readonly(usagePercentage),
    formattedUsage: readonly(formattedUsage),
    isUnlimited: readonly(isUnlimited),

    // Warnings
    isApproachingLimit: readonly(isApproachingLimit),
    isLimitExceeded: readonly(isLimitExceeded),
    warningMessage: readonly(warningMessage),

    // Subscription
    tierDisplayName: readonly(tierDisplayName),

    // Actions
    fetchTokenUsage,
    refreshTokenUsage,
    openUpgradePortal
  };
};
