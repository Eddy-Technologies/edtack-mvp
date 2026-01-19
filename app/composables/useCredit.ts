import { ref, computed, watch } from 'vue';
import { useGlobalUserRealtimeSync } from '~/composables/useUserRealtimeSync';

// Unified credit state - updated for internal credit system
const creditData = ref<{
  user: {
    email: string;
    balance: number;
    currency: string;
    updatedAt: string;
  };
  children?: Array<{
    userInfoId: string;
    email: string;
    firstName: string;
    lastName: string;
    balance: number;
    currency: string;
    updatedAt: string;
  }>;
  familyStatus?: {
    hasActiveParents: boolean;
    parentCount: number;
    isOrphanedStudent: boolean;
  };
  fetchedAt: string;
} | null>(null);

const isLoading = ref(false);
const error = ref<string | null>(null);
const lastFetchTime = ref(0);

// Pending request promise for deduplication
let pendingRequest: Promise<void> | null = null;

// Transaction version - increment to trigger transaction history refresh
const transactionVersion = ref(0);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useCredit = () => {
  // Computed values
  const balance = computed(() => creditData.value?.user?.balance || 0);
  const formattedBalance = computed(() => {
    return `${balance.value} credits`;
  });
  const currency = computed(() => creditData.value?.user?.currency || 'SGD');

  // Family computed values - removed isParent (use me store instead)

  const children = computed(() => {
    return creditData.value?.children?.map((child) => ({
      userInfoId: child.userInfoId,
      email: child.email,
      firstName: child.firstName,
      lastName: child.lastName,
      balance: child.balance,
      currency: child.currency,
      name: `${child.firstName} ${child.lastName}`
    })) || [];
  });

  const totalFamilyBalance = computed(() => {
    if (!creditData.value?.children) return balance.value;
    const childrenTotal = creditData.value.children.reduce((sum, child) => sum + child.balance, 0);
    return balance.value + childrenTotal;
  });

  const isCacheValid = computed(() => {
    return Date.now() - lastFetchTime.value < CACHE_DURATION;
  });

  /**
   * Smart fetch - tries family API first, falls back to individual balance
   */
  const fetchCredits = async (forceRefresh = false): Promise<void> => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid.value && creditData.value) {
      return;
    }

    // If there's already a pending request, return that promise
    if (pendingRequest) {
      console.log('[useCredit] Reusing pending request for credit data');
      return pendingRequest;
    }

    isLoading.value = true;
    error.value = null;

    // Create new pending request
    pendingRequest = (async () => {
      try {
        // Use the unified API that handles both individual and family scenarios
        const response = await $fetch('/api/credits/unified');

        creditData.value = response;
        lastFetchTime.value = Date.now();
      } catch (err) {
        console.error('Failed to fetch credit data:', err);
        error.value = 'Failed to load credit data. Please try again.';
      } finally {
        isLoading.value = false;
        pendingRequest = null; // Clear pending request
      }
    })();

    return pendingRequest;
  };

  /**
   * Update user balance optimistically
   */
  const updateBalance = (amountInCents: number, description?: string): void => {
    if (!creditData.value) return;

    const newBalance = creditData.value.user.balance + amountInCents;

    // Don't allow negative balances
    if (newBalance >= 0) {
      creditData.value.user.balance = newBalance;

      // Note: totalFamilyBalance is now computed automatically from parent + children balances

      console.log(`Balance updated optimistically: ${description || 'Unknown operation'}, new balance: ${newBalance} credits`);
    }
  };

  /**
   * Update a specific child's balance optimistically
   */
  const updateChildBalance = (userInfoId: string, amountInCents: number): void => {
    if (!creditData.value?.children) return;

    const childIndex = creditData.value.children.findIndex((child) => child.userInfoId === userInfoId);
    if (childIndex !== -1) {
      const oldBalance = creditData.value.children[childIndex].balance;
      const newBalance = oldBalance + amountInCents;

      if (newBalance >= 0) {
        creditData.value.children[childIndex].balance = newBalance;
      }
    }
  };

  /**
   * Handle transfer between family members
   */
  const handleTransfer = (
    fromUserId: string,
    toUserId: string,
    amountInCents: number,
    description?: string
  ): void => {
    if (!creditData.value) return;

    // Deduct from sender
    if (fromUserId === 'parent') {
      updateBalance(-amountInCents, `${description} - outgoing`);
    } else {
      updateChildBalance(fromUserId, -amountInCents);
    }

    // Add to receiver
    if (toUserId === 'parent') {
      updateBalance(amountInCents, `${description} - incoming`);
    } else {
      updateChildBalance(toUserId, amountInCents);
    }
  };

  /**
   * Handle successful transaction with type-specific logic
   */
  const handleTransaction = (
    amountInCents: number,
    type: 'purchase' | 'transfer_out' | 'transfer_in' | 'topup',
    description?: string
  ): void => {
    let balanceChange = 0;

    switch (type) {
      case 'purchase':
      case 'transfer_out':
        balanceChange = -Math.abs(amountInCents);
        break;
      case 'transfer_in':
      case 'topup':
        balanceChange = Math.abs(amountInCents);
        break;
    }

    updateBalance(balanceChange, description);
  };

  /**
   * Set balance directly (for confirmed updates from server)
   */
  const setBalance = (newBalanceInCents: number, newCurrency = 'SGD'): void => {
    if (!creditData.value) return;

    creditData.value.user.balance = newBalanceInCents;
    creditData.value.user.currency = newCurrency;
    lastFetchTime.value = Date.now();
  };

  /**
   * Check if user has sufficient balance for a purchase
   */
  const hasSufficientBalance = (requiredAmountInCents: number): boolean => {
    return balance.value >= requiredAmountInCents;
  };

  /**
   * Get child by user info ID
   */
  const getChildById = (userInfoId: string) => {
    return children.value.find((child) => child.userInfoId === userInfoId);
  };

  /**
   * Refresh credit data
   */
  const refreshCredits = async (): Promise<void> => {
    await fetchCredits(true);
  };

  /**
   * Clear all cached data
   */
  const clearCache = (): void => {
    creditData.value = null;
    lastFetchTime.value = 0;
    error.value = null;
  };

  /**
   * Increment transaction version to trigger ViewTransactions refresh
   */
  const incrementTransactionVersion = (): void => {
    transactionVersion.value++;
  };

  // No automatic initialization - only fetch when explicitly called

  // Watch for realtime credit updates
  const { creditsVersion } = useGlobalUserRealtimeSync();
  watch(creditsVersion, () => {
    console.log('[useCredit] Credits changed via realtime, refreshing...');
    fetchCredits(true);
  });

  return {
    // State
    creditData: readonly(creditData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isCacheValid: readonly(isCacheValid),

    // Individual balance
    balance: readonly(balance),
    formattedBalance: readonly(formattedBalance),
    currency: readonly(currency),

    // Family data
    children: readonly(children),
    totalFamilyBalance: readonly(totalFamilyBalance),

    // Actions
    fetchCredits,
    refreshCredits,
    updateBalance,
    updateChildBalance,
    handleTransfer,
    handleTransaction,
    setBalance,
    clearCache,
    hasSufficientBalance,
    getChildById,
    incrementTransactionVersion,

    // Transaction refresh trigger
    transactionVersion: readonly(transactionVersion)
  };
};
