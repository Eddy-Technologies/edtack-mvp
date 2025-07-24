<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <H1>{{ paymentStatus }}</H1>
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
        <p class="text-lg text-gray-600">Thank you for subscribing to planName.</p>
      </div>

      <!-- Subscription Details Card -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Subscription Details</h2>

        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Plan</span>
            <span class="font-medium text-gray-900">planName</span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Amount</span>
            <span class="font-medium text-gray-900">SGD amount </span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Billing Cycle</span>
            <span class="font-medium text-gray-900">billingCycle</span>
          </div>

          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">Status</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <!-- <div v-if="setupIntentId" class="flex justify-between items-center py-2">
            <span class="text-gray-600">Transaction ID</span>
            <span class="font-mono text-sm text-gray-900">{{ setupIntentId }}</span>
          </div> -->
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
            Your next billing date is  nextBillingDate
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
        <Button
          class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          @click="goHome"
        >
          Return to Home
        </Button>

        <Button
          class="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
          @click="goToDashboard"
        >
          Go to Dashboard
        </Button>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Button from '~/components/common/Button.vue';

const router = useRouter();
const route = useRoute();
const stripe = await useStripe();
const paymentStatus = ref('');

// Extract data from query parameters
const clientSecret = route.query.payment_intent_client_secret as string;

// Navigation functions
const goHome = () => {
  router.push('/');
};

const goToDashboard = () => {
  router.push('/dashboard');
};

const retrievePaymentIntent = async () => {
  if (!stripe) {
    return;
  }

  try {
    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
    if (error) {
      console.error('Error retrieving payment intent:', error);
    }
    switch (paymentIntent?.status) {
      case 'succeeded':
        paymentStatus.value = 'Success! Payment received.';
        break;

      case 'processing':
        paymentStatus.value = 'Payment processing. We\'ll update you when payment is received.';
        break;

      case 'requires_payment_method':
        // Redirect your user back to your payment page to attempt collecting
        // payment again
        paymentStatus.value = 'Payment failed. Please try another payment method.';
        break;

      default:
        paymentStatus.value = 'Something went wrong.';
        break;
    }
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
  }
};

// Load additional confirmation details on mount
onMounted(async () => {
  // Retrieve payment intent
  retrievePaymentIntent();
});
</script>
