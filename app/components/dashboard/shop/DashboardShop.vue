<template>
  <div>
    <div>
      <!-- Search and Filters -->
      <div class="mb-6 space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          >
          <div class="absolute left-3 top-3.5 w-5 h-5 text-gray-400">
            <UIcon name="i-lucide-search" size="20" />
          </div>
        </div>

        <!-- Filters Row -->
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex flex-wrap gap-4 items-center">
            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <!-- Price Filter -->
            <select
              v-model="priceFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">All Prices</option>
              <option value="0-10">S$0-S$10</option>
              <option value="11-30">S$11-S$30</option>
              <option value="31-50">S$31-S$50</option>
              <option value="51+">S$51+</option>
            </select>

            <!-- Sort By -->
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            <!-- Clear Filters -->
            <Button
              v-if="hasActiveFilters"
              variant="secondary-gray"
              text="Clear Filters"
              size="sm"
              @clicked="clearFilters"
            />
          </div>

          <!-- Results Info -->
          <div class="text-sm text-gray-600">
            Showing {{ filteredItems.length }} of {{ items.length }} products
            <span v-if="searchQuery"> for "{{ searchQuery }}"</span>
          </div>
        </div>
      </div>

      <!-- Wishlist View -->
      <div v-if="showWishlist" class="mb-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Your Wishlist</h3>
        <div v-if="wishlist.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
            <UIcon name="i-lucide-heart" size="64" />
          </div>
          <p class="text-gray-500">Your wishlist is empty</p>
          <p class="text-sm text-gray-400 mt-1">Add some products to your wishlist!</p>
        </div>
        <div v-else class="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="item in wishlist"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4"
          >
            <div class="relative">
              <img :src="item.image" :alt="item.name" class="w-full h-40 object-cover rounded mb-3">
              <button
                class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                @click="toggleWishlist(item)"
              >
                <div class="flex items-center justify-center w-5 h-5 text-red-500">
                  <UIcon name="i-lucide-heart" class="fill-current" size="20" />
                </div>
              </button>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
            <p class="text-primary font-medium mb-3">S${{ (item.price).toFixed(2) }}</p>
            <Button
              variant="primary"
              text="Add to Cart"
              extra-classes="w-full"
              @clicked="addToCart(item)"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingProducts" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading shop products...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="productsError" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ productsError }}</p>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" @click="loadProducts">
          Try Again
        </button>
      </div>

      <!-- Empty Products State -->
      <div v-else-if="!isLoadingProducts && items.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-package" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No products available</h3>
        <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" @click="loadProducts">
          Refresh Products
        </button>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="!showWishlist"
        class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-4 cursor-pointer"
          @click="openProductModal(item)"
        >
          <div class="relative mb-4">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-48 object-cover rounded-lg"
            >
            <!-- Wishlist Heart -->
            <button
              class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              @click.stop="toggleWishlist(item)"
            >
              <div class="flex items-center justify-center w-5 h-5">
                <UIcon
                  name="i-lucide-heart"
                  :class="['w-5 h-5', isInWishlist(item.id) ? 'text-red-500 fill-current' : 'text-gray-400']"
                  size="20"
                />
              </div>
            </button>
            <!-- Sale Badge -->
            <span v-if="item.originalPrice" class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{{ Math.round((1 - item.price / item.originalPrice) * 100) }}%
            </span>
            <!-- Category Badge -->
            <span class="absolute bottom-2 left-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {{ item.category }}
            </span>
          </div>

          <div class="space-y-3">
            <h3 class="font-semibold text-gray-900 line-clamp-1">{{ item.name }}</h3>

            <!-- Price -->
            <div class="flex items-center space-x-2">
              <span class="text-lg font-bold text-primary">S${{ (item.price).toFixed(2) }}</span>
              <span v-if="item.originalPrice" class="text-sm text-gray-500 line-through">S${{ (item.originalPrice).toFixed(2) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2" @click.stop>
              <Button
                variant="primary"
                text="Add to Cart"
                size="sm"
                extra-classes="w-full"
                @clicked="addToCart(item)"
              />
            </div>
          </div>

          <!-- Error Messages -->
          <p v-if="insufficientFundsMessage === item.id" class="text-red-600 text-sm mt-2">Insufficient Funds!</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!showWishlist && filteredItems.length > itemsPerPage" class="flex justify-center mt-8">
        <nav class="flex items-center space-x-2">
          <button
            :disabled="currentPage === 1"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition-colors', currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50']"
            @click="currentPage--"
          >
            Previous
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition-colors', page === currentPage ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50']"
            @click="currentPage = page"
          >
            {{ page }}
          </button>

          <button
            :disabled="currentPage === totalPages"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition-colors', currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50']"
            @click="currentPage++"
          >
            Next
          </button>
        </nav>
      </div>
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
import ProductModal from './ProductModal.vue';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

const toast = useToast();

// Products data from database (shop products only)
const items = ref<any[]>([]);
const isLoadingProducts = ref(true);
const productsError = ref<string | null>(null);

const loadProducts = async () => {
  try {
    isLoadingProducts.value = true;
    productsError.value = null;

    const response = await $fetch('/api/shop/products');
    items.value = response.products || [];
    console.log(`[DashboardShop] Loaded ${items.value.length} products from API`);
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
      originalPrice: item.product.originalPrice,
      image: item.product.image,
      category: item.product.category,
      rating: 0, // Set default values for missing fields
      reviewCount: 0
    })) || [];
    console.log(`[DashboardShop] Loaded ${wishlist.value.length} wishlist items`);
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    wishlist.value = [];
  }
};

// Reactive state
const purchaseMessage = ref<string | null>(null);
const insufficientFundsMessage = ref<string | null>(null);
const searchQuery = ref('');
const selectedCategory = ref('');
const priceFilter = ref('');
const sortBy = ref('name');
const showWishlist = ref(false);
const wishlist = ref<any[]>([]);
const showProductModal = ref(false);
const selectedProduct = ref<any>(null);
const currentPage = ref(1);
const itemsPerPage = ref(12);

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

  // Price filter
  if (priceFilter.value) {
    const [min, max] = priceFilter.value.split('-').map((v) => v === '+' ? Infinity : parseInt(v));
    filtered = filtered.filter((item) => {
      if (max === undefined) return item.price >= min;
      return item.price >= min && item.price <= max;
    });
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value));

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || priceFilter.value || sortBy.value !== 'name';
});

// Wishlist functions
const isInWishlist = (itemId: string) => {
  return wishlist.value.some((item) => item.id === itemId);
};

const toggleWishlist = async (item: any) => {
  const isCurrentlyInWishlist = isInWishlist(item.id);

  try {
    if (isCurrentlyInWishlist) {
      // Remove from wishlist
      await $fetch('/api/wishlist/remove', {
        method: 'POST',
        body: { product_id: item.id }
      });
      const index = wishlist.value.findIndex((w) => w.id === item.id);
      if (index > -1) {
        wishlist.value.splice(index, 1);
      }
    } else {
      // Add to wishlist
      await $fetch('/api/wishlist/add', {
        method: 'POST',
        body: { product_id: item.id }
      });
      wishlist.value.push(item);
    }
  } catch (error) {
    console.error('Failed to update wishlist:', error);
    // Show error message to user
    insufficientFundsMessage.value = item.id;
    setTimeout(() => {
      insufficientFundsMessage.value = null;
    }, 2000);
  }
};

// Functions
const addToCart = (item: any) => {
  // Prevent rapid successive clicks on the same item
  if (purchaseMessage.value === item.id) {
    return; // Don't add if we're already showing success message for this item
  }

  // Simply add item to cart (no immediate purchase)
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity++;
    // Update the timestamp when quantity is increased
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

  // Show success toast
  toast.add({
    title: 'Added to Cart!',
    description: `${item.name} has been added to your cart`,
    color: 'green',
    icon: 'i-lucide-shopping-cart'
  });

  // Set temporary flag to prevent rapid clicks
  purchaseMessage.value = item.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 1000); // Reduced from 2000ms since we're not showing inline message
};

const openProductModal = (item: any) => {
  selectedProduct.value = item;
  showProductModal.value = true;
};

const addToCartFromModal = (product: any, quantity: number) => {
  // Prevent rapid successive clicks
  if (purchaseMessage.value === product.id) {
    return;
  }

  // Add the specified quantity to cart
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
    // Update the timestamp when quantity is increased
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

  // Show success toast
  toast.add({
    title: 'Added to Cart!',
    description: `${quantity}x ${product.name} added to your cart`,
    color: 'green',
    icon: 'i-lucide-shopping-cart'
  });

  // Set temporary flag to prevent rapid clicks
  purchaseMessage.value = product.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 1000);

  showProductModal.value = false;
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  priceFilter.value = '';
  sortBy.value = 'name';
  currentPage.value = 1;
};

onMounted(() => {
  // Load products from database API
  loadProducts();

  // Load existing wishlist
  loadWishlist();

  // Load user credits
  fetchCredits();
});
</script>
