<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button class="text-blue-600 hover:text-blue-700" @click="goBack">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m0 7h18"
                />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Subscribe to Premium</h1>
          </div>
          <AppIcon class="w-8 h-8" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Plan Summary -->
          <div v-if="selectedPlan" class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Selected Plan</h2>
            <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">{{ selectedPlan }}</h3>
                <p class="text-sm text-gray-600">{{ planInterval === 'month' ? 'Billed monthly' : 'Billed annually' }}</p>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold text-gray-900">SGD {{ planPrice }}</div>
                <div class="text-sm text-gray-600">/{{ planInterval }}</div>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>

            <!-- Loading State -->
            <div v-if="loading.setup" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span class="ml-2 text-gray-600">Setting up payment...</span>
            </div>

            <!-- Payment Form -->
            <div v-else-if="clientSecret" class="space-y-4">
              <!-- Stripe Elements will be mounted here -->
              <div id="card-element" class="p-3 border border-gray-300 rounded-lg bg-white">
                <!-- Stripe Elements Card Component -->
              </div>

              <!-- Error Display -->
              <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm">{{ errorMessage }}</p>
              </div>

              <!-- Terms and Conditions -->
              <div class="flex items-start space-x-3">
                <input
                  id="terms"
                  v-model="acceptTerms"
                  type="checkbox"
                  class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                >
                <label for="terms" class="text-sm text-gray-700">
                  I agree to the
                  <NuxtLink to="/terms-and-conditions" class="text-blue-600 hover:text-blue-700 underline">
                    Terms and Conditions
                  </NuxtLink>
                  and understand that I can cancel anytime.
                </label>
              </div>

              <!-- Subscribe Button -->
              <Button
                variant="primary"
                class="w-full py-3 text-lg"
                :disabled="!canProceed || loading.payment"
                :loading="loading.payment"
                :text="loading.payment ? 'Processing...' : `Subscribe for SGD ${planPrice}/${planInterval}`"
                @click="handleSubscribe"
              />
            </div>

            <!-- Error State -->
            <div v-else-if="error.setup" class="text-center py-8">
              <p class="text-red-600 mb-4">{{ error.setup }}</p>
              <Button
                variant="secondary"
                text="Try Again"
                @click="initializeCheckout"
              />
            </div>
          </div>

          <!-- Security Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <svg
                class="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Secure payment processing • Your data is encrypted and protected</span>
            </div>
          </div>
        </div>

        <!-- Right Column - Benefits -->
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">What you'll get</h3>
            <ul class="space-y-3">
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-green-500 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Unlimited AI tutoring sessions</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-green-500 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Advanced progress tracking</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-green-500 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Personalized learning paths</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-green-500 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Priority support</span>
              </li>
            </ul>
          </div>

          <div class="bg-blue-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">Money-back guarantee</h3>
            <p class="text-blue-800 text-sm">
              Try EdTack Premium risk-free. If you're not satisfied within the first 7 days,
              we'll provide a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { ref, computed, onMounted, nextTick } from 'vue';
import Button from '~/components/common/Button.vue';

definePageMeta({
  middleware: ['auth']
});

// Props from query params
const route = useRoute();
const selectedPlan = computed(() => route.query.plan as string || 'Premium Plan');
const planType = computed(() => route.query.type as string || 'premium_monthly');
const planPrice = computed(() => route.query.price as string || '29');
const planInterval = computed(() => route.query.interval as string || 'month');

// State
const loading = ref({
  setup: false,
  payment: false
});

const error = ref({
  setup: null as string | null,
  payment: null as string | null
});

const clientSecret = ref('');
const customerId = ref('');
const planDetails = ref<any>(null);
const acceptTerms = ref(false);
const errorMessage = ref('');

// Stripe elements
let stripe: Stripe | null = null;
let elements: StripeElements | null = null;
let cardElement: any = null;

// Computed
const canProceed = computed(() => {
  return acceptTerms.value && !loading.value.payment && clientSecret.value;
});

// Methods
const goBack = () => {
  window.history.back();
};

const initializeStripe = async () => {
  const config = useRuntimeConfig();
  const { loadStripe } = await import('@stripe/stripe-js');
  stripe = await loadStripe(config.public.stripePublishableKey);

  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  elements = stripe.elements({
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px'
      }
    }
  });

  cardElement = elements.create('card', {
    style: {
      base: {
        'fontSize': '16px',
        'color': '#374151',
        '::placeholder': {
          color: '#9ca3af'
        }
      },
      invalid: {
        color: '#ef4444'
      }
    }
  });

  await nextTick();
  cardElement.mount('#card-element');

  cardElement.on('change', (event: any) => {
    if (event.error) {
      errorMessage.value = event.error.message;
    } else {
      errorMessage.value = '';
    }
  });
};

const initializeCheckout = async () => {
  loading.value.setup = true;
  error.value.setup = null;

  try {
    // Get current user
    const { data: { user } } = await useSupabaseClient().auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Initialize custom checkout
    const response = await $fetch('/api/subscription/custom-checkout', {
      method: 'POST',
      body: {
        userId: user.id,
        planType: planType.value
      }
    }) as any;

    if (response.success && response.clientSecret) {
      clientSecret.value = response.clientSecret;
      customerId.value = response.customerId || '';
      planDetails.value = response.planDetails;

      // Initialize Stripe
      if (!stripe) {
        await initializeStripe();
      }
    }
  } catch (err: any) {
    console.error('Checkout initialization error:', err);
    error.value.setup = err.message || 'Failed to initialize checkout';
  } finally {
    loading.value.setup = false;
  }
};

const handleSubscribe = async () => {
  if (!stripe || !cardElement || !clientSecret.value) {
    errorMessage.value = 'Payment system not ready. Please try again.';
    return;
  }

  loading.value.payment = true;
  errorMessage.value = '';

  try {
    // Confirm the setup intent with the card element
    const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
      clientSecret.value,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: '', // Will be filled by Stripe
          }
        }
      }
    );

    if (confirmError) {
      throw new Error(confirmError.message);
    }

    if (setupIntent.status !== 'succeeded') {
      throw new Error('Payment method setup failed');
    }

    // Get current user
    const { data: { user } } = await useSupabaseClient().auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Confirm subscription
    const subscriptionResponse = await $fetch('/api/subscription/confirm', {
      method: 'POST',
      body: {
        setupIntentId: setupIntent.id,
        userId: user.id,
        planType: planType.value
      }
    }) as any;

    if (subscriptionResponse.success) {
      // Redirect to dashboard with success message
      await navigateTo('/dashboard?tab=subscription&success=true');
    } else {
      throw new Error('Subscription creation failed');
    }
  } catch (err: any) {
    console.error('Subscription error:', err);
    errorMessage.value = err.message || 'Subscription failed. Please try again.';
  } finally {
    loading.value.payment = false;
  }
};

// Initialize on mount
onMounted(() => {
  initializeCheckout();
});
</script>
