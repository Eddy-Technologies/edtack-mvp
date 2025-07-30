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

            <!-- Thumbnail Images -->
            <div class="flex space-x-2 overflow-x-auto">
              <button
                v-for="(image, index) in productImages"
                :key="index"
                :class="[
                  'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                  selectedImage === image ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                ]"
                @click="selectedImage = image"
              >
                <img :src="image" :alt="`${product.name} view ${index + 1}`" class="w-full h-full object-cover">
              </button>
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
                <span class="text-4xl font-bold text-primary">{{ product.price }}C</span>
                <span v-if="product.originalPrice" class="text-2xl text-gray-500 line-through">{{ product.originalPrice }}C</span>
              </div>
              <p class="text-gray-600">≈ ${{ (product.price * 0.1).toFixed(2) }} USD</p>
            </div>

            <!-- Product Features -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900">Features:</h3>
              <ul class="space-y-2">
                <li v-for="feature in productFeatures" :key="feature" class="flex items-center space-x-2">
                  <div class="flex items-center justify-center w-5 h-5 text-green-500">
                    <UIcon name="i-lucide-check" size="20" />
                  </div>
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
              </ul>
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
                :text="`Add to Cart (${product.price * quantity}C)`"
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

            <!-- Additional Info -->
            <div class="pt-4 border-t space-y-2">
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-package" size="16" />
                </div>
                <span>Free delivery on orders over 50C</span>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-check-circle" size="16" />
                </div>
                <span>30-day return guarantee</span>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <div class="flex items-center justify-center w-4 h-4">
                  <UIcon name="i-lucide-shield-check" size="16" />
                </div>
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="mt-12 border-t pt-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Customer Reviews</h3>
            <button class="bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Write Review
            </button>
          </div>

          <!-- Review Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <span class="text-4xl font-bold text-gray-900">{{ product.rating }}</span>
                <div>
                  <div class="flex text-yellow-400 mb-1">
                    <UIcon
                      v-for="i in 5"
                      :key="i"
                      name="i-lucide-star"
                      :class="['w-6 h-6', i <= product.rating ? 'fill-current text-yellow-400' : 'text-gray-200']"
                      size="24"
                    />
                  </div>
                  <p class="text-gray-600">Based on {{ product.reviewCount }} reviews</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div v-for="(count, rating) in ratingBreakdown" :key="rating" class="flex items-center space-x-3">
                <span class="text-sm text-gray-600 w-8">{{ rating }}★</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-yellow-400 h-2 rounded-full"
                    :style="{ width: `${(count / product.reviewCount) * 100}%` }"
                  />
                </div>
                <span class="text-sm text-gray-600 w-8">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- Individual Reviews -->
          <div class="space-y-6">
            <div v-for="review in productReviews" :key="review.id" class="border rounded-lg p-6">
              <div class="flex items-start space-x-4">
                <img :src="review.avatar" :alt="review.name" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ review.name }}</h4>
                      <div class="flex items-center space-x-2">
                        <div class="flex text-yellow-400">
                          <UIcon
                            v-for="i in 5"
                            :key="i"
                            name="i-lucide-star"
                            :class="['w-4 h-4', i <= review.rating ? 'fill-current text-yellow-400' : 'text-gray-200']"
                            size="16"
                          />
                        </div>
                        <span class="text-sm text-gray-500">{{ review.date }}</span>
                      </div>
                    </div>
                    <span v-if="review.verified" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  </div>
                  <p class="text-gray-700 mb-3">{{ review.comment }}</p>
                  <div v-if="review.images && review.images.length > 0" class="flex space-x-2">
                    <img
                      v-for="(image, index) in review.images"
                      :key="index"
                      :src="image"
                      :alt="`Review image ${index + 1}`"
                      class="w-16 h-16 object-cover rounded-lg border"
                    >
                  </div>
                  <div class="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <Button class="flex items-center space-x-1 hover:text-gray-700" icon="i-lucide-thumbs-up" @click="review.helpful++">
                      <span>Helpful ({{ review.helpful }})</span>
                    </Button>
                    <Button class="hover:text-gray-700">Reply</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Reviews -->
          <div class="text-center mt-8">
            <button class="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors">
              Load More Reviews
            </button>
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

// Mock data for enhanced product display
const productImages = computed(() => {
  if (!props.product) return [];
  return [
    props.product.image,
    props.product.image, // In real app, these would be different angles
    props.product.image,
    props.product.image
  ];
});

const productFeatures = computed(() => {
  if (!props.product) return [];
  const features: Record<string, string[]> = {
    'Gaming': ['High-quality graphics', 'Multiplayer support', 'Regular updates', 'Cross-platform compatibility'],
    'Gift Cards': ['Instant delivery', 'No expiration date', 'Easy to redeem', 'Perfect for gifts'],
    'Food & Beverages': ['Premium quality', 'Natural ingredients', 'Rich flavor', 'Ethically sourced'],
    'Collectibles': ['Limited edition', 'Certificate of authenticity', 'Premium packaging', 'Investment value'],
    'Toys': ['Safe materials', 'Age appropriate', 'Educational value', 'Durable construction']
  };
  return features[props.product.category] || ['High quality', 'Great value', 'Customer satisfaction', 'Fast delivery'];
});

const ratingBreakdown = computed(() => {
  const reviewCount = props.product?.reviewCount || 0;
  return {
    5: Math.floor(reviewCount * 0.6),
    4: Math.floor(reviewCount * 0.25),
    3: Math.floor(reviewCount * 0.1),
    2: Math.floor(reviewCount * 0.03),
    1: Math.floor(reviewCount * 0.02)
  };
});

const productReviews = ref([
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a4c8d5?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    date: '2 days ago',
    comment: 'Absolutely love this product! The quality exceeded my expectations and delivery was super fast. Highly recommend to anyone looking for something like this.',
    verified: true,
    helpful: 12,
    images: []
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    date: '1 week ago',
    comment: 'Great value for money. The product works exactly as described. Only minor issue was the packaging could be better, but the product itself is excellent.',
    verified: true,
    helpful: 8,
    images: []
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Perfect! This is exactly what I was looking for. The quality is amazing and it arrived much faster than expected. Will definitely buy again.',
    verified: true,
    helpful: 15,
    images: []
  }
]);

// Watch for product changes to update selected image
const updateSelectedImage = () => {
  if (props.product && productImages.value.length > 0) {
    selectedImage.value = productImages.value[0];
  }
};

// Methods
const closeModal = () => {
  emit('close');
  quantity.value = 1;
};

const addToCart = () => {
  if (props.product) {
    emit('add-to-cart', props.product, quantity.value);
  }
};

const buyNow = () => {
  if (props.product) {
    emit('add-to-cart', props.product, quantity.value);
    // In real app, this would navigate directly to checkout
    closeModal();
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

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
