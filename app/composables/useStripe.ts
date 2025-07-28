import { loadStripe } from '@stripe/stripe-js';
import type Stripe from 'stripe';
import type { STRIPE_SUBSCRIPTION_LOOKUP_KEY } from '~~/utils/stripe';

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

export function useStripe() {
  const config = useRuntimeConfig();

  const stripePromise = () => {
    return loadStripe(config.public.stripePublishableKey);
  };

  const customerPortalUrl = config.public.stripeCustomerPortalUrl;

  // Open Stripe customer portal in new tab
  function openCustomerPortal(email?: string) {
    let portalUrl = customerPortalUrl;

    // Add prefilled email if provided
    if (email) {
      portalUrl += `?prefilled_email=${encodeURIComponent(email)}`;
    }

    // Open in new tab with security attributes
    window.open(portalUrl, '_blank', 'noopener,noreferrer');
  }

  // Get available subscription products
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
    openCustomerPortal,
    stripePromise,
    getProducts
  };
}
