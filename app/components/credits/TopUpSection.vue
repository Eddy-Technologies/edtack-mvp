<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="flex items-center mb-4">
      <div class="bg-green-100 rounded-full p-2 mr-3">
        <svg
          class="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Top Up Credits</h3>
    </div>

    <p class="text-gray-600 mb-6">Add credits to your account using your payment method</p>

    <!-- Quick Amount Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Quick Amounts</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="amount in quickAmounts"
          :key="amount.value"
          :class="[
            'p-4 rounded-lg border-2 transition-colors text-center',
            selectedAmount === amount.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          ]"
          @click="selectedAmount = amount.value"
        >
          <div class="font-semibold">${{ amount.value }}</div>
        </button>
      </div>
    </div>

    <!-- Custom Amount -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          v-model.number="customAmount"
          type="number"
          min="1"
          max="500"
          placeholder="0.00"
          class="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="selectedAmount = customAmount"
        >
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">SGD</span>
        </div>
      </div>
    </div>

    <!-- Top Up Button -->
    <button
      :disabled="!selectedAmount || selectedAmount < 1 || isLoading"
      class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      @click="handleTopUp"
    >
      <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
      {{ isLoading ? 'Processing...' : `Top Up $${selectedAmount || 0}` }}
    </button>

    <!-- Payment Methods Info -->
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center text-sm text-gray-600">
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Secure payment powered by Stripe
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Quick amount options
const quickAmounts = [
  { value: 5, credits: 50 },
  { value: 10, credits: 100 },
  { value: 25, credits: 250 },
  { value: 50, credits: 500 },
];

// Reactive data
const selectedAmount = ref<number>(10);
const customAmount = ref<number>();
const isLoading = ref(false);

const handleTopUp = async () => {
  if (!selectedAmount.value || selectedAmount.value < 1) return;

  isLoading.value = true;
  try {
    const checkoutResponse = await $fetch('/api/credits/top-up', {
      method: 'POST',
      body: {
        amount: selectedAmount.value,
      },
    });

    // Redirect to Stripe Checkout
    if (checkoutResponse.url) {
      window.location.href = checkoutResponse.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Top-up failed:', error);
    alert('Failed to create checkout session. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// No onMounted needed - consuming shared credit state from CreditsTab
</script>
