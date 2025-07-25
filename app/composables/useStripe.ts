import { loadStripe } from '@stripe/stripe-js';

export function useStripe() {
  const config = useRuntimeConfig();
  
  const stripePromise = () => {
    return loadStripe(config.public.stripePublishableKey);
  };

  const customerPortalUrl = config.public.stripeCustomerPortalUrl;
  // Fetch checkout session status and details
  async function getSessionStatus(sessionId: string) {
    const response = await $fetch('/api/subscription/session-status', {
      params: { session_id: sessionId }
    });
    return response;
  }

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

  return {
    openCustomerPortal,
    getSessionStatus,
    stripePromise
  };
}
