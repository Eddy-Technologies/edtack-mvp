<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p class="text-xl text-gray-600">Select the perfect subscription plan for your learning journey</p>
      </div>

      <StripeProductsDisplay />
    </div>
  </div>
</template>

<script setup lang="ts">
import StripeProductsDisplay from '~/components/subscription/StripeProductsDisplay.vue';
</script>
