import Stripe from 'stripe';

export const getStripe = () => new Stripe(useRuntimeConfig().stripeSecretKey, {
  apiVersion: '2024-12-18.acacia'
});
