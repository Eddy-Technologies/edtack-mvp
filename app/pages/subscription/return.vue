<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Processing your payment...</h2>
        <p class="text-gray-600">Please wait while we confirm your subscription.</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="sessionStatus === 'complete'" class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto text-center">
        <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Welcome to your subscription!</h1>
        <p class="text-lg text-gray-600 mb-2">Your payment was successful.</p>
        <p v-if="customerEmail" class="text-gray-600 mb-8">
          A confirmation email has been sent to <strong>{{ customerEmail }}</strong>
        </p>
        
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">What's next?</h2>
          <div class="space-y-4 text-left">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-semibold">1</span>
              </div>
              <p class="text-gray-700">Your subscription is now active and billing will begin according to your plan.</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-semibold">2</span>
              </div>
              <p class="text-gray-700">You can manage your subscription, update payment methods, or cancel anytime in your account settings.</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-sm font-semibold">3</span>
              </div>
              <p class="text-gray-700">Start exploring all the features included in your plan!</p>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/dashboard" 
            class="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Go to Dashboard
          </NuxtLink>
          <button 
            @click="redirectToCustomerPortal"
            class="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>

    <!-- Failed/Open State - Show retry checkout -->
    <div v-else-if="sessionStatus === 'open'" class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <div class="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Payment incomplete</h1>
          <p class="text-lg text-gray-600 mb-8">Your payment was not successful. Please try again below.</p>
        </div>

        <!-- Retry Checkout Form -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Try again</h2>
            <p class="text-gray-600 mt-1">Complete your subscription payment</p>
          </div>
          
          <div id="retry-checkout" class="min-h-[400px]">
            <!-- Retry checkout form will mount here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto px-4">
        <div class="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p class="text-gray-600 mb-6">We couldn't process your subscription. Please try again or contact support.</p>
        <NuxtLink 
          to="/subscription" 
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Back to Plans
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { getSessionStatus, handleCustomerPortal } = useSubscription();
const { stripePromise } = useStripe();

const loading = ref(true);
const sessionStatus = ref<'complete' | 'open' | 'expired' | null>(null);
const customerEmail = ref<string | null>(null);

const checkSessionStatus = async () => {
  try {
    loading.value = true;
    
    const sessionId = route.query.session_id as string;
    if (!sessionId) {
      throw new Error('Missing session ID');
    }

    const session = await getSessionStatus(sessionId);
    sessionStatus.value = session.status;
    customerEmail.value = session.customer_email;

    // If payment failed, mount retry checkout
    if (session.status === 'open' && session.client_secret) {
      await mountRetryCheckout(session.client_secret);
    }

  } catch (error: any) {
    console.error('Failed to check session status:', error);
    sessionStatus.value = null;
  } finally {
    loading.value = false;
  }
};

const mountRetryCheckout = async (clientSecret: string) => {
  try {
    const stripe = await stripePromise();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
    checkout.mount('#retry-checkout');
  } catch (error) {
    console.error('Failed to mount retry checkout:', error);
  }
};

const redirectToCustomerPortal = async () => {
  try {
    await handleCustomerPortal();
  } catch (error) {
    console.error('Failed to redirect to customer portal:', error);
  }
};

onMounted(() => {
  checkSessionStatus();
});
</script>