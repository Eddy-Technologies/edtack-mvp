<template>
  <!-- Dashboard Cart -->
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-xl font-semibold mb-4 text-gray-900">Your Cart</h3>

    <div v-if="cart.length > 0" class="space-y-4">
      <div v-for="item in cart" :key="item.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3 flex-1">
          <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded object-cover">
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-600">{{ item.price }}C each</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            class="w-16 px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="updateQuantity(item)"
          >
          <button
            class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            @click="deleteItem(item)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Total -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center text-lg font-semibold">
          <span class="text-gray-900">Total:</span>
          <span class="text-primary">{{ totalCredits }}C</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          class="flex-1 bg-primary hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          @click="checkout"
        >
          Checkout
        </button>
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
          @click="clearCart"
        >
          Clear
        </button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <svg
        class="w-16 h-16 mx-auto text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h8.2M7 18a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      <p class="text-gray-500">Your cart is empty</p>
      <p class="text-sm text-gray-400 mt-1">Add some items to get started!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'update-cart', updatedCart: any[]): void;
  (e: 'clear-cart'): void;
}>();

const totalCredits = computed(() => {
  return props.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const updateQuantity = (item: any) => {
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  emit('update-cart', [...props.cart]);
};

const deleteItem = (itemToDelete: any) => {
  const updatedCart = props.cart.filter((item) => item.id !== itemToDelete.id);
  emit('update-cart', updatedCart);
};

const clearCart = () => {
  emit('clear-cart');
};

const checkout = () => {
  // Navigate to checkout page or handle checkout logic
  // For now, we'll just clear the cart
  alert(`Checkout complete! Total: ${totalCredits.value}C`);
  emit('clear-cart');
};
</script>
