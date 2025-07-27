<template>
  <div class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
      <p class="text-blue-100">Loading balance...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <svg
        class="w-12 h-12 mx-auto text-red-300 mb-4"
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
      <p class="text-red-200 mb-4">{{ error }}</p>
      <button class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors" @click="loadBalance">
        Try Again
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">Available Credits</h2>
          <p class="text-blue-100 text-sm">Your current balance</p>
        </div>
        <div class="bg-white bg-opacity-20 rounded-full p-3">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
          </svg>
        </div>
      </div>

      <!-- Balance Display -->
      <div class="mb-6">
        <div class="flex items-baseline space-x-2">
          <span class="text-5xl font-bold">{{ balance }}</span>
          <span class="text-2xl font-medium text-blue-100">
            SGD
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use unified credit management - consume shared state only
const {
  balanceInDollars: balance,
  currency,
  isLoading,
  error,
  refreshCredits
} = useCredit();

// Alias for template consistency
const loadBalance = refreshCredits;
</script>
