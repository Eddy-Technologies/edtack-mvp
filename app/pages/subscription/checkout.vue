<template>
  <div class="min-h-screen bg-white">
    <div class="grid md:grid-cols-2 min-h-screen">
      <!-- Left Sidebar - Plan Summary -->
      <div class="bg-white p-8">
        <div class="max-w-md mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white mr-2">
                Sandbox
              </span>
              <span>New business sandbox</span>
            </div>
            <h1 class="text-2xl text-gray-700 mb-2">Subscribe to {{ planDetails?.name }}</h1>
          </div>

          <!-- Pricing -->
          <div class="mb-8">
            <div class="flex items-baseline mb-2">
              <span class="text-5xl font-normal text-gray-900">{{ planDetails?.currency }} {{ monthlyPrice }}</span>
              <span class="text-lg text-gray-500 ml-2">per<br>month</span>
            </div>
          </div>

          <!-- Plan Details Card -->
          <div class="border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-900">{{ planDetails?.name }}</span>
              <span class="text-gray-900">{{ planDetails?.currency }} {{ monthlyPrice }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-4">{{ planDetails?.description }}</p>
            <p class="text-sm text-gray-500 mb-4">Billed {{ useAnnualBilling ? 'annually' : 'monthly' }}</p>

            <!-- Annual Billing Toggle -->
            <div v-if="planDetails?.hasYearlyOption" class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div class="flex items-center">
                <input
                  v-model="useAnnualBilling"
                  type="checkbox"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                >
                <span class="ml-2 text-sm text-gray-700">Save {{ planDetails?.currency }} {{ planDetails?.yearlySavings }} with annual billing</span>
              </div>
              <span class="text-sm font-medium text-green-700">{{ planDetails?.currency }} {{ planDetails?.yearlyEquivalentPrice.toFixed(2) }}/month</span>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-700">Subtotal</span>
              <span class="text-gray-900">{{ planDetails?.currency }} {{ currentPrice }}</span>
            </div>
            <div class="flex justify-between font-medium">
              <span class="text-gray-900">Total due today</span>
              <span class="text-gray-900">{{ planDetails?.currency }} {{ currentPrice }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Payment Form -->
      <div class="bg-gray-50 p-8">
        <div class="max-w-md mx-auto">
          <h2 class="text-xl font-medium text-gray-900 mb-8">Pay with card</h2>

          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Contact Information -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contact information</label>
              <div class="space-y-4">
                <div class="relative">
                  <input
                    v-model="contactInfo.email"
                    type="email"
                    placeholder="email@example.com"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 bg-gray-50"
                    :disabled="true"
                    required
                  >
                  <svg
                    class="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">Payment method</label>

              <!-- Payment Element Section -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Payment details</label>

                  <!-- Stripe Payment Element will be mounted here -->
                  <div v-if="stripeLoaded">
                    <div id="payment-element" class="stripe-payment-element" />
                  </div>

                  <!-- Loading state for Stripe -->
                  <div v-else class="animate-pulse">
                    <div class="h-16 bg-gray-200 rounded-lg" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-600 mb-2">Cardholder name</label>
                  <input
                    v-model="cardholderName"
                    type="text"
                    placeholder="Full name on card"
                    class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :disabled="isLoading"
                    required
                  >
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
              <span v-else>Subscribe</span>
            </button>

            <!-- Terms -->
            <p class="text-xs text-gray-500 text-center">
              By subscribing, you authorize New business sandbox to charge you according to the terms until you cancel.
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-center space-x-4 pt-4 text-xs text-gray-400">
              <span>Powered by <strong>stripe</strong></span>
              <button type="button" class="hover:text-gray-600">Terms</button>
              <button type="button" class="hover:text-gray-600">Privacy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

const router = useRouter();
const route = useRoute();
const { createCheckoutSession } = useStripe();

// Stripe integration
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const paymentElement = ref<StripePaymentElement | null>(null);
const stripeLoaded = ref(false);
const clientSecret = ref('');
const setupIntentId = ref('');

// Form state
const isLoading = ref(false);

// Contact info
const contactInfo = ref({
  email: ''
});

// Billing info
const cardholderName = ref('');

// Plan details
const planDetails = ref<any>(null);
const useAnnualBilling = ref(false);

// Computed properties
const monthlyPrice = computed(() => {
  if (!planDetails.value) return '0.00';

  if (useAnnualBilling.value && planDetails.value.hasYearlyOption) {
    return planDetails.value.yearlyEquivalentPrice.toFixed(2);
  }
  return planDetails.value.monthlyPrice.toFixed(2);
});

const currentPrice = computed(() => {
  if (!planDetails.value) return '0.00';

  if (useAnnualBilling.value && planDetails.value.hasYearlyOption) {
    return planDetails.value.yearlyPrice.toFixed(2);
  }
  return planDetails.value.monthlyPrice.toFixed(2);
});

const isFormValid = computed(() => {
  return planDetails.value &&
    contactInfo.value.email &&
    cardholderName.value &&
    stripeLoaded.value;
});

// Load user email
const loadUserEmail = async () => {
  try {
    const { data: { user } } = await useSupabaseClient().auth.getUser();
    if (user?.email) {
      contactInfo.value.email = user.email;
    }
  } catch (error) {
    console.error('Failed to load user email:', error);
    throw error;
  }
};

// Load plan details from API using priceId
const loadPlanDetails = async () => {
  const priceId = route.query.priceId as string;

  if (!priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Price ID is required'
    });
  }

  try {
    const response = await createCheckoutSession(priceId);
    planDetails.value = response.planDetails;
    clientSecret.value = response.clientSecret;
    setupIntentId.value = response.clientSecret.split('_secret_')[0];
  } catch (error: any) {
    console.error('Failed to load plan details:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to load plan details'
    });
  }
};

// Initialize Stripe
const initializeStripe = async () => {
  try {
    const runtimeConfig = useRuntimeConfig();
    stripe.value = await loadStripe(runtimeConfig.public.stripePublishableKey);

    if (!stripe.value) {
      throw new Error('Failed to load Stripe');
    }

    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#ffffff',
          colorText: '#374151',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '6px'
        }
      }
    });

    paymentElement.value = elements.value.create('payment', {
      layout: 'tabs'
    });

    stripeLoaded.value = true;

    await nextTick();

    // Wait for DOM element to be available
    const checkElement = () => {
      const paymentEl = document.getElementById('payment-element');

      if (paymentEl) {
        paymentElement.value!.mount('#payment-element');
      } else {
        // Retry after a short delay
        setTimeout(checkElement, 100);
      }
    };

    checkElement();
  } catch (error) {
    console.error('Stripe initialization error:', error);
    throw error;
  }
};

// Setup intent is already created in loadPlanDetails

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value || !stripe.value || !elements.value || !planDetails.value) {
    return;
  }

  isLoading.value = true;

  try {
    // Setup intent is already created during initialization

    const { error, setupIntent } = await stripe.value.confirmSetup({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
        payment_method_data: {
          billing_details: {
            name: cardholderName.value,
            email: contactInfo.value.email
          }
        }
      },
      redirect: 'if_required'
    });

    if (error) {
      throw new Error(error.message || 'Payment setup failed');
    }

    if (setupIntent && setupIntent.status === 'succeeded') {
      // Confirm subscription creation
      const priceId = route.query.priceId as string;

      await $fetch('/api/subscription/confirm', {
        method: 'POST',
        body: {
          setupIntentId: setupIntent.id,
          userId: (await useSupabaseClient().auth.getUser()).data.user?.id,
          priceId
        }
      });

      // Navigate to success page
      await router.push({
        path: '/subscription/success',
        query: {
          setup_intent: setupIntent.id,
          plan: planDetails.value.name,
          amount: currentPrice.value
        }
      });
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    throw error;
  } finally {
    isLoading.value = false;
  }
};

// Initialize everything on mount with proper error handling
onMounted(async () => {
  try {
    await loadUserEmail();
    await loadPlanDetails(); // This sets clientSecret
    await initializeStripe(); // This now has access to clientSecret
  } catch (error: any) {
    // Redirect back to previous page or subscription page
    console.error('Initialization error:', error);
    await router.push('/subscription');
  }
});
</script>

<style scoped>
.stripe-payment-element {
  min-height: 64px;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
}

/* Focus styles for Payment Element */
.stripe-payment-element:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Error styles for Payment Element */
.stripe-payment-element--invalid {
  border-color: #ef4444;
}
</style>
