<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard?tab=shop" class="text-blue-600 hover:text-blue-700">
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
            </NuxtLink>
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

      <!-- Features Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Unlimited Access</h3>
          <p class="text-gray-600 text-sm">Access all premium features without any restrictions</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Smart Learning</h3>
          <p class="text-gray-600 text-sm">AI-powered personalized learning paths tailored to your needs</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Priority Support</h3>
          <p class="text-gray-600 text-sm">Get help when you need it with our premium support team</p>
        </div>
      </div>

      <!-- Stripe Pricing Table Container -->
      <div class="bg-white rounded-lg shadow-sm border p-8">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
          <p class="text-gray-600">Select the perfect plan for your educational journey</p>
        </div>

        <!-- Stripe Pricing Table -->
        <div class="flex justify-center">
          <stripe-pricing-table
            v-if="config.public.stripePricingTableId && config.public.stripePublishableKey"
            :pricing-table-id="config.public.stripePricingTableId"
            :publishable-key="config.public.stripePublishableKey"
            :customer-email="me.email"
            class="w-full max-w-4xl"
          />
          <div v-else class="text-center py-8">
            <div class="text-gray-500 mb-4">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p class="text-lg font-medium">Stripe configuration required</p>
              <p class="text-sm">Please configure your Stripe environment variables to display pricing options.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Indicators -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm border">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">Secure Payment</h4>
            <p class="text-sm text-gray-600">Your payment information is encrypted and secure</p>
          </div>
        </div>

        <div class="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm border">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">Cancel Anytime</h4>
            <p class="text-sm text-gray-600">No long-term commitment, cancel whenever you want</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const me = useMeStore();
const config = useRuntimeConfig();
</script>
