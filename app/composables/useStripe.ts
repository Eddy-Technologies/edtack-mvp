export function useStripe() {
  const customerPortalUrl = 'https://billing.stripe.com/p/login/test_bJe4gs8AW7xbd065JGcfK00';
  // Fetch checkout session status and details
  async function getSessionStatus(sessionId: string) {
    const response = await $fetch('/api/stripe/checkout-session', {
      query: { session_id: sessionId }
    });
    return response;
  }

  // Open Stripe customer portal in new tab
  async function openCustomerPortal(email?: string) {
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
    getSessionStatus
  };
}
