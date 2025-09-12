<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="flex items-center mb-4 space-x-2">
      <div class="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
        <UIcon name="i-lucide-circle-plus" :size="24" class="text-primary-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Top Up Credits</h3>
    </div>

    <p class="text-gray-600 mb-6">Add credits to your account</p>

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
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          ]"
          @click="selectedAmount = amount.value"
        >
          <div class="font-semibold">${{ amount.value }}</div>
          <div class="text-sm text-gray-500">{{ amount.credits }} credits</div>
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
      class="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      @click="showConfirmModal = true"
    >
      <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
      {{ isLoading ? 'Processing...' : `Top Up $${selectedAmount || 0} (${(selectedAmount || 0) * 100} credits)` }}
    </button>

    <!-- Payment Methods Info -->
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center text-sm text-gray-600">
        <UIcon name="i-lucide-shield-check" class="w-5 h-5 mr-2" />
        Secure internal credit system
      </div>
    </div>

    <!-- Confirmation Modal -->
    <UModal v-model="showConfirmModal">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mr-3">
            <UIcon name="i-lucide-circle-dollar-sign" :size="24" class="text-primary-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Confirm Top-Up</h3>
        </div>

        <p class="text-gray-600 mb-6">
          You are about to pledge <span class="font-semibold text-gray-900">${{ selectedAmount }} SGD</span> to your account.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p class="text-sm text-blue-800">
            <strong>Conversion:</strong> ${{ selectedAmount }} SGD = {{ selectedAmount * 100 }} credits
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600">Dollar amount:</span>
            <span class="font-semibold text-gray-900">${{ selectedAmount }} SGD</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Credits to add:</span>
            <span class="font-semibold text-gray-900">{{ selectedAmount * 100 }} credits</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            :disabled="isLoading"
            @click="showConfirmModal = false"
          >
            Cancel
          </button>
          <button
            class="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center"
            :disabled="isLoading"
            @click="confirmTopUp"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            {{ isLoading ? 'Processing...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCredit } from '~/composables/useCredit';
import { useToast } from '#imports';

const toast = useToast();

// Quick amount options
const quickAmounts = [
  { value: 5, credits: 500 },
  { value: 10, credits: 1000 },
  { value: 25, credits: 2500 },
  { value: 50, credits: 5000 },
];

// Reactive data
const selectedAmount = ref<number>(10);
const customAmount = ref<number>();
const isLoading = ref(false);
const showConfirmModal = ref(false);

// Get credit composable for refreshing balance
const { refreshCredits } = useCredit();

const confirmTopUp = async () => {
  if (!selectedAmount.value || selectedAmount.value < 1) return;

  isLoading.value = true;
  try {
    const response = await $fetch('/api/credits/internal-topup', {
      method: 'POST',
      body: {
        amount: selectedAmount.value,
      },
    });

    if (response.success) {
      // Success - close modal and show success message
      showConfirmModal.value = false;

      // Show success toast
      toast.add({
        title: 'Success',
        description: response.message,
        color: 'green',
        timeout: 5000,
      });

      // Refresh the credit balance
      await refreshCredits();

      // Reset selected amount
      selectedAmount.value = 10;
      customAmount.value = undefined;
    } else {
      throw new Error('Top-up failed');
    }
  } catch (error) {
    console.error('Top-up failed:', error);

    // Show error toast
    toast.add({
      title: 'Error',
      description: 'Failed to process top-up. Please try again.',
      color: 'red',
      timeout: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

// No onMounted needed - consuming shared credit state from CreditsTab
</script>
