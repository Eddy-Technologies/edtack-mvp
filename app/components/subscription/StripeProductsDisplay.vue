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
    <div v-else-if="products.length > 0" class="space-y-8">
      <!-- Monthly/Yearly Toggle -->
      <div class="flex justify-center">
        <div class="bg-gray-100 rounded-full p-1 flex">
          <Button
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-200',
              selectedInterval === 'month'
                ? 'bg-primary text-white shadow-sm hover:bg-primary'
                : 'bg-gray-100 text-gray-400 hover:bg-primary/60 hover:text-gray-100'
            ]"
            @click="selectedInterval = 'month'"
          >
            Monthly
          </Button>
          <Button
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-200',
              selectedInterval === 'year'
                ? 'bg-primary-500 text-white shadow-sm hover:bg-primary'
                : 'bg-gray-100 text-gray-400 hover:bg-primary/60 hover:text-gray-100'
            ]"
            @click="selectedInterval = 'year'"
          >
            Yearly
          </Button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div
          v-for="product in sortedProducts"
          :key="product.id"
          :class="[
            'rounded-2xl p-8 relative transition-all duration-200',
            isPopular(product.name) ? 'bg-primary/10': 'bg-white'
          ]"
        >
          <!-- Most Popular Badge -->
          <div v-if="isPopular(product.name)" class="absolute top-4 right-4">
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
              <div class="flex items text-left mb-2">
                <span class="text-5xl font-bold text-gray-900">
                  SGD {{ getMonthlyPrice(product) }}
                </span>
                <span class="text-gray-600 ml-2">
                  per<br>month
                </span>
              </div>

              <!-- Yearly billing info -->
              <div v-if="selectedInterval === 'year' && hasYearlyPricing(product)" class="text-left">
                <div class="text-sm text-gray-600">
                  Billed annually at SGD {{ getYearlyPrice(product) }}/year
                </div>
                <div class="text-sm text-secondary font-medium mt-1">
                  Save SGD {{ getYearlySavings(product) }} every year!
                </div>
              </div>

              <!-- Monthly billing info -->
              <div v-else-if="selectedInterval === 'month'" class="text-center">
                <div class="text-sm text-gray-600">
                  Billed monthly
                </div>
              </div>
            </div>

            <!-- Subscribe Button -->
            <Button
              :class="[
                'w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 mb-8',
              ]"
              :variant="'primary'"
              @click="selectPlan(product)"
            >
              Subscribe
            </Button>

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
import type { StripeProduct } from '~/composables/useSubscription';

// State
const products = ref<StripeProduct[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedInterval = ref<'month' | 'year'>('month');

// Stripe composable
const { getProducts } = useSubscription();

// Computed
const sortedProducts = computed(() => {
  // Sort products: Free, Pro, Max
  const order = ['Eddy Free', 'Eddy Pro', 'Eddy Max'];
  return [...products.value].sort((a, b) => {
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);
    return aIndex - bIndex;
  });
});

// Methods
const fetchPlans = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getProducts();
    products.value = response.products;
  } catch (err: any) {
    error.value = err.message || 'Failed to load subscription plans';
  } finally {
    loading.value = false;
  }
};

const formatPrice = (amount: number | null, currency: string) => {
  if (amount === null || amount === 0) return '0';

  return (amount / 100).toString();
};

const getMonthlyPrice = (product: StripeProduct): string => {
  // If yearly tab is selected, show monthly equivalent of yearly price
  if (selectedInterval.value === 'year') {
    const yearlyPrice = product.prices.find((price) =>
      price.recurring?.interval === 'year'
    );

    if (yearlyPrice?.unit_amount) {
      const monthlyEquivalent = yearlyPrice.unit_amount / 12;
      return (monthlyEquivalent / 100).toFixed(0);
    }
  }

  // Otherwise, return the actual monthly price
  const monthlyPrice = product.prices.find((price) =>
    price.recurring?.interval === 'month'
  );

  if (monthlyPrice) {
    return formatPrice(monthlyPrice.unit_amount, monthlyPrice.currency);
  }

  // Fallback to default price if it's monthly
  if (product.default_price?.recurring?.interval === 'month') {
    return formatPrice(product.default_price.unit_amount, product.default_price.currency);
  }

  // For free plans or if no monthly price exists
  return '0';
};

const getYearlyPrice = (product: StripeProduct): string => {
  const yearlyPrice = product.prices.find((price) =>
    price.recurring?.interval === 'year'
  );

  if (yearlyPrice) {
    return formatPrice(yearlyPrice.unit_amount, yearlyPrice.currency);
  }

  return '0';
};

const getCurrentPrice = (product: StripeProduct): string => {
  // Find the price for the selected interval
  const targetPrice = product.prices.find((price) =>
    price.recurring?.interval === selectedInterval.value
  );

  if (targetPrice) {
    return formatPrice(targetPrice.unit_amount, targetPrice.currency);
  }

  // Fallback to default price
  if (product.default_price) {
    return formatPrice(product.default_price.unit_amount, product.default_price.currency);
  }

  return '0';
};

const isPopular = (productName: string): boolean => {
  return productName.includes('Pro');
};

const hasYearlyPricing = (product: StripeProduct): boolean => {
  return product.prices.some((price) => price.recurring?.interval === 'year');
};

const getYearlySavings = (product: StripeProduct): string => {
  const monthlyPrice = product.prices.find((price) =>
    price.recurring?.interval === 'month'
  );
  const yearlyPrice = product.prices.find((price) =>
    price.recurring?.interval === 'year'
  );

  if (monthlyPrice?.unit_amount && yearlyPrice?.unit_amount) {
    const monthlyTotal = monthlyPrice.unit_amount * 12;
    const savings = monthlyTotal - yearlyPrice.unit_amount;
    return (savings / 100).toFixed(0);
  }

  return '0';
};

const selectPlan = async (product: StripeProduct) => {
  // Handle free plan
  if (product.name.includes('Free') || getCurrentPrice(product) === '0') {
    // For free plans, you might want to just redirect to dashboard or register
    await navigateTo({ path: '/' });
    return;
  }

  try {
    // Find the price for the selected interval
    const selectedPrice = product.prices.find((price) =>
      price.recurring?.interval === selectedInterval.value
    ) || product.default_price;

    if (!selectedPrice) {
      throw new Error('No price found for selected plan');
    }

    // Navigate to checkout with priceId
    await navigateTo({
      path: '/subscription/checkout',
      query: {
        priceId: selectedPrice.id
      }
    });
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
