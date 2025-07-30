<template>
  <div>
    <!-- Header Section -->
    <div class="flex flex-wrap items-center mb-6 justify-end">
      <div class="flex items-center space-x-4">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            :class="['px-3 py-1 rounded text-sm transition-colors', viewMode === 'icon' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
            @click="viewMode = 'icon'"
          >
            <div class="flex items-center justify-center w-4 h-4">
              <UIcon name="i-lucide-grid-3x3" size="16" />
            </div>
          </button>
          <button
            :class="['px-3 py-1 rounded text-sm transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
            @click="viewMode = 'list'"
          >
            <div class="flex items-center justify-center w-4 h-4">
              <UIcon name="i-lucide-menu" size="16" />
            </div>
          </button>
        </div>

        <!-- Orders Button -->
        <div ref="ordersDropdownRef" class="relative">
          <Button
            variant="secondary-gray"
            text="Orders"
            size="sm"
            @clicked="showOrders = !showOrders"
          >
            <template #icon>
              <div class="flex items-center justify-center w-4 h-4 mr-1">
                <UIcon name="i-lucide-file-text" size="16" />
              </div>
            </template>
          </Button>

          <!-- Orders Dropdown -->
          <div v-if="showOrders" class="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">My Orders</h3>

              <!-- Order Tabs -->
              <div class="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  :class="['flex-1 px-3 py-2 rounded text-sm font-medium transition-colors', orderTab === 'current' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
                  @click="orderTab = 'current'"
                >
                  Current ({{ currentOrders.length }})
                </button>
                <button
                  :class="['flex-1 px-3 py-2 rounded text-sm font-medium transition-colors', orderTab === 'past' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
                  @click="orderTab = 'past'"
                >
                  Past ({{ pastOrders.length }})
                </button>
              </div>

              <!-- Current Orders -->
              <div v-if="orderTab === 'current'" class="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                <div v-if="currentOrders.length === 0" class="text-center py-8">
                  <div class="flex items-center justify-center w-12 h-12 mx-auto text-gray-300 mb-3">
                    <UIcon name="i-lucide-file-text" size="48" />
                  </div>
                  <p class="text-gray-500 text-sm">No current orders</p>
                </div>

                <div v-for="order in currentOrders" :key="order.id" class="border rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900">Order #{{ order.id }}</span>
                    <span :class="['text-xs px-2 py-1 rounded-full', getOrderStatusClass(order.status)]">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 mb-2">
                    <img :src="order.items[0].image" :alt="order.items[0].name" class="w-8 h-8 object-cover rounded">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ order.items[0].name }}</p>
                      <p class="text-xs text-gray-600">{{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}</p>
                    </div>
                    <span class="text-sm font-medium text-primary">{{ order.total }}C</span>
                  </div>
                  <div class="text-xs text-gray-500 mb-2">{{ order.date }}</div>
                  <div v-if="order.tracking" class="flex items-center space-x-2 text-xs">
                    <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div :class="['h-1.5 rounded-full', getTrackingProgress(order.status)]" :style="{ width: getTrackingWidth(order.status) }" />
                    </div>
                    <span class="text-gray-600">{{ getTrackingText(order.status) }}</span>
                  </div>
                  <button class="mt-2 text-xs text-primary hover:text-primary-700 font-medium">
                    Track Order
                  </button>
                </div>
              </div>

              <!-- Past Orders -->
              <div v-if="orderTab === 'past'" class="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                <div v-if="pastOrders.length === 0" class="text-center py-8">
                  <div class="flex items-center justify-center w-12 h-12 mx-auto text-gray-300 mb-3">
                    <UIcon name="i-lucide-file-text" size="48" />
                  </div>
                  <p class="text-gray-500 text-sm">No past orders</p>
                </div>

                <div v-for="order in pastOrders" :key="order.id" class="border rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900">Order #{{ order.id }}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 mb-2">
                    <img :src="order.items[0].image" :alt="order.items[0].name" class="w-8 h-8 object-cover rounded">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ order.items[0].name }}</p>
                      <p class="text-xs text-gray-600">{{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}</p>
                    </div>
                    <span class="text-sm font-medium text-primary">{{ order.total }}C</span>
                  </div>
                  <div class="text-xs text-gray-500 mb-2">{{ order.date }}</div>
                  <div class="flex space-x-2">
                    <button class="text-xs text-primary hover:text-primary-700 font-medium">
                      View Receipt
                    </button>
                    <button class="text-xs text-primary hover:text-primary-700 font-medium">
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Icon -->
        <div ref="cartDropdownRef" class="relative">
          <Button
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            icon="i-lucide-shopping-cart"
            @click="showCart = !showCart"
          >
            Cart ({{ cart.length }})
            <span v-if="cartTotal > 0" class="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              {{ cartTotal }}C
            </span>
          </Button>

          <!-- Cart Dropdown -->
          <div v-if="showCart" class="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Shopping Cart</h3>

              <div v-if="cart.length === 0" class="text-center py-8">
                <div class="flex items-center justify-center w-12 h-12 mx-auto text-gray-300 mb-3">
                  <UIcon name="i-lucide-shopping-cart" size="48" />
                </div>
                <p class="text-gray-500 text-sm">Your cart is empty</p>
              </div>

              <div v-else class="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                <div v-for="item in cart" :key="item.id" class="flex items-center space-x-3 p-2 border rounded-lg">
                  <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                    <p class="text-xs text-gray-600">{{ item.price }}C × {{ item.quantity }}</p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Button icon="i-lucide-minus" class="p-1 text-gray-400 hover:text-gray-600" @click="updateCartQuantity(item, -1)" />
                    <span class="text-sm font-medium">{{ item.quantity }}</span>
                    <Button icon="i-lucide-plus" class="p-1 text-gray-400 hover:text-gray-600" @click="updateCartQuantity(item, 1)" />
                    <Button
                      icon="i-lucide-trash-2"
                      class="p-1 text-red-400 hover:text-red-600"
                      @click="removeFromCart(item)"
                    />
                  </div>
                </div>
              </div>

              <div v-if="cart.length > 0" class="mt-4 pt-3 border-t">
                <div class="flex justify-between items-center mb-3">
                  <span class="font-semibold text-gray-900">Total:</span>
                  <span class="font-bold text-primary text-lg">{{ cartTotal }}C</span>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="primary"
                    text="Checkout"
                    extra-classes="flex-1"
                    @clicked="goToCheckout"
                  />
                  <Button
                    variant="secondary-gray"
                    text="Clear"
                    @clicked="clearCart"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wishlist Toggle -->
        <Button
          :class="['px-3 py-2 rounded-lg text-sm font-medium transition-colors', showWishlist ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700']"
          variant="secondary-gray"
          icon="i-lucide-heart"
          @click="showWishlist = !showWishlist"
        >
          {{ showWishlist ? 'Shop' : 'Wishlist' }} ({{ wishlist.length }})
        </Button>
      </div>
    </div>

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
            <option value="0-10">0-10 Credits</option>
            <option value="11-30">11-30 Credits</option>
            <option value="31-50">31-50 Credits</option>
            <option value="51+">51+ Credits</option>
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
          <p class="text-primary font-medium mb-3">{{ item.price }} Credits</p>
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

    <!-- Products Grid (Icon View) -->
    <div
      v-else-if="viewMode === 'icon' && !showWishlist"
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

        <div class="space-y-2">
          <h3 class="font-semibold text-gray-900 line-clamp-2">{{ item.name }}</h3>
          <p class="text-sm text-gray-600">{{ item.description }}</p>

          <!-- Rating -->
          <div class="flex items-center space-x-1">
            <div class="flex text-yellow-400">
              <UIcon
                v-for="i in 5"
                :key="i"
                name="i-lucide-star"
                :class="['w-4 h-4', i <= item.rating ? 'fill-current text-yellow-400' : 'text-gray-200']"
                size="16"
              />
            </div>
            <span class="text-sm text-gray-600">({{ item.reviewCount }})</span>
          </div>

          <!-- Price -->
          <div class="flex items-center space-x-2">
            <span class="text-lg font-bold text-primary">{{ item.price }}C</span>
            <span v-if="item.originalPrice" class="text-sm text-gray-500 line-through">{{ item.originalPrice }}C</span>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 pt-2">
            <Button
              variant="primary"
              text="Add to Cart"
              size="sm"
              extra-classes="w-full"
              @clicked="addToCart(item)"
            />
          </div>
        </div>

        <!-- Messages -->
        <p v-if="purchaseMessage === item.id" class="text-green-600 text-sm mt-2">Added to Cart!</p>
        <p v-if="insufficientFundsMessage === item.id" class="text-red-600 text-sm mt-2">Insufficient Funds!</p>
      </div>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list' && !showWishlist && !isLoadingProducts && !productsError" class="space-y-4">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 cursor-pointer"
        @click="openProductModal(item)"
      >
        <div class="flex items-center space-x-6">
          <div class="relative flex-shrink-0">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-24 h-24 object-cover rounded-lg"
            >
            <button
              class="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              @click.stop="toggleWishlist(item)"
            >
              <div class="flex items-center justify-center w-4 h-4">
                <UIcon
                  name="i-lucide-heart"
                  :class="['w-4 h-4', isInWishlist(item.id) ? 'text-red-500 fill-current' : 'text-gray-400']"
                  size="16"
                />
              </div>
            </button>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                <p class="text-gray-600 text-sm mb-2">{{ item.description }}</p>

                <!-- Rating and Category -->
                <div class="flex items-center space-x-4 mb-3">
                  <div class="flex items-center space-x-1">
                    <div class="flex text-yellow-400">
                      <UIcon
                        v-for="i in 5"
                        :key="i"
                        name="i-lucide-star"
                        :class="['w-4 h-4', i <= item.rating ? 'fill-current text-yellow-400' : 'text-gray-200']"
                        size="16"
                      />
                    </div>
                    <span class="text-sm text-gray-600">({{ item.reviewCount }})</span>
                  </div>
                  <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {{ item.category }}
                  </span>
                </div>

                <!-- Price -->
                <div class="flex items-center space-x-2">
                  <span class="text-xl font-bold text-primary">{{ item.price }}C</span>
                  <span v-if="item.originalPrice" class="text-lg text-gray-500 line-through">{{ item.originalPrice }}C</span>
                  <span v-if="item.originalPrice" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    -{{ Math.round((1 - item.price / item.originalPrice) * 100) }}%
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col space-y-2 ml-4">
                <Button
                  variant="primary"
                  text="Add to Cart"
                  @clicked="addToCart(item)"
                />
              </div>
            </div>

            <!-- Messages -->
            <div class="mt-3">
              <p v-if="purchaseMessage === item.id" class="text-green-600 text-sm">Added to Cart!</p>
              <p v-if="insufficientFundsMessage === item.id" class="text-red-600 text-sm">Insufficient Funds!</p>
            </div>
          </div>
        </div>
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

    <!-- Product Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../../common/Button.vue';
import placeholder1 from '../../../../assets/a.png';
import placeholder2 from '../../../../assets/b.png';
import placeholder3 from '../../../../assets/c.png';
import placeholder4 from '../../../../assets/d.png';
import placeholder5 from '../../../../assets/e.png';
import placeholder6 from '../../../../assets/f.png';
import placeholder7 from '../../../../assets/g.png';
import placeholder8 from '../../../../assets/h.png';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'credits-updated', updatedCredits: number): void;
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

// Use unified credit management for balance updates
const { handleTransaction, hasSufficientBalance } = useCredit();

// Products data from Stripe API (shop products only)
const items = ref<any[]>([]);
const isLoadingProducts = ref(true);
const productsError = ref<string | null>(null);

const loadProducts = async () => {
  try {
    isLoadingProducts.value = true;
    productsError.value = null;

    // TODO: STRIPE API CALL - Get shop products only
    // Expected API response structure:
    // {
    //   products: Array<{
    //     id: string,                    // Stripe product ID
    //     name: string,
    //     description: string,
    //     price: number,                 // In credits
    //     originalPrice?: number,        // In credits (if on sale)
    //     image: string,
    //     category: string,
    //     rating: number,
    //     reviewCount: number,
    //     isNew: boolean,
    //     metadata: {
    //       stripe_product_id: string,
    //       stripe_price_id: string,
    //       product_type: 'shop'         // Only shop products returned
    //     }
    //   }>,
    //   total: number
    // }

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

// Reactive state
const purchaseMessage = ref<string | null>(null);
const insufficientFundsMessage = ref<string | null>(null);
const viewMode = ref<'icon' | 'list'>('icon');
const searchQuery = ref('');
const selectedCategory = ref('');
const priceFilter = ref('');
const sortBy = ref('name');
const showWishlist = ref(false);
const wishlist = ref<any[]>([]);
const showCart = ref(false);
const showCheckout = ref(false);
const showProductModal = ref(false);
const selectedProduct = ref<any>(null);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const showOrders = ref(false);
const orderTab = ref('current');
const router = useRouter();

// Refs for click outside functionality
const cartDropdownRef = ref<HTMLElement>();
const ordersDropdownRef = ref<HTMLElement>();

// Mock order data
const currentOrders = ref([
  {
    id: '12345',
    items: [{ name: 'KFC Gift Card', image: placeholder2 }],
    total: 10,
    status: 'Processing',
    date: '2 days ago',
    tracking: true
  },
  {
    id: '12346',
    items: [{ name: 'Fortnite V-Bucks', image: placeholder1 }],
    total: 10,
    status: 'Shipped',
    date: '3 days ago',
    tracking: true
  }
]);

const pastOrders = ref([
  {
    id: '12340',
    items: [{ name: 'Chicha Morada Tea', image: placeholder4 }],
    total: 5,
    status: 'Delivered',
    date: '1 week ago'
  },
  {
    id: '12341',
    items: [{ name: 'Pikachu Plush Toy', image: placeholder7 }],
    total: 20,
    status: 'Delivered',
    date: '2 weeks ago'
  }
]);

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

// Cart computed properties
const cartTotal = computed(() => {
  return props.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Wishlist functions
const isInWishlist = (itemId: string) => {
  return wishlist.value.some((item) => item.id === itemId);
};

const toggleWishlist = (item: any) => {
  const index = wishlist.value.findIndex((w) => w.id === item.id);
  if (index > -1) {
    wishlist.value.splice(index, 1);
  } else {
    wishlist.value.push(item);
  }
};

// Cart functions
const updateCartQuantity = (item: any, change: number) => {
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += change;
    if (existingItem.quantity <= 0) {
      const index = updatedCart.indexOf(existingItem);
      updatedCart.splice(index, 1);
    }
  }

  emit('add-to-cart', updatedCart);
};

const removeFromCart = (item: any) => {
  const updatedCart = props.cart.filter((cartItem) => cartItem.id !== item.id);
  emit('add-to-cart', updatedCart);
};

const clearCart = () => {
  emit('add-to-cart', []);
  showCart.value = false;
};

const goToCheckout = () => {
  showCart.value = false;
  router.push('/checkout');
};

const handlePaymentSuccess = () => {
  // Clear cart after successful payment
  emit('add-to-cart', []);
  showCheckout.value = false;

  // Show success message
  alert('Payment successful! Thank you for your purchase.');
};

// Functions
const addToCart = async (item: any) => {
  try {
    // TODO: STRIPE API CALL - Purchase with customer balance
    // Expected API call structure:
    // POST /api/shop/purchase
    // Body: {
    //   item_id: string,               // Stripe product ID
    //   quantity: number,              // Default 1
    //   use_credits: boolean           // Default true
    // }
    // Response: {
    //   success: boolean,
    //   orderId: string,
    //   message: string,
    //   details: {
    //     productName: string,
    //     quantity: number,
    //     creditsUsed: number,
    //     paymentIntentId: string
    //   }
    // }

    const purchaseResponse = await $fetch('/api/shop/purchase', {
      method: 'POST',
      body: {
        item_id: item.id,
        quantity: 1,
        use_credits: true
      }
    });

    if (purchaseResponse.success) {
      // Update balance optimistically
      const creditsUsed = purchaseResponse.details?.creditsUsed || item.price * 100; // Convert to cents
      handleTransaction(creditsUsed, 'purchase', `Purchase: ${item.name}`);

      // Show success message
      purchaseMessage.value = item.id;
      setTimeout(() => {
        purchaseMessage.value = null;
      }, 3000);

      // For now, still add to cart for UI purposes
      // In a real implementation, you might redirect to orders or show purchase confirmation
      const updatedCart = [...props.cart];
      const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        updatedCart.push({ ...item, quantity: 1 });
      }

      emit('add-to-cart', updatedCart);

      console.log('Purchase successful:', purchaseResponse.details);
    } else {
      throw new Error('Purchase failed');
    }
  } catch (error: any) {
    console.error('Purchase failed:', error);

    // Check if it's an insufficient funds error
    if (error.data?.message?.includes('Insufficient')) {
      insufficientFundsMessage.value = item.id;
      setTimeout(() => {
        insufficientFundsMessage.value = null;
      }, 3000);
    } else {
      // Show generic error
      alert('Purchase failed. Please try again.');
    }
  }
};

const openProductModal = (item: any) => {
  selectedProduct.value = item;
  showProductModal.value = true;
};

const addToCartFromModal = (product: any, quantity: number) => {
  // Add the specified quantity to cart
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    updatedCart.push({ ...product, quantity });
  }

  // Show success message
  purchaseMessage.value = product.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 2000);

  emit('add-to-cart', updatedCart);
  showProductModal.value = false;
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  priceFilter.value = '';
  sortBy.value = 'name';
  currentPage.value = 1;
};

// Order helper functions
const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Shipped':
      return 'bg-primary-100 text-primary-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Pending Payment':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTrackingProgress = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'bg-yellow-400';
    case 'Shipped':
      return 'bg-primary-400';
    case 'Delivered':
      return 'bg-green-400';
    default:
      return 'bg-gray-400';
  }
};

const getTrackingWidth = (status: string) => {
  switch (status) {
    case 'Processing':
      return '25%';
    case 'Shipped':
      return '75%';
    case 'Delivered':
      return '100%';
    default:
      return '0%';
  }
};

const getTrackingText = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'Order being prepared';
    case 'Shipped':
      return 'On the way';
    case 'Delivered':
      return 'Delivered';
    default:
      return 'Order placed';
  }
};

const updateScreenSize = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 768) {
      viewMode.value = 'list';
    } else {
      viewMode.value = 'icon';
    }
  }
};

// Click outside handler
const handleClickOutside = (event: Event) => {
  if (cartDropdownRef.value && !cartDropdownRef.value.contains(event.target as Node)) {
    showCart.value = false;
  }
  if (ordersDropdownRef.value && !ordersDropdownRef.value.contains(event.target as Node)) {
    showOrders.value = false;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    document.addEventListener('click', handleClickOutside);
  }

  // Load products from Stripe API
  loadProducts();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateScreenSize);
    document.removeEventListener('click', handleClickOutside);
  }
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
