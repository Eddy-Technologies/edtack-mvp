<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Subscription Plans Test</h1>
        <p class="text-gray-600">Testing Stripe products API integration</p>
      </div>

      <!-- Stripe Products Display Component -->
      <StripeProductsDisplay />
    </div>
  </div>
</template>

<script setup lang="ts">
import StripeProductsDisplay from '~/components/subscription/StripeProductsDisplay.vue';

definePageMeta({
  layout: 'default'
});
</script>
