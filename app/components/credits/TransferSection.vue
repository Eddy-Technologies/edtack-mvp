<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Loading State -->
    <div v-if="isLoadingData" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
      <p class="text-gray-500">Loading family data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <svg
        class="w-12 h-12 mx-auto text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors" @click="loadFamilyData">
        Try Again
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="flex items-center mb-4">
        <div class="bg-purple-100 rounded-full p-2 mr-3">
          <svg
            class="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900">Transfer Credits</h3>
      </div>

      <p class="text-gray-600 mb-6">Send credits to family members instantly</p>

      <div v-if="!isParent" class="text-center py-8">
        <svg
          class="w-12 h-12 mx-auto text-gray-300 mb-3"
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
        <p class="text-gray-500 text-sm">Only parents can transfer credits</p>
        <p class="text-gray-400 text-xs mt-1">Ask your parent to send you credits</p>
      </div>

      <div v-else>
        <!-- Recipient Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Send To</label>
          <select
            v-model="selectedChild"
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a child</option>
            <option v-for="child in children" :key="child.userInfoId" :value="child.userInfoId">
              {{ child.name }} ({{ child.balanceInDollars.toFixed(2) }} {{ child.currency }})
            </option>
          </select>
        </div>

        <!-- Amount Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <div class="relative">
            <input
              v-model.number="transferAmount"
              type="number"
              min="1"
              :max="parentBalance"
              placeholder="0"
              class="block w-full pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">SGD</span>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            Available: {{ parentBalance ? (parentBalance / 100).toFixed(2) : '0.00' }} SGD
          </p>
        </div>

        <!-- Quick Amount Buttons -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Quick Amounts</label>
          <div class="flex space-x-2">
            <button
              v-for="amount in quickTransferAmounts"
              :key="amount"
              :disabled="amount > parentBalance"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              @click="transferAmount = amount"
            >
              {{ amount }}
            </button>
          </div>
        </div>

        <!-- Transfer Button -->
        <button
          :disabled="!selectedChild || !transferAmount || transferAmount > parentBalance || isLoading"
          class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          @click="handleTransfer"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          {{ isLoading ? 'Transferring...' : `Transfer $${(transferAmount || 0).toFixed(2)} SGD` }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// Use unified credit management - consume shared state
const {
  isParent,
  children,
  balanceInDollars: parentBalance,
  isLoading: isLoadingData,
  error,
  handleTransfer: handleCreditTransfer,
  handleTransaction
} = useCredit();

// Reactive state
const selectedChild = ref('');
const transferAmount = ref<number>();
const isLoading = ref(false);

const quickTransferAmounts = [5, 10, 25, 50];

const handleTransfer = async () => {
  if (!selectedChild.value || !transferAmount.value || transferAmount.value > parentBalance.value) {
    return;
  }

  const selectedChildData = children.value.find((c) => c.userInfoId === selectedChild.value);
  const selectedChildName = selectedChildData ? selectedChildData.name : 'Unknown';
  const transferAmountInCents = transferAmount.value * 100;

  // Optimistic update - update credit balances immediately
  handleCreditTransfer('parent', selectedChild.value, transferAmountInCents, `Transfer to ${selectedChildName}`);

  isLoading.value = true;
  try {
    const transferResponse = await $fetch('/api/credits/transfer', {
      method: 'POST',
      body: {
        toUserId: selectedChild.value,
        amount: transferAmount.value,
      },
    });

    if (transferResponse.success) {
      // Reset form
      selectedChild.value = '';
      transferAmount.value = undefined;

      alert('Transfer successful!');
    } else {
      throw new Error('Transfer failed');
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    
    // Revert optimistic updates on error
    handleCreditTransfer(selectedChild.value, 'parent', transferAmountInCents, 'Reverting failed transfer');

    alert('Transfer failed. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// No onMounted needed - using shared credit state only
</script>
