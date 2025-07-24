<template>
  <div class="min-h-screen">
    <div class="grid md:grid-cols-2 min-h-screen">
      <!-- Left Sidebar - Plan Summary -->
      <div v-if="checkoutSession" class="bg-white p-8">
        <div class="max-w-md mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-2xl text-gray-600 mb-4">Subscribe to {{ checkoutSession.planDetails?.name }}</h1>
            <div class="flex items-baseline space-x-2">
              <span class="text-5xl font-bold text-gray-900">{{ checkoutSession.planDetails?.currency }} {{ checkoutSession.planDetails?.price }}</span>
              <div class="text-gray-500">
                <div class="text-sm">per</div>
                <div class="text-sm">{{ checkoutSession.planDetails?.interval }}</div>
              </div>
            </div>
          </div>

          <!-- Plan Details Card -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">{{ checkoutSession.planDetails?.name }}</h3>
                <p class="text-sm text-gray-500 mb-2">{{ checkoutSession.planDetails?.description }}</p>
                <p class="text-sm text-gray-500">Billed {{ checkoutSession.planDetails?.interval }}ly</p>
              </div>
              <div class="text-right">
                <span class="font-semibold text-gray-900">{{ checkoutSession.planDetails?.currency }} {{ checkoutSession.planDetails?.price }}</span>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-900">Subtotal</span>
              <span class="font-semibold text-gray-900">{{ checkoutSession.planDetails?.currency }} {{ checkoutSession.planDetails?.price }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t pt-4">
              <span class="text-gray-900">Total due today</span>
              <span class="text-gray-900">{{ checkoutSession.planDetails?.currency }} {{ checkoutSession.planDetails?.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Payment Form -->
      <div class="bg-white p-8">
        <div class="max-w-md mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Complete Payment</h2>

          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">Payment method</label>

              <!-- Payment Element Section -->
              <div class="space-y-4">
                <!-- Stripe Payment Element will be mounted here -->
                <div id="payment-element" class="stripe-payment-element" />
                <div id="address-element" class="stripe-address-element" />

                <!-- TODO: Error state for Stripe -->
                <div v-if="stripeError" class="text-red-500 text-sm mt-2">{{ stripeError }}</div>
              </div>
            </div>

            <!-- Submit Button -->
            <Button
              variant="primary"
              type="submit"
              class="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!paymentFormCompleted || !addressFormCompleted || isLoading"
              :loading="isLoading"
              text="Subscribe"
            />

            <!-- Footer -->
            <div class="flex items-center justify-center space-x-4 pt-4 text-xs text-gray-400">
              <span>Powered by <strong>stripe</strong></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { Appearance, StripeAddressElement, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from '@stripe/stripe-js';
import Button from '~/components/common/Button.vue';

const router = useRouter();
const route = useRoute();

const { createCheckoutSession } = useSubscription();
const { stripePromise } = useStripe();

const stripe = await stripePromise();

const elements = ref<StripeElements | null>(null);
const paymentElement = ref<StripePaymentElement | null>(null);
const paymentFormCompleted = ref(false);
const addressFormCompleted = ref(false);
const addressElement = ref<StripeAddressElement | null>(null);
const stripeError = ref<string | null>(null);
const checkoutSession = ref<StripeSubscriptionCheckoutResponse | null>(null);
const isLoading = ref(false);

watch(paymentElement, (el) => {
  if (el) {
    el.on('change', (event) => {
      paymentFormCompleted.value = event.complete;
    });
  }
});

watch(addressElement, (el) => {
  if (el) {
    el.on('change', (event) => {
      addressFormCompleted.value = event.complete;
    });
  }
});

// Load plan details from API using priceId
const loadPlanDetails = async () => {
  const priceId = route.query.priceId as string;
  if (!priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Price ID is required'
    });
  }
  const response = await createCheckoutSession(priceId);
  checkoutSession.value = response;
};

// Initialize Stripe
const initializeStripe = async () => {
  try {
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    // Use Stripe Elements to create the payment form
    const appearance: Appearance = {
      theme: 'stripe',
      variables: {
        colorPrimary: 'var(--color-primary)',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '8px',
        borderRadius: '6px'
      }
    };

    elements.value = stripe.elements({
      clientSecret: checkoutSession.value?.clientSecret,
      appearance,
      loader: 'auto'
    });
    // TODO: explore if can add link authentication elementa
    addressElement.value = elements.value.create('address', {
      mode: 'shipping',
      defaultValues: {
        address: { postal_code: null, country: 'SG', line1: null, line2: null }
      }
    });
    paymentElement.value = elements.value.create('payment', {
      layout: 'tabs',
    });

    await nextTick();

    // Wait for DOM element to be available
    const checkElement = () => {
      const paymentEl = document.getElementById('payment-element');
      const addressEl = document.getElementById('address-element');

      if (paymentEl && addressEl) {
        paymentElement.value!.mount('#payment-element');
        addressElement.value!.mount('#address-element');
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

// Handle form submission
const handleSubmit = async () => {
  isLoading.value = true;
  if (!stripe || !elements.value || !paymentElement.value) {
    console.error('Stripe or Elements not initialized');
    return;
  }
  try {
    const { error } = await stripe.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Payment setup failed');
    }
    // Stripe will handle the redirect automatically
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
    await loadPlanDetails(); // This sets clientSecret
    await initializeStripe(); // This now has access to clientSecret
  } catch (error: any) {
    // Redirect back to previous page or subscription page
    console.error('Initialization error:', error);
    await router.back();
  }
});
</script>
