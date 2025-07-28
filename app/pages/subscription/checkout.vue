<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-gray-600">Setting up checkout...</p>
      </div>

      <!-- <div v-else-if="customerExists" class="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold mb-2">Customer Portal</h3>
        <p class="text-primary-600 mb-4">{{ customerMessage }}</p>
        <div class="space-y-3">
          <Button
            class="w-full"
            variant="primary"
            @click="redirectToPortal"
          >
            Go to Customer Portal
          </Button>
          <Button
            class="w-full"
            variant="secondary"
            @click="$router.push('/')"
          >
            Go Back
          </Button>
        </div>
      </div> -->

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          @click="$router.back()"
        >
          Go Back
        </button>
      </div>

      <!-- Embedded Checkout will mount here - always present but hidden when loading/error -->
      <div
        id="checkout"
        class="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <!-- Stripe's embedded checkout form will appear here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import Button from '~/components/common/Button.vue';

definePageMeta({
  layout: false,
  middleware: ['auth'] // Ensure user is authenticated
});

const route = useRoute();

const { createCheckoutSession } = useSubscription();
const { stripePromise } = useStripe();

const loading = ref(true);
const error = ref<string | null>(null);
const checkoutInstance = ref<any>(null); // TODO: Use proper Stripe types

const customerMessage = ref<string>('');
const loginUrl = ref<string>('');

const cleanupCheckout = () => {
  if (checkoutInstance.value) {
    try {
      checkoutInstance.value.destroy();
      checkoutInstance.value = null;
    } catch (err) {
      console.warn('Error destroying checkout instance:', err);
    }
  }

  // Clear the DOM element
  const checkoutEl = document.getElementById('checkout');
  if (checkoutEl) {
    checkoutEl.innerHTML = '';
  }
};

onUnmounted(() => {
  cleanupCheckout();
});

const initializeEmbeddedCheckout = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Clean up any existing checkout instance first
    cleanupCheckout();

    // Get price ID from query params
    const priceId = route.query.priceId as string;
    if (!priceId) {
      throw new Error('Price ID is required');
    }

    // Create checkout session
    const session = await createCheckoutSession(priceId);

    // // Check if customer already exists
    // if (session.customerExists) {
    //   customerExists.value = true;
    //   customerMessage.value = session.message || 'Customer already exists. Please use the customer portal.';
    //   loginUrl.value = session.loginUrl || '';
    //   loading.value = false;
    //   return;
    // }

    // Initialize Stripe
    const stripe = await stripePromise();
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    // Wait a moment to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Initialize embedded checkout
    const checkout = await stripe.initEmbeddedCheckout({
      clientSecret: session.clientSecret
    });

    // Store the instance for cleanup
    checkoutInstance.value = checkout;

    // Wait for DOM element to be available and mount
    await nextTick();

    // Check if element exists before mounting
    const checkoutEl = document.getElementById('checkout');
    if (!checkoutEl) {
      throw new Error('Checkout element not found in DOM');
    }

    // Mount the checkout form
    checkout.mount('#checkout');
  } catch (err: any) {
    console.error('Embedded checkout initialization error:', err);
    error.value = err.message || 'Failed to initialize checkout';
  } finally {
    loading.value = false;
  }
};

const redirectToPortal = () => {
  if (loginUrl.value) {
    window.location.href = loginUrl.value;
  }
};

onMounted(() => {
  initializeEmbeddedCheckout();
});
</script>
