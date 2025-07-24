import { loadStripe } from '@stripe/stripe-js';

export const useStripe = () => {
  const stripePromise = () => {
    const config = useRuntimeConfig();
    return loadStripe(config.public.stripePublishableKey);
  };

  return { stripePromise };
};
