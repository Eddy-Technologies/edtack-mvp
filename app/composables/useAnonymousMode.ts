/**
 * Anonymous Mode Composable
 *
 * Manages anonymous user state, rate limits, and signup nudge behavior.
 */

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  used: number;
  resetAt: string | null;
  allowed: boolean;
}

const DAILY_MESSAGE_LIMIT = 5;

// Global state for anonymous mode
const rateLimitStatus = ref<RateLimitStatus | null>(null);
const isLoadingRateLimit = ref(false);
const showSignupNudge = ref(false);
const signupNudgeReason = ref<'rate_limit' | 'near_limit' | 'feature' | null>(null);

export function useAnonymousMode() {
  const user = useSupabaseUser();

  // Computed: check if user is in anonymous mode
  const isAnonymousMode = computed(() => !user.value);

  // Computed: remaining messages
  const remainingMessages = computed(() => {
    if (!isAnonymousMode.value) return Infinity;
    return rateLimitStatus.value?.remaining ?? DAILY_MESSAGE_LIMIT;
  });

  // Computed: is rate limited
  const isRateLimited = computed(() => {
    if (!isAnonymousMode.value) return false;
    return rateLimitStatus.value?.allowed === false;
  });

  // Computed: near limit (2 or fewer messages remaining)
  const isNearLimit = computed(() => {
    if (!isAnonymousMode.value) return false;
    return remainingMessages.value <= 2 && remainingMessages.value > 0;
  });

  // Computed: reset time
  const resetAt = computed(() => {
    if (!rateLimitStatus.value?.resetAt) return null;
    return new Date(rateLimitStatus.value.resetAt);
  });

  // Computed: formatted reset time
  const formattedResetTime = computed(() => {
    if (!resetAt.value) return null;
    return resetAt.value.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  });

  /**
   * Fetch rate limit status from server
   */
  async function fetchRateLimitStatus(): Promise<RateLimitStatus | null> {
    if (!isAnonymousMode.value) {
      rateLimitStatus.value = null;
      return null;
    }

    isLoadingRateLimit.value = true;

    try {
      const response = await $fetch<{ success: boolean; data: RateLimitStatus }>(
        '/api/chat/anon/rate-limit'
      );

      if (response.success) {
        rateLimitStatus.value = response.data;

        // Show nudge if near limit
        if (response.data.remaining <= 2 && response.data.remaining > 0) {
          triggerSignupNudge('near_limit');
        }

        return response.data;
      }
    } catch (error) {
      console.error('[AnonymousMode] Failed to fetch rate limit:', error);
    } finally {
      isLoadingRateLimit.value = false;
    }

    return null;
  }

  /**
   * Update rate limit after sending a message
   */
  function updateRateLimitAfterMessage(remaining: number, resetAt?: string) {
    if (rateLimitStatus.value) {
      rateLimitStatus.value = {
        ...rateLimitStatus.value,
        remaining,
        used: DAILY_MESSAGE_LIMIT - remaining,
        allowed: remaining > 0,
        resetAt: resetAt || rateLimitStatus.value.resetAt,
      };

      // Trigger signup nudge if near limit
      if (remaining <= 2 && remaining > 0) {
        triggerSignupNudge('near_limit');
      } else if (remaining === 0) {
        triggerSignupNudge('rate_limit');
      }
    }
  }

  /**
   * Trigger signup nudge with a reason
   */
  function triggerSignupNudge(reason: 'rate_limit' | 'near_limit' | 'feature') {
    signupNudgeReason.value = reason;
    showSignupNudge.value = true;
  }

  /**
   * Dismiss signup nudge
   */
  function dismissSignupNudge() {
    showSignupNudge.value = false;
    signupNudgeReason.value = null;
  }

  /**
   * Check if anonymous user can send a message
   */
  async function canSendMessage(): Promise<{ allowed: boolean; reason?: string }> {
    if (!isAnonymousMode.value) {
      return { allowed: true };
    }

    // Fetch fresh rate limit status
    const status = await fetchRateLimitStatus();

    if (!status) {
      // If we can't fetch, allow optimistically
      return { allowed: true };
    }

    if (!status.allowed) {
      triggerSignupNudge('rate_limit');
      return {
        allowed: false,
        reason: `Daily message limit reached. Resets at ${formattedResetTime.value || 'midnight'}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Navigate to login with return URL
   */
  function navigateToLogin(returnUrl?: string) {
    const router = useRouter();
    const route = useRoute();
    const redirect = returnUrl || route.fullPath;
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  }

  /**
   * Navigate to signup with return URL
   */
  function navigateToSignup(returnUrl?: string) {
    const router = useRouter();
    const route = useRoute();
    const redirect = returnUrl || route.fullPath;
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  }

  // Watch for user changes to reset anonymous state
  watch(
    user,
    (newUser) => {
      if (newUser) {
        // User logged in - reset anonymous state
        rateLimitStatus.value = null;
        showSignupNudge.value = false;
        signupNudgeReason.value = null;
      }
    },
    { immediate: true }
  );

  return {
    // State
    isAnonymousMode,
    rateLimitStatus: readonly(rateLimitStatus),
    remainingMessages,
    isRateLimited,
    isNearLimit,
    resetAt,
    formattedResetTime,
    isLoadingRateLimit: readonly(isLoadingRateLimit),
    showSignupNudge: readonly(showSignupNudge),
    signupNudgeReason: readonly(signupNudgeReason),

    // Methods
    fetchRateLimitStatus,
    updateRateLimitAfterMessage,
    canSendMessage,
    triggerSignupNudge,
    dismissSignupNudge,
    navigateToLogin,
    navigateToSignup,
  };
}
