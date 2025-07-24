import { ref, computed } from 'vue';
import type Stripe from 'stripe';

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
  subscriptionDisplayName: string | null;
  plan: any | null; // Stripe.Plan object
  delinquent: boolean;
}

export interface StripeSubscriptionCheckoutResponse {
  success: boolean;
  clientSecret: string;
  customerId: string;
}

export interface SessionStatusResponse {
  status: 'complete' | 'open' | 'expired';
  customer_email: string | null;
  client_secret?: string | null;
  plan?: {
    name: string;
    description: string | null;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  } | null;
  invoice?: {
    amount_total: number;
    currency: string;
    payment_method_types: string[];
    invoice_creation: any;
    payment_status: string;
  } | null;
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

      if (!response?.clientSecret) {
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

  const getSessionStatus = async (sessionId: string): Promise<SessionStatusResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const response: SessionStatusResponse = await $fetch('/api/subscription/session-status', {
        params: { session_id: sessionId }
      });

      return response;
    } catch (err: any) {
      console.error('Failed to get session status:', err);
      const message = err.data?.message || err.message || 'Failed to get session status';
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

  const redirectToCustomerPortal = async (fallbackAction?: () => void) => {
    try {
      const portal = await createCustomerPortalSession();
      await navigateTo(portal.url, { external: true });
    } catch (err: any) {
      console.error('Customer portal failed:', err);

      if (fallbackAction) {
        fallbackAction();
      }

      throw err;
    }
  };

  return {
    // customer,
    isLoading,
    hasError,
    error: readonly(error),

    clearError,
    fetchCustomer,
    createCheckoutSession,
    getSessionStatus,
    createCustomerPortalSession,
    getProducts,
    redirectToCustomerPortal,
  };
};
