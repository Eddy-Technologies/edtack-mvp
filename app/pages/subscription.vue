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

      <!-- Stripe Pricing Table -->
      <div class="flex justify-center">
        <stripe-pricing-table 
          pricing-table-id="prctbl_1RnYsF2ennKEEze8SxzrXmI5"
          publishable-key="pk_test_51RmqmU2ennKEEze82gSWEvmABvBIVugAVmR5NKvMxW1braDV3rc4DeO0SQulwsqoe4Zl7BT8yK5Bw4kk7vkm7BU100SRjRNxVK">
        </stripe-pricing-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const goBack = () => {
  window.history.back();
};
</script>
