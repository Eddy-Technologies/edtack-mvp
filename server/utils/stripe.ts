import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const config = useRuntimeConfig();

    if (!config.private.stripeSecretKey) {
      throw new Error('Stripe secret key is not configured. Please set NUXT_STRIPE_SECRET_KEY in your environment variables.');
    }

    stripeInstance = new Stripe(config.private.stripeSecretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
}
