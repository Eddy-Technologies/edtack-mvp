import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

export const useStripe = () => {
  const stripePromise = () => {
    const config = useRuntimeConfig();
    return loadStripe(config.public.stripePublishableKey);
  };

  const retrievePaymentIntent = async (clientSecret: string) => {
    const stripe = await stripePromise();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }
    const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
    if (paymentIntent.error) {
      throw new Error(paymentIntent.error.message);
    }
    // Inspect the PaymentIntent `status` to indicate the status of the payment
    // to your customer.
    //
    // Some payment methods will [immediately succeed or fail][0] upon
    // confirmation, while others will first enter a `processing` state.
    //
    // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
    return paymentIntent;
  };

  return { stripePromise, retrievePaymentIntent };
};
