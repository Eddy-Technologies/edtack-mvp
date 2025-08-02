<template>
  <div class="dashboard-cart">
    <div class="cart-container">
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
      <div v-if="cart.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
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
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Items in Your Cart</h2>

            <div class="space-y-4">
              <div
                v-for="item in sortedCart"
                :key="item.id"
                class="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                >

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ item.name }}</h3>
                  <p class="text-sm text-gray-600 truncate">{{ item.description }}</p>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-lg font-semibold text-primary">S${{ (item.price).toFixed(2) }}</span>
                    <span class="text-sm text-gray-500">each</span>
                  </div>
                  <div v-if="item.addedAt" class="flex items-center space-x-1 mt-1">
                    <UIcon name="i-lucide-calendar" class="text-gray-400" size="12" />
                    <span class="text-xs text-gray-500">Added {{ formatDate(item.addedAt) }}</span>
                  </div>
                </div>

                <div class="flex items-center space-x-3">
                  <!-- Quantity Controls -->
                  <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <Button
                      icon="i-lucide-minus"
                      class="p-2 hover:bg-gray-200 rounded"
                      @clicked="updateQuantity(item, -1)"
                    />
                    <span class="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{{ item.quantity }}</span>
                    <Button
                      icon="i-lucide-plus"
                      class="p-2 hover:bg-gray-200 rounded"
                      @clicked="updateQuantity(item, 1)"
                    />
                  </div>

                  <!-- Item Total -->
                  <div class="text-right min-w-[4rem]">
                    <div class="text-lg font-semibold text-gray-900">
                      S${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <Button
                    icon="i-lucide-trash-2"
                    class="p-2 text-red-500 hover:bg-red-50 rounded"
                    @clicked="removeItem(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Items ({{ totalItems }})</span>
                <span class="text-gray-900">S${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">Free</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between text-lg font-semibold">
                  <span class="text-gray-900">Total</span>
                  <span class="text-gray-900">S${{ total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

            <div class="space-y-3">
              <!-- Pay with Credits Option -->
              <label class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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

              <!-- Pay with Card Option -->
              <label class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                    Pay directly with credit/debit card via Stripe
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Checkout Actions -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary-gray"
                text="Clear Cart"
                icon="i-lucide-trash-2"
                @clicked="clearCart"
              />

              <Button
                variant="primary"
                :text="checkoutButtonText"
                :disabled="!canCheckout"
                :is-loading="isProcessingCheckout"
                icon="i-lucide-shopping-cart"
                extra-classes="flex-1"
                @clicked="processCheckout"
              />
            </div>

            <!-- Payment Method Info -->
            <div v-if="paymentMethod" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <div v-if="paymentMethod === 'credits'" class="text-sm text-gray-700">
                <UIcon name="i-lucide-info" class="inline mr-1" size="16" />
                Your parent will be notified to approve and complete this purchase.
              </div>
              <div v-else-if="paymentMethod === 'card'" class="text-sm text-gray-700">
                <UIcon name="i-lucide-info" class="inline mr-1" size="16" />
                You will be redirected to Stripe to complete your payment.
              </div>
            </div>

            <!-- Insufficient Credits Warning -->
            <div v-if="paymentMethod === 'credits' && !hasEnoughCredits" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="text-sm text-red-700">
                <UIcon name="i-lucide-alert-triangle" class="inline mr-1" size="16" />
                Insufficient credits. You need S${{ (totalCents / 100 - balance / 100).toFixed(2) }} more credits.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Modal -->
      <div v-if="showProcessingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
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
import { ref, computed } from 'vue';
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
const { formattedBalance, balance } = useCredit();

// Reactive state
const paymentMethod = ref<'credits' | 'card'>('credits');
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
  if (paymentMethod.value === 'credits' && !hasEnoughCredits.value) return false;
  return true;
});

const checkoutButtonText = computed(() => {
  if (paymentMethod.value === 'credits') {
    return 'Request Parent Approval';
  } else {
    return 'Proceed to Payment';
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

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
        // Credits flow - show success message
        alert(`${purchaseResponse.message}\n\nOrder: ${purchaseResponse.orderNumber}\nTotal: S$${purchaseResponse.details.totalCostSGD}`);

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

<style scoped>
.dashboard-cart {
  height: 100%;
  overflow-y: auto;
}

.cart-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
  max-width: 4xl;
  margin: 0 auto;
}
</style>
