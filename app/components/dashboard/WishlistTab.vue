<template>
  <div class="dashboard-wishlist">
    <div class="wishlist-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading your wishlist...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <Button
          variant="primary"
          text="Try Again"
          @clicked="loadWishlist"
        />
      </div>

      <!-- Empty Wishlist State -->
      <div v-else-if="!isLoading && wishlistItems.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-heart" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p class="text-gray-500 mb-6">Save items you love for later!</p>
        <Button
          variant="primary"
          text="Browse Shop"
          icon="i-lucide-shopping-bag"
          @clicked="goToShop"
        />
      </div>

      <!-- Wishlist Items -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Wishlist</h1>
            <p class="text-gray-600">{{ wishlistItems.length }} {{ wishlistItems.length === 1 ? 'item' : 'items' }} saved</p>
          </div>
          <Button
            variant="secondary-gray"
            text="Clear All"
            icon="i-lucide-trash-2"
            @clicked="clearAllItems"
            :disabled="wishlistItems.length === 0"
          />
        </div>

        <!-- Items Grid -->
        <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="item in wishlistItems"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-4"
          >
            <div class="relative mb-4">
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="w-full h-48 object-cover rounded-lg"
              >
              <!-- Remove Heart -->
              <button
                class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                @click="removeFromWishlist(item.product.id)"
              >
                <UIcon
                  name="i-lucide-heart"
                  class="w-5 h-5 text-red-500 fill-current"
                  size="20"
                />
              </button>
              <!-- Sale Badge -->
              <span v-if="item.product.hasDiscount" class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{{ item.product.discountPercentage }}%
              </span>
              <!-- Stock Status -->
              <span 
                v-if="!item.product.inStock" 
                class="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full"
              >
                Out of Stock
              </span>
              <!-- Category Badge -->
              <span class="absolute bottom-2 right-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {{ item.product.category }}
              </span>
            </div>

            <div class="space-y-2">
              <h3 class="font-semibold text-gray-900 line-clamp-2">{{ item.product.name }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2">{{ item.product.description }}</p>

              <!-- Price -->
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold text-primary">S${{ item.product.price.toFixed(2) }}</span>
                <span v-if="item.product.originalPrice" class="text-sm text-gray-500 line-through">
                  S${{ item.product.originalPrice.toFixed(2) }}
                </span>
              </div>

              <!-- Added Date -->
              <p class="text-xs text-gray-500">
                Added {{ formatDate(item.addedAt) }}
              </p>

              <!-- Actions -->
              <div class="flex space-x-2 pt-2">
                <Button
                  variant="primary"
                  text="Add to Cart"
                  size="sm"
                  extra-classes="flex-1"
                  :disabled="!item.product.inStock"
                  @clicked="addToCart(item.product)"
                />
                <Button
                  variant="secondary-gray"
                  icon="i-lucide-trash-2"
                  size="sm"
                  @clicked="removeFromWishlist(item.product.id)"
                />
              </div>
            </div>

            <!-- Success Message -->
            <p v-if="addedToCartMessage === item.product.id" class="text-green-600 text-sm mt-2">Added to Cart!</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > pagination.limit" class="flex justify-center mt-8">
          <nav class="flex items-center space-x-2">
            <Button
              variant="secondary-gray"
              text="Previous"
              size="sm"
              :disabled="pagination.offset === 0"
              @clicked="previousPage"
            />
            
            <span class="px-3 py-2 text-sm text-gray-700">
              {{ pagination.offset + 1 }}-{{ Math.min(pagination.offset + pagination.limit, pagination.total) }} 
              of {{ pagination.total }}
            </span>

            <Button
              variant="secondary-gray"
              text="Next"
              size="sm"
              :disabled="!pagination.hasNext"
              @clicked="nextPage"
            />
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../common/Button.vue';

const router = useRouter();

// Props for cart management
const emit = defineEmits<{
  (e: 'add-to-cart', product: any): void;
}>();

// Reactive state
const wishlistItems = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const addedToCartMessage = ref<string | null>(null);
const pagination = ref({
  total: 0,
  limit: 20,
  offset: 0,
  hasNext: false
});

// Functions
const loadWishlist = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch('/api/wishlist/list', {
      query: {
        limit: pagination.value.limit,
        offset: pagination.value.offset
      }
    });

    if (response.success) {
      wishlistItems.value = response.items || [];
      pagination.value = response.pagination;
    } else {
      throw new Error('Failed to load wishlist');
    }
  } catch (err: any) {
    console.error('Failed to load wishlist:', err);
    error.value = err.data?.message || 'Failed to load wishlist. Please try again.';
    wishlistItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const removeFromWishlist = async (productId: string) => {
  try {
    const response = await $fetch('/api/wishlist/remove', {
      method: 'POST',
      body: { product_id: productId }
    });

    if (response.success) {
      // Remove item from local state
      wishlistItems.value = wishlistItems.value.filter(
        item => item.product.id !== productId
      );
      
      // Show success message briefly
      console.log(response.message);
    } else {
      throw new Error('Failed to remove item from wishlist');
    }
  } catch (err: any) {
    console.error('Failed to remove from wishlist:', err);
    alert(err.data?.message || 'Failed to remove item from wishlist');
  }
};

const addToCart = (product: any) => {
  // Format product for cart
  const cartItem = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    quantity: 1
  };

  emit('add-to-cart', cartItem);

  // Show success message
  addedToCartMessage.value = product.id;
  setTimeout(() => {
    addedToCartMessage.value = null;
  }, 2000);
};

const clearAllItems = async () => {
  if (!confirm('Are you sure you want to remove all items from your wishlist?')) {
    return;
  }

  try {
    // Remove all items one by one
    const removePromises = wishlistItems.value.map(item => 
      $fetch('/api/wishlist/remove', {
        method: 'POST',
        body: { product_id: item.product.id }
      })
    );

    await Promise.all(removePromises);
    
    // Clear local state
    wishlistItems.value = [];
    console.log('All items removed from wishlist');
  } catch (err: any) {
    console.error('Failed to clear wishlist:', err);
    alert('Failed to clear wishlist. Please try again.');
  }
};

const goToShop = () => {
  router.push('/dashboard?tab=shop');
};

const previousPage = () => {
  if (pagination.value.offset > 0) {
    pagination.value.offset = Math.max(0, pagination.value.offset - pagination.value.limit);
    loadWishlist();
  }
};

const nextPage = () => {
  if (pagination.value.hasNext) {
    pagination.value.offset += pagination.value.limit;
    loadWishlist();
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Load wishlist on mount
onMounted(() => {
  loadWishlist();
});
</script>

<style scoped>
.dashboard-wishlist {
  height: 100%;
  overflow-y: auto;
}

.wishlist-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
  max-width: 6xl;
  margin: 0 auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>