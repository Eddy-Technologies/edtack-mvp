import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const config = useRuntimeConfig();

    if (!config.stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    stripeInstance = new Stripe(config.stripeSecretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
};
