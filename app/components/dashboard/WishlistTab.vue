<template>
  <div class="h-full overflow-y-auto">
    <div class="p-5 sm:p-6 max-w-6xl mx-auto min-h-full">
      <!-- Loading State -->
      <DashboardSkeleton v-if="isLoading" variant="grid" :count="8" />

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
      <div v-else-if="!isLoading && wishlistItems.length === 0" class="text-center py-16 bg-stone-50 rounded-xl">
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
            :disabled="wishlistItems.length === 0"
            @clicked="clearAllItems"
          />
        </div>

        <!-- Items Grid -->
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div
            v-for="item in wishlistItems"
            :key="item.id"
            class="group bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <!-- Product Image -->
            <div class="relative aspect-square bg-gray-100">
              <img
                v-if="item.product.image && !imageErrors[item.id]"
                :src="item.product.image"
                :alt="item.product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                @error="imageErrors[item.id] = true"
              >
              <!-- Placeholder when no image -->
              <div
                v-else
                class="w-full h-full flex items-center justify-center p-4"
              >
                <span class="text-gray-400 text-center text-sm font-medium line-clamp-3">{{ item.product.name }}</span>
              </div>
              <!-- Remove Heart -->
              <button
                class="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all"
                @click="removeFromWishlist(item.product.id)"
              >
                <UIcon
                  name="i-lucide-heart"
                  class="text-red-500"
                  style="fill: currentColor"
                  size="16"
                />
              </button>
              <!-- Sale Badge -->
              <span v-if="item.product.hasDiscount" class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                -{{ item.product.discountPercentage }}%
              </span>
              <!-- Category Badge -->
              <span class="absolute bottom-2 left-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {{ item.product.category }}
              </span>
              <!-- Stock Status -->
              <span
                v-if="!item.product.inStock"
                class="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full"
              >
                Out of Stock
              </span>
            </div>

            <!-- Product Info -->
            <div class="p-3">
              <h3 class="font-medium text-gray-900 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{{ item.product.name }}</h3>

              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-primary">S${{ item.product.price.toFixed(2) }}</span>
                <button
                  class="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!item.product.inStock"
                  @click="addToCart(item.product)"
                >
                  <UIcon name="i-lucide-plus" size="16" />
                </button>
              </div>
            </div>
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
import DashboardSkeleton from '../common/DashboardSkeleton.vue';

const router = useRouter();
const toast = useToast();

// Props for cart management
const emit = defineEmits<{
  (e: 'add-to-cart', product: any): void;
}>();

// Reactive state
const wishlistItems = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const addedToCartMessage = ref<string | null>(null);
const imageErrors = ref<Record<string, boolean>>({});
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
        (item) => item.product.id !== productId
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
  // Prevent rapid successive clicks
  if (addedToCartMessage.value === product.id) {
    return;
  }

  // Format product for cart
  const cartItem = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    quantity: 1,
    addedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  emit('add-to-cart', cartItem);

  // Show success toast
  toast.add({
    title: 'Added to Cart!',
    description: `${product.name} has been added to your cart`,
    color: 'green',
    icon: 'i-lucide-shopping-cart'
  });

  // Set temporary flag to prevent rapid clicks
  addedToCartMessage.value = product.id;
  setTimeout(() => {
    addedToCartMessage.value = null;
  }, 1000);
};

const clearAllItems = async () => {
  if (!confirm('Are you sure you want to remove all items from your wishlist?')) {
    return;
  }

  try {
    // Remove all items one by one
    const removePromises = wishlistItems.value.map((item) =>
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

// Load wishlist on mount
onMounted(() => {
  loadWishlist();
});
</script>
