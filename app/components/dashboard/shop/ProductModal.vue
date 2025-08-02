<template>
  <div v-if="isOpen && product" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto my-6 scrollbar-hide" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-end px-4 pt-4">
        <Button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          icon="i-lucide-x"
          @click="closeModal"
        />
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column - Images -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="relative">
              <img
                :src="selectedImage"
                :alt="product.name"
                class="w-full h-96 object-cover rounded-lg"
              >
              <!-- Sale Badge -->
              <span v-if="product.originalPrice" class="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
              </span>
              <!-- Wishlist Button -->
              <Button
                class="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                icon="i-lucide-heart"
                @click="toggleWishlist"
              />
            </div>
          </div>

          <!-- Right Column - Product Info -->
          <div class="space-y-6">
            <!-- Product Title & Category -->
            <div>
              <span class="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full mb-2">
                {{ product.category }}
              </span>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
              <p class="text-gray-600 text-lg">{{ product.description }}</p>
            </div>

            <!-- Rating -->
            <div class="flex items-center space-x-3">
              <div class="flex text-yellow-400">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-lucide-star"
                  :class="['w-5 h-5', i <= product.rating ? 'fill-current text-yellow-400' : 'text-gray-200']"
                  size="20"
                />
              </div>
              <span class="text-lg font-medium text-gray-900">{{ product.rating }}/5</span>
              <span class="text-gray-600">({{ product.reviewCount }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <span class="text-4xl font-bold text-primary">S${{ (product.price).toFixed(2) }}</span>
                <span v-if="product.originalPrice" class="text-2xl text-gray-500 line-through">S${{ (product.originalPrice).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="space-y-2">
              <label class="text-lg font-semibold text-gray-900">Quantity:</label>
              <div class="flex items-center space-x-3">
                <Button
                  :disabled="quantity <= 1"
                  class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  icon="i-lucide-minus"
                  @click="quantity > 1 && quantity--"
                />
                <span class="text-xl font-semibold px-4">{{ quantity }}</span>
                <Button
                  class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  icon="i-lucide-plus"
                  @click="quantity++"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <Button
                variant="primary"
                :text="`Add to Cart (S$${(product.price * quantity).toFixed(2)})`"
                size="lg"
                extra-classes="w-full"
                @clicked="addToCart"
              />
              <Button
                variant="secondary"
                text="Buy Now"
                size="lg"
                extra-classes="w-full"
                @clicked="buyNow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import Button from '../../common/Button.vue';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
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

// Reactive state
const selectedImage = ref('');
const quantity = ref(1);
const isInWishlist = ref(false);
const isProcessing = ref(false);

// Watch for product changes to update selected image
const updateSelectedImage = () => {
  if (props.product) {
    selectedImage.value = props.product.image;
  }
};

// Methods
const closeModal = () => {
  emit('close');
  quantity.value = 1;
  isProcessing.value = false;
};

const addToCart = () => {
  if (props.product && !isProcessing.value) {
    isProcessing.value = true;
    emit('add-to-cart', props.product, quantity.value);

    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};

const buyNow = () => {
  if (props.product && !isProcessing.value) {
    isProcessing.value = true;
    emit('add-to-cart', props.product, quantity.value);
    // Close modal first, then navigate to cart
    closeModal();
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      window.location.hash = '#cart';
      window.location.href = '/dashboard?tab=cart';
    }, 100);

    // Reset processing flag
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

// Watch for product changes
watchEffect(() => {
  updateSelectedImage();
});
</script>
