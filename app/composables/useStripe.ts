import { ref } from 'vue';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomerPortal {
  url: string;
}

export interface CustomCheckoutSession {
  success: boolean;
  clientSecret: string;
  customerId: string;
  planDetails: {
    id: string;
    name: string;
    price: number;
    interval: string;
  };
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
   * Create a custom checkout session with setup intent
   */
  const createCustomCheckoutSession = async (planType: string): Promise<CustomCheckoutSession> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await $fetch('/api/subscription/custom-checkout', {
        method: 'POST',
        body: {
          planType,
          userId: user.id
        }
      });

      if (!response?.success || !response.clientSecret) {
        throw new Error('Invalid custom checkout response');
      }

      return response as CustomCheckoutSession;
    } catch (err: any) {
      console.error('Failed to create custom checkout:', err);
      const message = err.data?.message || err.message || 'Failed to create custom checkout';
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

      const response = await $fetch('/api/subscription/cancel', {
        method: 'POST',
        body: {
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

      const response = await $fetch('/api/subscription/upgrade', {
        method: 'POST',
        body: {
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
      const response = await $fetch('/api/subscription/products', {
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

      const response = await $fetch('/api/subscription/update-payment-method', {
        method: 'POST',
        body: {
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
   * Redirect to custom checkout page
   */
  const redirectToCustomCheckout = async (planType: string, planDetails?: any) => {
    const query: any = {
      type: planType
    };

    if (planDetails) {
      query.plan = planDetails.name;
      query.price = planDetails.price;
      query.interval = planDetails.interval;
    }

    await navigateTo({
      path: '/subscription/custom-checkout',
      query
    });
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
   * Handle custom checkout
   */
  const handleCustomCheckout = async (planType: string, planDetails?: any) => {
    try {
      await redirectToCustomCheckout(planType, planDetails);
    } catch (err: any) {
      console.error('Custom checkout failed:', err);
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

    // Checkout operations
    createCheckoutSession,
    createCustomCheckoutSession,
    createCustomerPortalSession,
    getProducts,

    // Subscription management
    cancelSubscription,
    upgradeSubscription,
    updatePaymentMethod,

    // Navigation helpers
    redirectToCustomCheckout,
    redirectToCustomerPortal,

    // Composite handlers
    handleCheckout,
    handleCustomCheckout,
    handleCustomerPortal
  };
};
