<template>
  <div>
    <div class="flex flex-wrap justify-between items-center mb-5">
      <h2 class="text-2xl font-extrabold text-primary text-center">STORE</h2>
    </div>

    <p class="mb-4">Here are some amazing products.</p>

    <!-- Icon View -->
    <div
      v-if="viewMode === 'icon'"
      class="grid gap-5 mt-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="flex flex-col items-center justify-center text-center p-4 max-w-xs w-full"
      >
        <div class="relative flex justify-center items-center group">
          <img
            :src="item.image"
            :alt="item.name"
            class="w-[150px] h-[150px] object-cover rounded mb-2"
          >
          <button
            class="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            :aria-label="'Add ' + item.name + ' to Cart'"
            @click="addToCart(item)"
          >
            Add to Cart
          </button>
        </div>
        <div>
          <h3>{{ item.name }}</h3>
          <p>{{ item.price }} Credits</p>
        </div>
        <p v-if="purchaseMessage === item.id" class="text-green-600">Purchase Successful!</p>
        <p v-if="insufficientFundsMessage === item.id" class="text-red-600">Insufficient Funds!</p>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="flex flex-col gap-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex flex-col items-center text-center p-4 w-full max-w-sm mx-auto"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="w-[150px] h-[150px] object-cover rounded mb-2"
        >
        <div>
          <h3>{{ item.name }}</h3>
          <p>Price: {{ item.price }} Credits</p>
        </div>
        <button
          class="mt-2 bg-black/70 text-white text-sm px-3 py-1 rounded"
          :aria-label="'Add ' + item.name + ' to Cart'"
          @click="addToCart(item)"
        >
          Add to Cart
        </button>
        <p v-if="purchaseMessage === item.id" class="text-green-600">Purchase Successful!</p>
        <p v-if="insufficientFundsMessage === item.id" class="text-red-600">Insufficient Funds!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import placeholder1 from '../../../assets/a.png';
import placeholder2 from '../../../assets/b.png';
import placeholder3 from '../../../assets/c.png';
import placeholder4 from '../../../assets/d.png';
import placeholder5 from '../../../assets/e.png';
import placeholder6 from '../../../assets/f.png';
import placeholder7 from '../../../assets/g.png';
import placeholder8 from '../../../assets/h.png';
import { useCreditStore } from '~/stores/credit';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'credits-updated', updatedCredits: number): void;
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

const items = [
  { id: '1', name: 'Chicha', price: 5, image: placeholder4 },
  { id: '3', name: 'KFC', price: 10, image: placeholder2 },
  { id: '2', name: 'Fornite', price: 10, image: placeholder1 },
  { id: '4', name: 'Riot Games', price: 30, image: placeholder3 },
  { id: '5', name: 'Roblox', price: 30, image: placeholder5 },
  { id: '6', name: 'Labubu', price: 99, image: placeholder6 },
  { id: '7', name: 'Pikachu Plush', price: 20, image: placeholder7 },
  { id: '8', name: 'Steam', price: 30, image: placeholder8 },
];

const purchaseMessage = ref<string | null>(null);
const insufficientFundsMessage = ref<string | null>(null);
const viewMode = ref<'icon' | 'list'>('icon');
const screenWidth = ref<number | null>(null);

const creditStore = useCreditStore();
const isWindowAvailable = typeof window !== 'undefined';

const buyItem = (item: any) => {
  if (creditStore.childCredits[0] >= item.price) {
    creditStore.childCredits[0] -= item.price;
    emit('credits-updated', creditStore.childCredits[0]);
    purchaseMessage.value = item.id;
    insufficientFundsMessage.value = null;

    setTimeout(() => {
      purchaseMessage.value = null;
    }, 3000);
  } else {
    insufficientFundsMessage.value = item.id;
    purchaseMessage.value = null;

    setTimeout(() => {
      insufficientFundsMessage.value = null;
    }, 3000);
  }
};

const addToCart = (item: any) => {
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    updatedCart.push({ ...item, quantity: 1 });
  }

  emit('add-to-cart', updatedCart);
};

const updateScreenSize = () => {
  if (isWindowAvailable) {
    screenWidth.value = window.innerWidth;
    if (screenWidth.value <= 768) {
      viewMode.value = 'icon';
    }
  }
};

onMounted(() => {
  updateScreenSize();
  if (isWindowAvailable) {
    window.addEventListener('resize', updateScreenSize);
  }
});

onUnmounted(() => {
  if (isWindowAvailable) {
    window.removeEventListener('resize', updateScreenSize);
  }
});
</script>
