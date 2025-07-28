import type Stripe from 'stripe';
import type { STRIPE_SUBSCRIPTION_LOOKUP_KEY } from '~~/utils/stripe';

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
  clientSecret?: string;
  customerId?: string;
  customerExists?: boolean;
  loginUrl?: string;
  message?: string;
}

export interface GetProductResponse {
  id: string;
  priceId: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  marketing_features: Stripe.Product.MarketingFeature[];
  metadata: Stripe.Metadata;
  priceLookupKey: STRIPE_SUBSCRIPTION_LOOKUP_KEY;
  interval?: Stripe.Price.Recurring.Interval;
}

export const useSubscription = () => {
  const createCheckoutSession = async (priceId: string) => {
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

      if (response.customerExists) {
        return response;
      }

      if (!response?.clientSecret) {
        throw new Error('Invalid checkout session response');
      }

      return response;
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      const message = err.data?.message || err.message || 'Failed to create checkout session';
      throw new Error(message);
    }
  };

  const getProducts = async (): Promise<GetProductResponse[]> => {
    try {
      const response = await $fetch('/api/subscription/products', {
        method: 'GET'
      });
      return response as GetProductResponse[];
    } catch (err: any) {
      console.error('Failed to get products:', err);
      const message = err.data?.message || err.message || 'Failed to fetch products';
      throw new Error(message);
    }
  };

  return {
    createCheckoutSession,
    getProducts,
  };
};
