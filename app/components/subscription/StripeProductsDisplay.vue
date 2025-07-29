<template>
  <div class="subscription-plans-container">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <!-- Toggle Skeleton -->
      <div class="flex justify-center">
        <div class="animate-pulse bg-gray-200 rounded-full h-12 w-48" />
      </div>

      <!-- Cards Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
            <!-- Badge skeleton -->
            <div class="h-6 w-24 bg-gray-200 rounded-full mx-auto" />
            <!-- Title skeleton -->
            <div class="h-8 w-32 bg-gray-200 rounded mx-auto" />
            <!-- Description skeleton -->
            <div class="h-4 w-full bg-gray-200 rounded" />
            <!-- Price skeleton -->
            <div class="h-12 w-40 bg-gray-200 rounded mx-auto" />
            <!-- Button skeleton -->
            <div class="h-12 w-full bg-gray-200 rounded-xl" />
            <!-- Features skeleton -->
            <div class="space-y-3">
              <div class="h-4 w-full bg-gray-200 rounded" />
              <div class="h-4 w-full bg-gray-200 rounded" />
              <div class="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="fetchPlans"
      >
        Try Again
      </button>
    </div>

    <!-- Products Display -->
    <div v-else-if="sortedProducts.length > 0" class="space-y-8">
      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div
          v-for="product in sortedProducts"
          :key="product.id"
          :class="[
            'rounded-2xl p-8 relative transition-all duration-200',
            isPopular(product.priceLookupKey) ? 'bg-primary/10': 'border border-primary bg-white'
          ]"
        >
          <!-- Most Popular Badge -->
          <div v-if="isPopular(product.priceLookupKey)" class="absolute top-4 right-4">
            <span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-secondary text-white">
              Most popular
            </span>
          </div>

          <div class="text-left mt-8">
            <!-- Product Name -->
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>

            <!-- Product Description -->
            <p v-if="product.description" class="text-gray-600 mb-6">{{ product.description }}</p>

            <!-- Pricing Display -->
            <div class="mb-8">
              <div class="flex items-end text-center mb-2">
                <span class="text-5xl font-bold text-gray-900 uppercase">
                  {{ product.currency }} {{ product.amount / 100 }}
                </span>
                <span class="text-gray-600 ml-2 text-lg">
                  per {{ product.interval === 'month' ? 'month' : 'year' }}
                </span>
              </div>

              <!-- Monthly billing info -->
              <div v-if="product.priceLookupKey !== STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY" class="text-center mt-8">
                <Button
                  :class="[
                    'w-full py-4 px-6 rounded-xl font-medium transition-all duration-200',
                  ]"
                  :variant="'primary'"
                  @click="selectPlan(product)"
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <!-- Features -->
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 mb-4">This includes:</p>
              <ul v-if="product.marketing_features?.length" class="space-y-3">
                <li
                  v-for="feature in product.marketing_features"
                  :key="feature.name"
                  class="flex items-start text-sm text-gray-600"
                >
                  <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ feature.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Products -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No subscription plans available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../common/Button.vue';
import type { GetProductResponse } from '~/composables/useStripe';
import { STRIPE_LOOKUP_KEYS } from '~~/utils/constants';

// State
const products = ref<GetProductResponse[]>();
const loading = ref(false);
const error = ref<string | null>(null);

// Stripe composable
const { getProducts } = useStripe();

// Computed
const sortedProducts = computed(() => {
  // Sort products: Free, Pro, Max
  const order = [STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY, STRIPE_LOOKUP_KEYS.EDDY_PRO_MONTHLY];
  return products.value?.slice().sort((a, b) => {
    const aIndex = order.indexOf(a.priceLookupKey);
    const bIndex = order.indexOf(b.priceLookupKey);
    return aIndex - bIndex;
  }) || [];
});

// Methods
const fetchPlans = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getProducts();
    products.value = response;
  } catch (err: any) {
    error.value = err.message || 'Failed to load subscription plans';
  } finally {
    loading.value = false;
  }
};

const isPopular = (lookupKey: string): boolean => {
  return lookupKey === STRIPE_LOOKUP_KEYS.EDDY_PRO_MONTHLY;
};

const selectPlan = async (product: GetProductResponse) => {
  // Handle free plan
  if (product.priceLookupKey === STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY) {
    // For free plans, you might want to just redirect to dashboard or register
    await navigateTo({ path: '/' });
    return;
  }

  try {
    const meStore = useMeStore();

    // 1. Check if user is logged in
    if (!meStore.isLoggedIn) {
      // 2. If not logged in, redirect to login
      await navigateTo('/login');
      return;
    }

    // 3. If logged in, check if payment_customer_id exists
    if (meStore.payment_customer_id) {
      // If yes, redirect to external stripe customer portal
      const { openCustomerPortal } = useStripe();
      openCustomerPortal(meStore.email);
      return;
    }

    // 4. If no payment_customer_id, check if onboarded
    if (!meStore.onboarding_completed) {
      // If not onboarded, redirect to onboard page
      await navigateTo('/onboarding');
      return;
    }

    // If user is logged in, has no payment_customer_id, and is onboarded,
    // this means they need to subscribe first - redirect to customer portal
    // Note: This case should be rare as users should have payment_customer_id after first subscription
    const { openCustomerPortal } = useStripe();
    openCustomerPortal(meStore.email);
  } catch (err: any) {
    console.error('Failed to start checkout:', err);
    error.value = err.message || 'Failed to start checkout process';
  }
};

// Initialize
onMounted(() => {
  fetchPlans();
});
</script>
