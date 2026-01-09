<template>
  <div>
    <!-- Search and Category Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-3">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 placeholder-gray-400"
        >
        <UIcon name="i-lucide-search" class="absolute left-3 top-3 text-gray-400" size="18" />
      </div>

      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
      >
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <!-- Sort By -->
      <select
        v-model="sortBy"
        class="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700"
      >
        <option value="name">Sort by Name</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>

    <!-- Loading State -->
    <DashboardSkeleton v-if="isLoadingProducts" variant="grid" :count="8" />

    <!-- Error State -->
    <div v-else-if="productsError" class="text-center py-12">
      <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
        <UIcon name="i-lucide-alert-circle" size="48" />
      </div>
      <p class="text-red-600 mb-4">{{ productsError }}</p>
      <Button variant="primary" text="Try Again" @clicked="loadProducts" />
    </div>

    <!-- Empty Products State -->
    <div v-else-if="!isLoadingProducts && items.length === 0" class="text-center py-16 bg-stone-50 rounded-xl">
      <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
        <UIcon name="i-lucide-package" size="64" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No products available</h3>
      <Button
        variant="primary"
        text="Refresh Products"
        class="mt-4"
        @clicked="loadProducts"
      />
    </div>

    <!-- Products Grid -->
    <div
      v-else
      class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="group bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
        @click="openProductModal(item)"
      >
        <!-- Product Image -->
        <div class="relative aspect-square bg-gray-100">
          <img
            v-if="item.image && !imageErrors[item.id]"
            :src="item.image"
            :alt="item.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            @error="imageErrors[item.id] = true"
          >
          <!-- Placeholder when no image -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center p-4"
          >
            <span class="text-gray-400 text-center text-sm font-medium line-clamp-3">{{ item.name }}</span>
          </div>
          <!-- Wishlist Heart -->
          <button
            class="absolute top-2 right-2 p-2.5 bg-white/90 rounded-full shadow-sm hover:bg-white hover:shadow-md active:bg-gray-100 transition-all"
            @click.stop="toggleWishlist(item)"
          >
            <UIcon
              name="i-lucide-heart"
              :class="[isInWishlist(item.id) ? 'text-red-500' : 'text-gray-400']"
              :style="isInWishlist(item.id) ? 'fill: currentColor' : ''"
              size="18"
            />
          </button>
          <!-- Category Badge -->
          <span class="absolute bottom-2 left-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {{ item.category }}
          </span>
        </div>

        <!-- Product Info -->
        <div class="p-3">
          <h3 class="font-medium text-gray-900 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{{ item.name }}</h3>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-lg font-bold text-primary">{{ Math.round(item.price * 100) }} credits</span>
            </div>
            <button
              class="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
              @click.stop="addToCart(item)"
            >
              <UIcon name="i-lucide-plus" size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Info -->
    <div v-if="!isLoadingProducts && items.length > 0" class="mt-4 text-center text-sm text-gray-500">
      Showing {{ filteredItems.length }} of {{ items.length }} products
    </div>

    <!-- Product Modal -->
    <ProductModal
      :is-open="showProductModal"
      :product="selectedProduct"
      @close="showProductModal = false"
      @add-to-cart="addToCartFromModal"
      @toggle-wishlist="toggleWishlist"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../../common/Button.vue';
import DashboardSkeleton from '../../common/DashboardSkeleton.vue';
import ProductModal from './ProductModal.vue';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

const toast = useToast();

// Products data from database
const items = ref<any[]>([]);
const isLoadingProducts = ref(true);
const productsError = ref<string | null>(null);

const loadProducts = async () => {
  try {
    isLoadingProducts.value = true;
    productsError.value = null;
    const response = await $fetch('/api/shop/products');
    items.value = response.products || [];
  } catch (error) {
    console.error('Failed to load shop products:', error);
    productsError.value = 'Failed to load products. Please try again.';
    items.value = [];
  } finally {
    isLoadingProducts.value = false;
  }
};

const loadWishlist = async () => {
  try {
    const response = await $fetch('/api/wishlist/list');
    wishlist.value = response.items?.map((item: any) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category
    })) || [];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    wishlist.value = [];
  }
};

// Reactive state
const purchaseMessage = ref<string | null>(null);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('name');
const wishlist = ref<any[]>([]);
const showProductModal = ref(false);
const selectedProduct = ref<any>(null);
const imageErrors = ref<Record<string, boolean>>({});

// Categories
const categories = computed(() => {
  const cats = new Set(items.value.map((item) => item.category));
  return Array.from(cats).sort();
});

// Filtering and sorting
const filteredItems = computed(() => {
  let filtered = [...items.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((item) => item.category === selectedCategory.value);
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
});

// Wishlist functions
const isInWishlist = (itemId: string) => {
  return wishlist.value.some((item) => item.id === itemId);
};

const toggleWishlist = async (item: any) => {
  const isCurrentlyInWishlist = isInWishlist(item.id);

  try {
    if (isCurrentlyInWishlist) {
      await $fetch('/api/wishlist/remove', {
        method: 'POST',
        body: { product_id: item.id }
      });
      const index = wishlist.value.findIndex((w) => w.id === item.id);
      if (index > -1) {
        wishlist.value.splice(index, 1);
      }
    } else {
      await $fetch('/api/wishlist/add', {
        method: 'POST',
        body: { product_id: item.id }
      });
      wishlist.value.push(item);
    }
    // Notify sidebar to update badge
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  } catch (error) {
    console.error('Failed to update wishlist:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to update wishlist',
      color: 'red'
    });
  }
};

// Add to cart
const addToCart = (item: any) => {
  if (purchaseMessage.value === item.id) return;

  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity++;
    existingItem.lastUpdated = new Date().toISOString();
  } else {
    updatedCart.push({
      ...item,
      quantity: 1,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }

  emit('add-to-cart', updatedCart);

  toast.add({
    title: 'Added to Cart',
    description: `${item.name} added to your cart`,
    color: 'green',
    icon: 'i-lucide-check'
  });

  purchaseMessage.value = item.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 1000);
};

const openProductModal = (item: any) => {
  selectedProduct.value = item;
  showProductModal.value = true;
};

const addToCartFromModal = (product: any, quantity: number) => {
  if (purchaseMessage.value === product.id) return;

  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.lastUpdated = new Date().toISOString();
  } else {
    updatedCart.push({
      ...product,
      quantity,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }

  emit('add-to-cart', updatedCart);

  toast.add({
    title: 'Added to Cart',
    description: `${quantity}x ${product.name} added to your cart`,
    color: 'green',
    icon: 'i-lucide-check'
  });

  purchaseMessage.value = product.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 1000);

  showProductModal.value = false;
};

onMounted(() => {
  loadProducts();
  loadWishlist();
});
</script>
