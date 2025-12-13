<template>
  <div class="h-full overflow-y-auto">
    <div class="p-5 sm:p-6 max-w-4xl mx-auto min-h-full">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p class="text-gray-600">Review and checkout your selected items</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Credit Balance Display -->
            <div class="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                <UIcon name="i-lucide-coins" class="text-blue-600" size="18" />
              </div>
              <div>
                <p class="text-xs text-gray-600 font-medium">Available Credits</p>
                <p class="text-lg font-bold text-blue-700">{{ formattedBalance }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-if="cart.length === 0" class="text-center py-16 bg-stone-50 rounded-xl">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-shopping-cart" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p class="text-gray-500 mb-6">Add some items from the shop to get started!</p>
        <Button
          variant="primary"
          text="Continue Shopping"
          icon="i-lucide-shopping-bag"
          @clicked="goToShop"
        />
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-6">
        <!-- Cart Items List -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Items in Your Cart</h2>

            <div class="space-y-4">
              <div
                v-for="item in sortedCart"
                :key="item.id"
                class="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <!-- Product Image -->
                <div class="relative w-full sm:w-24 h-32 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    v-if="item.image && !imageErrors[item.id]"
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    @error="imageErrors[item.id] = true"
                  >
                  <!-- Placeholder when no image -->
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center p-2"
                  >
                    <span class="text-gray-400 text-center text-xs font-medium line-clamp-3">{{ item.name }}</span>
                  </div>
                  <!-- Category Badge -->
                  <span
                    v-if="item.category"
                    class="absolute bottom-1 left-1 bg-white/90 text-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {{ item.category }}
                  </span>
                </div>

                <!-- Product Info -->
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                  <h3 class="font-medium text-gray-900 line-clamp-2">{{ item.name }}</h3>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-lg font-bold text-primary">S${{ item.price.toFixed(2) }}</span>
                    <span class="text-sm text-gray-500">({{ Math.round(item.price * 100) }} credits)</span>
                    <span class="text-sm text-gray-400">each</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                      @click="updateQuantity(item, -1)"
                    >
                      <UIcon name="i-lucide-minus" size="16" class="text-gray-600" />
                    </button>
                    <span class="w-8 text-center font-semibold text-gray-900">{{ item.quantity }}</span>
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                      @click="updateQuantity(item, 1)"
                    >
                      <UIcon name="i-lucide-plus" size="16" class="text-gray-600" />
                    </button>
                  </div>

                  <!-- Item Total -->
                  <div class="text-right">
                    <div class="text-lg font-bold text-gray-900">
                      S${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      ({{ Math.round(item.price * item.quantity * 100) }} credits)
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    @click="removeItem(item)"
                  >
                    <UIcon name="i-lucide-trash-2" size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Items ({{ totalItems }})</span>
                <span class="text-gray-900">S${{ subtotal.toFixed(2) }} <span class="text-gray-500">({{ Math.round(subtotal * 100) }} credits)</span></span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">Free</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between text-lg font-semibold">
                  <span class="text-gray-900">Total</span>
                  <div class="text-right">
                    <span class="text-gray-900">S${{ total.toFixed(2) }}</span>
                    <span class="text-sm text-gray-500 block">({{ Math.round(total * 100) }} credits)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

            <div class="space-y-3">
              <!-- Pay with Credits Option (Children only) -->
              <label v-if="!isParent" class="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="credits"
                  class="mt-1"
                >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-lucide-coins" class="text-blue-600" size="20" />
                    <span class="font-medium text-gray-900">Pay with Credits</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    Use your earned credits (requires parent approval)
                  </p>
                  <div class="text-sm mt-2">
                    <span class="text-gray-600">Available: </span>
                    <span :class="hasEnoughCredits ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                      {{ formattedBalance }}
                    </span>
                  </div>
                </div>
              </label>

              <!-- Pay with Card Option (Parents always, Children as alternative) -->
              <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="card"
                  class="mt-1"
                >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-lucide-credit-card" class="text-green-600" size="20" />
                    <span class="font-medium text-gray-900">Pay with Credit Card</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ isParent ? 'Pay directly with your credit/debit card via Stripe' : 'Pay directly with credit/debit card (no parent approval needed)' }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Checkout Actions -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary"
                text="Clear Cart"
                icon="i-lucide-trash-2"
                @clicked="clearCart"
              />

              <Button
                variant="primary"
                :text="checkoutButtonText"
                :disabled="!canCheckout"
                :is-loading="isProcessingCheckout || isLoading"
                icon="i-lucide-shopping-cart"
                extra-classes="flex-1"
                @clicked="processCheckout"
              />
            </div>

            <!-- Payment Method Info -->
            <div v-if="paymentMethod && !isLoading" class="mt-4 p-3 bg-stone-50 rounded-xl">
              <div v-if="paymentMethod === 'credits'" class="text-sm text-gray-700">
                <UIcon name="i-lucide-info" class="inline mr-1" size="16" />
                Your parent will be notified to approve and complete this purchase with their credit card.
              </div>
              <div v-else-if="paymentMethod === 'card'" class="text-sm text-gray-700">
                <UIcon name="i-lucide-info" class="inline mr-1" size="16" />
                You will be redirected to Stripe to complete your payment.
              </div>
            </div>

            <!-- Insufficient Credits Warning -->
            <div v-if="paymentMethod === 'credits' && !hasEnoughCredits" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div class="text-sm text-red-700">
                <UIcon name="i-lucide-alert-triangle" class="inline mr-1" size="16" />
                Insufficient credits. You need {{ totalCents - balance }} more credits.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Modal -->
      <div v-if="showProcessingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 max-w-md mx-4">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ processingMessage }}</h3>
            <p class="text-gray-600">{{ processingDetails }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../common/Button.vue';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'update-cart', updatedCart: any[]): void;
  (e: 'clear-cart'): void;
}>();

const router = useRouter();

// Use credit composable
const { formattedBalance, balance, fetchCredits, isLoading } = useCredit();

// Use me store for user role
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);

// Reactive state - default to credits for children, card for parents
const paymentMethod = ref<'credits' | 'card'>('credits');
const imageErrors = ref<Record<string, boolean>>({});
const isProcessingCheckout = ref(false);
const showProcessingModal = ref(false);
const processingMessage = ref('');
const processingDetails = ref('');

// Computed properties
const sortedCart = computed(() => {
  return [...props.cart].sort((a, b) => {
    // Sort by addedAt date, oldest first
    const dateA = new Date(a.addedAt || '1970-01-01').getTime();
    const dateB = new Date(b.addedAt || '1970-01-01').getTime();
    return dateA - dateB;
  });
});

const totalItems = computed(() => {
  return props.cart.reduce((sum, item) => sum + item.quantity, 0);
});

const subtotal = computed(() => {
  return props.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const total = computed(() => subtotal.value);

const totalCents = computed(() => Math.round(total.value * 100));

const hasEnoughCredits = computed(() => {
  return balance.value >= totalCents.value;
});

const canCheckout = computed(() => {
  if (props.cart.length === 0) return false;
  if (isLoading.value) return false; // Disable while loading credit data
  if (paymentMethod.value === 'credits' && !hasEnoughCredits.value) return false;
  return true;
});

const checkoutButtonText = computed(() => {
  if (isLoading.value) {
    return 'Loading...';
  }
  if (paymentMethod.value === 'credits') {
    return 'Request Parent Approval'; // Only children can use credits
  } else {
    return isParent.value ? 'Purchase Now' : 'Proceed to Payment';
  }
});

// Functions
const updateQuantity = (item: any, change: number) => {
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += change;
    // Update timestamp when quantity changes
    existingItem.lastUpdated = new Date().toISOString();

    if (existingItem.quantity <= 0) {
      const index = updatedCart.indexOf(existingItem);
      updatedCart.splice(index, 1);
    }
  }

  emit('update-cart', updatedCart);
};

const removeItem = (item: any) => {
  const updatedCart = props.cart.filter((cartItem) => cartItem.id !== item.id);
  emit('update-cart', updatedCart);
};

const clearCart = () => {
  emit('clear-cart');
};

const goToShop = () => {
  router.push('/dashboard?tab=shop');
};

// Fetch credit data when cart loads
onMounted(async () => {
  await fetchCredits();

  // Set payment method based on user type
  if (isParent.value) {
    paymentMethod.value = 'card'; // Parents can only pay with card
  } else {
    paymentMethod.value = 'credits'; // Children default to credits
  }
});

const processCheckout = async () => {
  try {
    isProcessingCheckout.value = true;
    showProcessingModal.value = true;

    if (paymentMethod.value === 'credits') {
      processingMessage.value = 'Requesting Parent Approval';
      processingDetails.value = 'Your parent will receive a notification to approve this purchase...';
    } else {
      processingMessage.value = 'Creating Payment Session';
      processingDetails.value = 'Redirecting you to secure payment...';
    }

    const purchaseResponse = await $fetch('/api/shop/purchase', {
      method: 'POST',
      body: {
        items: props.cart,
        use_credits: paymentMethod.value === 'credits'
      }
    });

    if (purchaseResponse.success) {
      showProcessingModal.value = false;

      if (paymentMethod.value === 'credits') {
        // Credits flow - show success message (only for children)
        alert(`${purchaseResponse.message}\n\nOrder: ${purchaseResponse.orderNumber}\nTotal: ${purchaseResponse.details.totalCostCents} credits`);

        // Clear cart after successful request
        emit('clear-cart');
      } else {
        // Card flow - redirect to Stripe
        if (purchaseResponse.stripeCheckoutUrl) {
          window.location.href = purchaseResponse.stripeCheckoutUrl;
        } else {
          throw new Error('No checkout URL provided');
        }
      }
    } else {
      throw new Error(purchaseResponse.message || 'Checkout failed');
    }
  } catch (error: any) {
    console.error('Checkout failed:', error);
    showProcessingModal.value = false;

    let errorMessage = 'Checkout failed. Please try again.';
    if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    alert(errorMessage);
  } finally {
    isProcessingCheckout.value = false;
  }
};
</script>
