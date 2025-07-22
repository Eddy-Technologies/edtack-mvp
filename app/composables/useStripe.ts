import { ref } from 'vue';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomerPortal {
  url: string;
}

export const useStripe = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  const clearError = () => {
    error.value = null;
  };

  /**
   * Create a Stripe checkout session for subscription
   */
  const createCheckoutSession = async (planType: string): Promise<StripeCheckoutSession> => {
    loading.value = true;
    error.value = null;

    try {
      // Get current authenticated user
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: {
          planType,
          userId: user.id
        }
      });

      if (!response?.url) {
        throw new Error('Invalid checkout session response');
      }

      return response as StripeCheckoutSession;
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      const message = err.data?.message || err.message || 'Failed to create checkout session';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a Stripe customer portal session for billing management
   */
  const createCustomerPortalSession = async (): Promise<StripeCustomerPortal> => {
    loading.value = true;
    error.value = null;

    try {
      // Get current authenticated user
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/stripe/customer-portal', {
        method: 'POST',
        body: {
          userId: user.id
        }
      });

      if (!response?.url) {
        throw new Error('Invalid customer portal response');
      }

      return response as StripeCustomerPortal;
    } catch (err: any) {
      console.error('Failed to create customer portal session:', err);
      const message = err.data?.message || err.message || 'Failed to access customer portal';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Redirect to Stripe Checkout
   */
  const redirectToCheckout = async (planType: string) => {
    console.log('Redirecting to Stripe Checkout for plan:', planType);
    const session = await createCheckoutSession(planType);
    await navigateTo(session.url, { external: true });
  };

  /**
   * Redirect to Stripe Customer Portal
   */
  const redirectToCustomerPortal = async () => {
    const portal = await createCustomerPortalSession();
    await navigateTo(portal.url, { external: true });
  };

  /**
   * Handle Stripe checkout with error handling and fallbacks
   */
  const handleCheckout = async (planType: string, fallbackRoute?: string) => {
    try {
      await redirectToCheckout(planType);
    } catch (err: any) {
      console.error('Checkout failed:', err);

      // If a fallback route is provided, navigate there
      if (fallbackRoute) {
        await navigateTo(fallbackRoute);
      }

      // Re-throw for component-level error handling
      throw err;
    }
  };

  /**
   * Handle customer portal with error handling and fallbacks
   */
  const handleCustomerPortal = async (fallbackAction?: () => void) => {
    try {
      await redirectToCustomerPortal();
    } catch (err: any) {
      console.error('Customer portal failed:', err);

      // If a fallback action is provided, execute it
      if (fallbackAction) {
        fallbackAction();
      }

      // Re-throw for component-level error handling
      throw err;
    }
  };

  return {
    // State
    isLoading,
    hasError,
    error: readonly(error),

    // Methods
    clearError,
    createCheckoutSession,
    createCustomerPortalSession,
    redirectToCheckout,
    redirectToCustomerPortal,
    handleCheckout,
    handleCustomerPortal
  };
};
