import { ref, computed } from 'vue';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_sgd: number;
  interval_type: string;
  plan_type: string;
  features: string[];
}

export interface UserSubscription {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  canceledAt: string | null;
  endedAt: string | null;
}

export interface SubscriptionStatus {
  subscription: UserSubscription | null;
  currentPlan: SubscriptionPlan;
  isActive: boolean;
  isPremium: boolean;
  isTrialing: boolean;
}

export const useSubscription = () => {
  const subscriptionStatus = ref<SubscriptionStatus | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const isPremium = computed(() => subscriptionStatus.value?.isPremium || false);
  const isActive = computed(() => subscriptionStatus.value?.isActive || false);
  const isTrialing = computed(() => subscriptionStatus.value?.isTrialing || false);
  const currentPlan = computed(() => subscriptionStatus.value?.currentPlan);

  const fetchSubscriptionStatus = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/status', {
        params: { userId: user.id }
      });

      subscriptionStatus.value = response;
    } catch (err: any) {
      console.error('Failed to fetch subscription status:', err);
      error.value = err.message || 'Failed to fetch subscription status';
    } finally {
      loading.value = false;
    }
  };

  // Use Stripe composable for checkout and portal operations
  const stripe = useStripe();

  return {
    subscriptionStatus: readonly(subscriptionStatus),
    isLoading: computed(() => loading.value || stripe.isLoading.value),
    hasError: computed(() => hasError.value || stripe.hasError.value),
    error: computed(() => error.value || stripe.error.value),
    isPremium,
    isActive,
    isTrialing,
    currentPlan,
    fetchSubscriptionStatus,

    // Stripe operations
    createCheckoutSession: stripe.createCheckoutSession,
    createCustomerPortalSession: stripe.createCustomerPortalSession,
    redirectToCheckout: stripe.redirectToCheckout,
    redirectToCustomerPortal: stripe.redirectToCustomerPortal,
    handleCheckout: stripe.handleCheckout,
    handleCustomerPortal: stripe.handleCustomerPortal,

    refresh: fetchSubscriptionStatus
  };
};
