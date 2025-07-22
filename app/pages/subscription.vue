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
            <h1 class="text-2xl font-bold text-gray-900">Premium Subscription</h1>
          </div>
          <AppIcon class="w-8 h-8" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Unlock Premium Features</h2>
        <p class="text-lg text-gray-600">Get unlimited access to advanced learning tools and personalized education</p>
      </div>

      <!-- Plans -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Monthly Plan -->
        <div class="bg-white rounded-lg shadow-sm border p-6 relative">
          <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Monthly Plan</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">SGD 29</div>
            <div class="text-sm text-gray-600">per month</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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

          <Button
            variant="outline"
            class="w-full py-3 rounded-xl font-semibold"
            text="Choose Monthly"
            @click="selectPlan('monthly')"
          />
        </div>

        <!-- Yearly Plan -->
        <div class="bg-white rounded-lg shadow-sm border p-6 relative border-blue-500">
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>

          <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Yearly Plan</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">SGD 290</div>
            <div class="text-sm text-gray-600">per year</div>
            <div class="text-sm text-green-600 font-medium">Save 17%</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
              <span class="text-gray-700">Everything in Monthly</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
              <span class="text-gray-700">Exclusive content library</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
              <span class="text-gray-700">Family sharing (up to 4 members)</span>
            </li>
            <li class="flex items-center">
              <svg
                class="w-5 h-5 text-green-500 mr-2"
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
              <span class="text-gray-700">Detailed analytics dashboard</span>
            </li>
          </ul>

          <Button
            variant="primary"
            class="w-full py-3 rounded-xl font-semibold"
            text="Choose Yearly"
            @click="selectPlan('yearly')"
          />
        </div>
      </div>

      <!-- Payment Section -->
      <div v-if="selectedPlan" class="bg-white rounded-lg shadow-sm border p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Payment Details</h3>

        <!-- Plan Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium text-gray-900">{{ selectedPlan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan' }}</h4>
              <p class="text-sm text-gray-600">{{ selectedPlan === 'monthly' ? 'Billed monthly' : 'Billed annually' }}</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-gray-900">{{ selectedPlan === 'monthly' ? 'SGD 29' : 'SGD 290' }}</div>
              <div class="text-sm text-gray-600">{{ selectedPlan === 'monthly' ? '/month' : '/year' }}</div>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div class="space-y-4">
          <!-- Card Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              v-model="cardDetails.number"
              type="text"
              placeholder="1234 5678 9012 3456"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="formatCardNumber"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Expiry Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                v-model="cardDetails.expiry"
                type="text"
                placeholder="MM/YY"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="formatExpiry"
              >
            </div>

            <!-- CVC -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">CVC</label>
              <input
                v-model="cardDetails.cvc"
                type="text"
                placeholder="123"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxlength="4"
              >
            </div>
          </div>

          <!-- Cardholder Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              v-model="cardDetails.name"
              type="text"
              placeholder="John Doe"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Subscribe Button -->
        <Button
          variant="primary"
          class="w-full py-3 rounded-xl font-semibold text-lg mt-6"
          :disabled="!canProceed || isProcessing"
          :loading="isProcessing"
          :text="isProcessing ? 'Processing...' : `Subscribe for ${selectedPlan === 'monthly' ? 'SGD 29/month' : 'SGD 290/year'}`"
          @click="processSubscription"
        />

        <!-- Security Info -->
        <div class="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <svg
            class="w-4 h-4"
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
          <span>Secure payment processing • Cancel anytime</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '~/components/common/Button.vue';

const { handleCheckout, isLoading: stripeLoading, error: stripeError } = useStripe();

definePageMeta({
  middleware: ['auth']
});

// State
const selectedPlan = ref('');
const errorMessage = ref('');

// Computed properties for processing state
const isProcessing = computed(() => stripeLoading.value);

// Card details
const cardDetails = ref({
  number: '',
  expiry: '',
  cvc: '',
  name: ''
});

// Computed properties
const canProceed = computed(() => {
  return selectedPlan.value &&
    cardDetails.value.number &&
    cardDetails.value.expiry &&
    cardDetails.value.cvc &&
    cardDetails.value.name;
});

// Methods
const selectPlan = (plan: string) => {
  selectedPlan.value = plan;
};

const goBack = () => {
  window.history.back();
};

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  if (formattedValue.length <= 19) {
    cardDetails.value.number = formattedValue;
  }
};

const formatExpiry = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  cardDetails.value.expiry = value;
};

const processSubscription = async () => {
  if (!canProceed.value) return;

  errorMessage.value = '';

  try {
    // Determine plan type based on selection
    const planType = selectedPlan.value === 'yearly' ? 'premium_yearly' : 'premium_monthly';

    // Use Stripe composable to handle checkout
    await handleCheckout(planType);
  } catch (error: any) {
    console.error('Subscription error:', error);
    errorMessage.value = error.message || 'Subscription failed. Please try again.';
  }
};
</script>
