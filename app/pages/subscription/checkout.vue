<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">Setting up checkout...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="$router.back()" 
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
      
      <div v-else>
        <!-- Embedded Checkout will mount here -->
        <div id="checkout" class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Stripe's embedded checkout form will appear here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const { createCheckoutSession } = useSubscription();
const { stripePromise } = useStripe();

const loading = ref(true);
const error = ref<string | null>(null);

const initializeEmbeddedCheckout = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Get price ID from query params
    const priceId = route.query.priceId as string;
    if (!priceId) {
      throw new Error('Price ID is required');
    }

    // Create checkout session
    const session = await createCheckoutSession(priceId);
    
    // Initialize Stripe
    const stripe = await stripePromise();
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    // Initialize embedded checkout
    const checkout = await stripe.initEmbeddedCheckout({
      clientSecret: session.clientSecret
    });

    // Mount the checkout form
    checkout.mount('#checkout');
    
  } catch (err: any) {
    console.error('Embedded checkout initialization error:', err);
    error.value = err.message || 'Failed to initialize checkout';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initializeEmbeddedCheckout();
});
</script>