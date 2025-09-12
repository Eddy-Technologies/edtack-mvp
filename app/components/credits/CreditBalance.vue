<template>
  <div class="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-white shadow-lg">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
      <p class="text-blue-100">Loading balance...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <UIcon name="i-lucide-alert-circle" class="text-red-400" size="48" />
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
        <div class="flex items-center justify-center bg-gray-300 p-3 bg-opacity-30 rounded-full">
          <UIcon
            name="i-lucide-circle-dollar-sign"
            class="text-white cursor-pointer"
            size="48"
          />
        </div>
      </div>

      <!-- Balance Display -->
      <div class="mb-6">
        <div class="flex items-baseline space-x-2">
          <span class="text-5xl font-bold">{{ balance }}</span>
          <span class="text-2xl font-medium text-blue-100">
            credits
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use unified credit management - consume shared state only
const {
  balance,
  isLoading,
  error,
  refreshCredits
} = useCredit();

// Alias for template consistency
const loadBalance = refreshCredits;
</script>
