<template>
  <!-- 🔹 Desktop Cart -->
  <div class="hidden sm:block">
    <div class="border border-black p-4 rounded max-w-md">
      <h3 class="text-lg font-semibold mb-4">Your Cart</h3>
      <ul>
        <li v-for="item in cart" :key="item.id" class="flex items-center justify-between mb-3">
          <div class="flex flex-col gap-1 w-full">
            <!-- Row 1: Image, Name, Quantity & Delete -->
            <div class="flex items-center justify-between w-full gap-2">
              <div class="flex items-center gap-2">
                <img :src="item.image" :alt="item.name" class="w-10 h-10 rounded object-cover">
                <p class="text-sm">{{ item.name }}</p>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="w-14 px-2 py-1 border rounded text-sm text-center"
                  @change="updateQuantity(item)"
                >
                <UIcon
                  name="i-heroicons-trash"
                  class="w-5 h-5 text-red-500 cursor-pointer"
                  @click="deleteItem(item)"
                />
              </div>
            </div>

            <!-- Row 2: Price aligned right -->
            <div class="text-sm font-semibold text-gray-700 text-right pr-1">
              {{ item.price * item.quantity }}C
            </div>
          </div>
        </li>
      </ul>
      <p v-if="cart.length > 0" class="text-right text-lg font-semibold mt-4">
        Total: {{ totalCredits }}C
      </p>
      <button
        v-if="cart.length > 0"
        class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded mt-3 text-sm"
        @click="checkout"
      >
        Checkout
      </button>
      <p v-else class="text-center text-gray-500 text-sm mt-4">Your cart is empty.</p>
    </div>
  </div>

  <!-- 🔸 Mobile Cart Trigger -->
  <button
    v-if="!showCart"
    class="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-full sm:hidden"
    @click="showCart = true"
  >
    Open Cart
  </button>

  <!-- 🔸 Mobile Cart Modal -->
  <div
    v-if="showCart"
    class="fixed inset-0 z-40 bg-black/50 sm:hidden"
    @click.self="showCart = false"
  >
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-lg shadow-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">Your Cart</h3>
        <button @click="showCart = false">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <ul>
        <li v-for="item in cart" :key="item.id" class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <img :src="item.image" :alt="item.name" class="w-10 h-10 rounded object-cover">
            <p class="text-sm">{{ item.name }}</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="item.quantity"
              type="number"
              min="1"
              class="w-14 px-2 py-1 border rounded text-sm text-center"
              @change="updateQuantity(item)"
            >
            <UIcon
              name="i-heroicons-trash"
              class="w-5 h-5 text-red-500 cursor-pointer"
              @click.stop="deleteItem(item)"
            />
          </div>
        </li>
      </ul>

      <p v-if="cart.length > 0" class="text-right text-lg font-semibold mt-3">
        Total: {{ totalCredits }}C
      </p>
      <button
        v-if="cart.length > 0"
        class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded mt-3 text-sm"
        @click="checkout"
      >
        Checkout
      </button>
      <p v-else class="text-center text-gray-500 text-sm mt-3">Your cart is empty.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCreditStore } from '~/stores/credit';
import type { Cart } from '~/models/Item';
import { calculateItemSubTotal } from '~/utils/calculateCreditsUtils';

// Props and Emits
const props = defineProps<{ cart: Cart }>();
const emit = defineEmits<{
  (e: 'update-cart', updatedCart: Cart): void;
}>();

// Router & Store
const router = useRouter();
const creditStore = useCreditStore();

// Local State
const showCart = ref(false);

// Computed Total
const totalCredits = computed(() =>
  props.cart.reduce((total, item) => total + calculateItemSubTotal(item), 0)
);

// Update Quantity
const updateQuantity = (item: Cart[number]) => {
  if (item.quantity < 1) item.quantity = 1;
  emit(
    'update-cart',
    props.cart.map((cartItem) =>
      cartItem.id === item.id ? { ...cartItem, quantity: item.quantity } : cartItem
    )
  );
};

// Delete Item
const deleteItem = (item: Cart[number]) => {
  emit(
    'update-cart',
    props.cart.filter((cartItem) => cartItem.id !== item.id)
  );
};

// Checkout
const checkout = () => {
  if (!props.cart.length) {
    alert('Your cart is empty!');
    return;
  }
  const creditsAvailable = creditStore.childCredits?.[0] ?? 0;
  if (creditsAvailable < totalCredits.value) {
    alert('You do not have enough credits to complete this purchase!');
    return;
  }
  router.push({
    name: 'summary',
    query: {
      extraFee: 0,
      discount: 0,
      withdrawalAmt: 0,
      cart: JSON.stringify(props.cart),
    },
  });
};
</script>
