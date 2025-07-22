import { ref } from 'vue';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomerPortal {
  url: string;
}

export interface StripeProductPrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: 'month' | 'year';
    interval_count: number;
  } | null;
  type: 'one_time' | 'recurring';
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
  images: string[];
  marketing_features: Array<{
    name: string;
  }> | null;
  prices: StripeProductPrice[];
  default_price: StripeProductPrice | null;
}

export interface ProductsResponse {
  success: boolean;
  products: StripeProduct[];
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

      const response = await $fetch('/api/subscription/customer-portal', {
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
   * Cancel subscription
   */
  const cancelSubscription = async (reason?: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/manage', {
        method: 'POST',
        body: {
          action: 'cancel',
          userId: user.id,
          reason
        }
      });

      return response as { success: boolean; message: string };
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      const message = err.data?.message || err.message || 'Failed to cancel subscription';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Upgrade subscription plan
   */
  const upgradeSubscription = async (newPlanType: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/manage', {
        method: 'POST',
        body: {
          action: 'upgrade',
          userId: user.id,
          newPlanType
        }
      });

      return response as { success: boolean; message: string };
    } catch (err: any) {
      console.error('Failed to upgrade subscription:', err);
      const message = err.data?.message || err.message || 'Failed to upgrade subscription';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get all Stripe products with pricing information
   */
  const getProducts = async (): Promise<ProductsResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/subscription/catalog', {
        method: 'GET'
      }) as ProductsResponse;
      console.log('Fetched products:', response);

      if (!response?.success) {
        throw new Error('Failed to fetch products');
      }

      return response;
    } catch (err: any) {
      console.error('Failed to get products:', err);
      const message = err.data?.message || err.message || 'Failed to fetch products';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get specific plan details by plan type
   */
  const getPlan = async (planType: string): Promise<any> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/subscription/catalog?planType=${planType}`, {
        method: 'GET'
      });

      if (!response?.success) {
        throw new Error('Failed to fetch plan details');
      }

      return response.product;
    } catch (err: any) {
      console.error('Failed to get plan:', err);
      const message = err.data?.message || err.message || 'Failed to fetch plan details';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update payment method
   */
  const updatePaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/manage', {
        method: 'POST',
        body: {
          action: 'update-payment',
          userId: user.id,
          paymentMethodId
        }
      });

      return response as { success: boolean; message: string };
    } catch (err: any) {
      console.error('Failed to update payment method:', err);
      const message = err.data?.message || err.message || 'Failed to update payment method';
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
   * Confirm subscription with setup intent
   */
  const confirmSubscription = async (setupIntentId: string, planType: string): Promise<{ success: boolean; subscriptionId?: string; message: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/confirm', {
        method: 'POST',
        body: {
          setupIntentId,
          userId: user.id,
          planType
        }
      });

      return response as { success: boolean; subscriptionId?: string; message: string };
    } catch (err: any) {
      console.error('Subscription confirmation error:', err);
      const message = err.data?.message || err.message || 'Failed to confirm subscription';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
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

    // Checkout operations
    createCheckoutSession,
    createCustomerPortalSession,
    getProducts,
    getPlan,

    // Subscription management
    cancelSubscription,
    upgradeSubscription,
    updatePaymentMethod,

    // Navigation helpers
    redirectToCustomerPortal,

    // Composite handlers
    handleCheckout,
    handleCustomerPortal,
    confirmSubscription
  };
};
