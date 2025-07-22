<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Success Icon -->
      <div class="text-center mb-8">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            class="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Subscription Confirmed!</h1>
        <p class="text-lg text-gray-600">Thank you for subscribing to {{ planName }}.</p>
      </div>

      <!-- Subscription Details Card -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Subscription Details</h2>

        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Plan</span>
            <span class="font-medium text-gray-900">{{ planName }}</span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Amount</span>
            <span class="font-medium text-gray-900">SGD {{ amount }}</span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Billing Cycle</span>
            <span class="font-medium text-gray-900">{{ billingCycle }}</span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Status</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <div v-if="setupIntentId" class="flex justify-between items-center py-2">
            <span class="text-gray-600">Transaction ID</span>
            <span class="font-mono text-sm text-gray-900">{{ setupIntentId }}</span>
          </div>
        </div>
      </div>

      <!-- What's Next Section -->
      <div class="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">What's next?</h3>
        <ul class="space-y-2 text-blue-800">
          <li class="flex items-start">
            <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Your subscription is now active and ready to use
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            You'll receive a confirmation email with your receipt
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Your next billing date is {{ nextBillingDate }}
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            You can manage your subscription anytime in your account settings
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
          class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          @click="goHome"
        >
          Return to Home
        </button>

        <button
          class="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
          @click="goToDashboard"
        >
          Go to Dashboard
        </button>

        <button
          class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          @click="manageSubscription"
        >
          Manage Subscription
        </button>
      </div>

      <!-- Support Section -->
      <div class="mt-12 text-center">
        <p class="text-gray-600 mb-4">Need help? We're here for you.</p>
        <div class="flex justify-center space-x-6 text-sm">
          <a href="#" class="text-blue-600 hover:text-blue-800">Contact Support</a>
          <a href="#" class="text-blue-600 hover:text-blue-800">View Documentation</a>
          <a href="#" class="text-blue-600 hover:text-blue-800">FAQ</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { handleCustomerPortal } = useStripe();

// Extract data from query parameters
const setupIntentId = ref(route.query.setup_intent as string || '');
const planName = ref(route.query.plan as string || 'Eddy Pro');
const amount = ref(route.query.amount as string || '29.00');

// Computed properties
const billingCycle = computed(() => {
  return planName.value.toLowerCase().includes('yearly') ? 'Yearly' : 'Monthly';
});

const nextBillingDate = computed(() => {
  const date = new Date();
  if (billingCycle.value === 'Yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Navigation functions
const goHome = () => {
  router.push('/');
};

const goToDashboard = () => {
  router.push('/dashboard');
};

const manageSubscription = async () => {
  try {
    await handleCustomerPortal();
  } catch (error) {
    console.error('Failed to open customer portal:', error);
    // Fallback to a local subscription management page
    router.push('/account/subscription');
  }
};

// Load additional confirmation details on mount
onMounted(async () => {
  // If we have a setup intent, we could fetch additional details from Stripe
  // This is optional and depends on your needs
  if (setupIntentId.value) {
    try {
      // Optionally fetch setup intent details
      console.log('Setup intent confirmed:', setupIntentId.value);
    } catch (error) {
      console.error('Failed to fetch setup intent details:', error);
    }
  }
});
</script>
