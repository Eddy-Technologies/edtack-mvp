<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Standardized Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex items-center justify-center w-11 h-11 bg-primary-100 rounded-xl">
        <UIcon name="i-lucide-plus-circle" class="text-primary-600" size="22" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Top Up Credits</h3>
        <p class="text-sm text-gray-500">Add credits to your account</p>
      </div>
    </div>

    <!-- Quick Amount Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Quick Amounts</label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="amount in quickAmounts"
          :key="amount.value"
          :class="[
            'group relative p-4 rounded-xl border-2 transition-all duration-200 text-center',
            selectedAmount === amount.value
              ? 'border-primary bg-primary-50 text-primary-700 shadow-sm ring-2 ring-primary/20'
              : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-700'
          ]"
          @click="selectedAmount = amount.value"
        >
          <!-- Selected indicator -->
          <div
            v-if="selectedAmount === amount.value"
            class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
          >
            <UIcon name="i-lucide-check" class="text-white" size="12" />
          </div>
          <div class="font-bold text-xl">${{ amount.value }}</div>
          <div class="text-sm text-gray-500 group-hover:text-gray-600">{{ amount.credits.toLocaleString() }} credits</div>
        </button>
      </div>
    </div>

    <!-- Custom Amount -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span class="text-gray-400 font-medium">$</span>
        </div>
        <input
          v-model.number="customAmount"
          type="number"
          min="1"
          max="500"
          placeholder="Enter amount"
          class="block w-full pl-8 pr-16 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
          @input="selectedAmount = customAmount"
        >
        <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span class="text-gray-400 text-sm font-medium">SGD</span>
        </div>
      </div>
    </div>

    <!-- Top Up Button -->
    <button
      :disabled="!selectedAmount || selectedAmount < 1 || isLoading"
      class="w-full bg-gradient-to-r from-primary to-primary-600 text-white py-4 px-6 rounded-xl font-semibold shadow-sm hover:shadow-md hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      @click="showConfirmModal = true"
    >
      <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      <UIcon v-else name="i-lucide-credit-card" size="20" />
      <span>{{ isLoading ? 'Processing...' : `Top Up $${selectedAmount || 0} (${(selectedAmount || 0) * 100} credits)` }}</span>
    </button>

    <!-- Payment Methods Info -->
    <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div class="flex items-center gap-3 text-sm text-gray-600">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <UIcon name="i-lucide-shield-check" class="text-green-600" size="16" />
        </div>
        <span>Secure internal credit system - no external payments</span>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <UModal v-model="showConfirmModal">
      <div class="p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl">
            <UIcon name="i-lucide-wallet" size="24" class="text-primary-600" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Confirm Top-Up</h3>
            <p class="text-sm text-gray-500">Review your credit pledge</p>
          </div>
        </div>

        <div class="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
          <p class="text-sm text-primary-800 font-medium">
            Conversion: ${{ selectedAmount }} SGD = {{ (selectedAmount * 100).toLocaleString() }} credits
          </p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Dollar amount:</span>
            <span class="font-semibold text-gray-900">${{ selectedAmount }} SGD</span>
          </div>
          <div class="flex justify-between items-center pt-3 border-t border-gray-200">
            <span class="text-gray-600">Credits to add:</span>
            <span class="font-bold text-lg text-primary">{{ (selectedAmount * 100).toLocaleString() }} credits</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            :disabled="isLoading"
            @click="showConfirmModal = false"
          >
            Cancel
          </button>
          <button
            class="flex-1 bg-gradient-to-r from-primary to-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center gap-2"
            :disabled="isLoading"
            @click="confirmTopUp"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <UIcon v-else name="i-lucide-check" size="18" />
            <span>{{ isLoading ? 'Processing...' : 'Confirm' }}</span>
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
