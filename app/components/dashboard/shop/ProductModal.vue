<template>
  <div
    v-if="isOpen && product"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Header with Close Button -->
      <div class="relative">
        <!-- Product Image -->
        <div class="aspect-square bg-gray-100">
          <img
            v-if="product.image && !imageError"
            :src="product.image"
            :alt="product.name"
            class="w-full h-full object-cover"
            @error="imageError = true"
          >
          <!-- Placeholder when no image -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center p-6"
          >
            <span class="text-gray-400 text-center text-lg font-medium">{{ product.name }}</span>
          </div>
        </div>

        <!-- Close Button -->
        <button
          class="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
          @click="closeModal"
        >
          <UIcon name="i-lucide-x" class="text-gray-600" size="20" />
        </button>

        <!-- Wishlist Button -->
        <button
          class="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
          @click="toggleWishlist"
        >
          <UIcon
            name="i-lucide-heart"
            :class="[isInWishlist ? 'text-red-500' : 'text-gray-400']"
            :style="isInWishlist ? 'fill: currentColor' : ''"
            size="20"
          />
        </button>

        <!-- Category Badge -->
        <span class="absolute bottom-3 left-3 bg-white/90 text-gray-700 text-sm px-3 py-1 rounded-full">
          {{ product.category }}
        </span>
      </div>

      <!-- Product Info -->
      <div class="p-5 space-y-4">
        <!-- Title & Description -->
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h2>
          <p class="text-gray-600 text-sm line-clamp-3">{{ product.description }}</p>
        </div>

        <!-- Price -->
        <div>
          <span class="text-2xl font-bold text-primary">S${{ product.price.toFixed(2) }}</span>
          <span class="text-sm text-gray-500 ml-2">({{ Math.round(product.price * 100) }} credits)</span>
        </div>

        <!-- Quantity Selector -->
        <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3">
          <span class="text-sm font-medium text-gray-700">Quantity</span>
          <div class="flex items-center gap-3">
            <button
              :disabled="quantity <= 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="quantity > 1 && quantity--"
            >
              <UIcon name="i-lucide-minus" size="16" />
            </button>
            <span class="w-8 text-center font-semibold">{{ quantity }}</span>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              @click="quantity++"
            >
              <UIcon name="i-lucide-plus" size="16" />
            </button>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <Button
          variant="primary"
          :text="`Add to Cart - S$${(product.price * quantity).toFixed(2)} (${Math.round(product.price * quantity * 100)} credits)`"
          size="lg"
          extra-classes="w-full"
          :disabled="isProcessing"
          @clicked="addToCart"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import Button from '../../common/Button.vue';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const props = defineProps<{
  isOpen: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-to-cart', product: Product, quantity: number): void;
  (e: 'toggle-wishlist', product: Product): void;
}>();

const quantity = ref(1);
const isInWishlist = ref(false);
const isProcessing = ref(false);
const imageError = ref(false);

const closeModal = () => {
  emit('close');
  quantity.value = 1;
  isProcessing.value = false;
};

const addToCart = () => {
  if (props.product && !isProcessing.value) {
    isProcessing.value = true;
    emit('add-to-cart', props.product, quantity.value);
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};

const toggleWishlist = () => {
  if (props.product) {
    isInWishlist.value = !isInWishlist.value;
    emit('toggle-wishlist', props.product);
  }
};

// Reset state when modal opens with new product
watchEffect(() => {
  if (props.isOpen && props.product) {
    quantity.value = 1;
    imageError.value = false;
  }
});
</script>
