import { ref, computed } from 'vue';
import type Stripe from 'stripe';
import type { STRIPE_SUBSCRIPTION_LOOKUP_KEY } from '~/constants/Stripe';

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

export interface CustomerResponse {
  id: string;
  email: string;
  name: string;
  subscription?: Stripe.Subscription;
  invoiceDefaultPaymentMethod?: Stripe.PaymentMethod;
  defaultSource: Stripe.PaymentMethod;
  delinquent: boolean;
}

export interface StripeSubscriptionCheckoutResponse {
  success: boolean;
  sessionId: string;
  url: string;
  clientSecret: string;
  customerId: string;
  planDetails: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    priceId: string;
    productId: string;
  };
}

export const useSubscription = () => {
  const customer = ref<CustomerResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  const clearError = () => {
    error.value = null;
  };

  const fetchCustomer = async (): Promise<CustomerResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const fetchedCustomer = await $fetch<CustomerResponse>('/api/subscription/customer', {
        params: { userId: user.id }
      });
      console.log('Fetched customer:', fetchedCustomer);

      customer.value = fetchedCustomer;
      return fetchedCustomer;
    } catch (err: any) {
      console.error('Failed to fetch customer:', err);
      error.value = err.message || 'Failed to fetch customer';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCheckoutSession = async (priceId: string): Promise<StripeSubscriptionCheckoutResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const { data: { user } } = await useSupabaseClient().auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response: StripeSubscriptionCheckoutResponse = await $fetch('/api/subscription/checkout', {
        method: 'POST',
        body: {
          priceId,
          userId: user.id
        }
      });

      if (!response?.url) {
        throw new Error('Invalid checkout session response');
      }

      return response;
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      const message = err.data?.message || err.message || 'Failed to create checkout session';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  const createCustomerPortalSession = async (): Promise<StripeCustomerPortal> => {
    loading.value = true;
    error.value = null;

    try {
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

  // const getPlan = async (planType: string): Promise<any> => {
  //   loading.value = true;
  //   error.value = null;

  //   try {
  //     const response = await $fetch(`/api/subscription/plans/${planType}`, {
  //       method: 'GET'
  //     });

  //     if (!response?.success) {
  //       throw new Error('Failed to fetch plan details');
  //     }

  //     return response.product;
  //   } catch (err: any) {
  //     console.error('Failed to get plan:', err);
  //     const message = err.data?.message || err.message || 'Failed to fetch plan details';
  //     error.value = message;
  //     throw new Error(message);
  //   } finally {
  //     loading.value = false;
  //   }
  // };

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

  const redirectToCheckout = async (priceId: string) => {
    console.log('Redirecting to Stripe Checkout for price:', priceId);
    const session = await createCheckoutSession(priceId);
    await navigateTo(session.url, { external: true });
  };

  const redirectToCustomerPortal = async () => {
    const portal = await createCustomerPortalSession();
    await navigateTo(portal.url, { external: true });
  };

  const handleCheckout = async (priceId: string, fallbackRoute?: string) => {
    try {
      await redirectToCheckout(priceId);
    } catch (err: any) {
      console.error('Checkout failed:', err);

      if (fallbackRoute) {
        await navigateTo(fallbackRoute);
      }

      throw err;
    }
  };

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

      return response.success;
    } catch (err: any) {
      console.error('Subscription confirmation error:', err);
      const message = err.data?.message || err.message || 'Failed to confirm subscription';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  };

  const handleCustomerPortal = async (fallbackAction?: () => void) => {
    try {
      await redirectToCustomerPortal();
    } catch (err: any) {
      console.error('Customer portal failed:', err);

      if (fallbackAction) {
        fallbackAction();
      }

      throw err;
    }
  };

  return {
    customer,
    isLoading,
    hasError,
    error: readonly(error),

    clearError,
    fetchCustomer,
    createCheckoutSession,
    createCustomerPortalSession,
    getProducts,
    // getPlan,
    cancelSubscription,
    upgradeSubscription,
    updatePaymentMethod,
    redirectToCheckout,
    redirectToCustomerPortal,
    handleCheckout,
    handleCustomerPortal,
    confirmSubscription,
  };
};
