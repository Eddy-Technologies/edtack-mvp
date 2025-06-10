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
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            :class="['px-3 py-1 rounded text-sm transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
            @click="viewMode = 'list'"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <!-- Orders Button -->
        <div ref="ordersDropdownRef" class="relative">
          <button
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            @click="showOrders = !showOrders"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Orders
          </button>

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
                  <svg
                    class="w-12 h-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
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
                  <svg
                    class="w-12 h-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
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
          <button
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            @click="showCart = !showCart"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h8.2M7 18a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            Cart ({{ cart.length }})
            <span v-if="cartTotal > 0" class="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              {{ cartTotal }}C
            </span>
          </button>

          <!-- Cart Dropdown -->
          <div v-if="showCart" class="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Shopping Cart</h3>

              <div v-if="cart.length === 0" class="text-center py-8">
                <svg
                  class="w-12 h-12 mx-auto text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h8.2M7 18a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
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
                    <button class="p-1 text-gray-400 hover:text-gray-600" @click="updateCartQuantity(item, -1)">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span class="text-sm font-medium">{{ item.quantity }}</span>
                    <button class="p-1 text-gray-400 hover:text-gray-600" @click="updateCartQuantity(item, 1)">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                    <button class="p-1 text-red-400 hover:text-red-600" @click="removeFromCart(item)">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="cart.length > 0" class="mt-4 pt-3 border-t">
                <div class="flex justify-between items-center mb-3">
                  <span class="font-semibold text-gray-900">Total:</span>
                  <span class="font-bold text-primary text-lg">{{ cartTotal }}C</span>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="flex-1 bg-primary hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    @click="goToCheckout"
                  >
                    Checkout
                  </button>
                  <button
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                    @click="clearCart"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wishlist Toggle -->
        <button
          :class="['px-3 py-2 rounded-lg text-sm font-medium transition-colors', showWishlist ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          @click="showWishlist = !showWishlist"
        >
          <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {{ showWishlist ? 'Shop' : 'Wishlist' }} ({{ wishlist.length }})
        </button>
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
        <svg
          class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
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
          <button
            v-if="hasActiveFilters"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
            @click="clearFilters"
          >
            Clear Filters
          </button>
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
        <svg
          class="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
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
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
          <p class="text-primary font-medium mb-3">{{ item.price }} Credits</p>
          <button
            class="w-full bg-primary hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            @click="addToCart(item)"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Products Grid (Icon View) -->
    <div
      v-if="viewMode === 'icon' && !showWishlist"
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
            <svg
              :class="['w-5 h-5', isInWishlist(item.id) ? 'text-red-500' : 'text-gray-400']"
              :fill="isInWishlist(item.id) ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
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
              <svg
                v-for="i in 5"
                :key="i"
                :class="['w-4 h-4', i <= item.rating ? 'fill-current' : 'fill-gray-200']"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
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
            <button
              class="w-full bg-primary hover:bg-primary-700 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
              @click.stop="addToCart(item)"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <!-- Messages -->
        <p v-if="purchaseMessage === item.id" class="text-green-600 text-sm mt-2">Added to Cart!</p>
        <p v-if="insufficientFundsMessage === item.id" class="text-red-600 text-sm mt-2">Insufficient Funds!</p>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list' && !showWishlist" class="space-y-4">
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
              <svg
                :class="['w-4 h-4', isInWishlist(item.id) ? 'text-red-500' : 'text-gray-400']"
                :fill="isInWishlist(item.id) ? 'currentColor' : 'none'"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
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
                      <svg
                        v-for="i in 5"
                        :key="i"
                        :class="['w-4 h-4', i <= item.rating ? 'fill-current' : 'fill-gray-200']"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
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
                <button
                  class="bg-primary hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  @click.stop="addToCart(item)"
                >
                  Add to Cart
                </button>
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
    <ProductModal
      :is-open="showProductModal"
      :product="selectedProduct"
      @close="showProductModal = false"
      @add-to-cart="addToCartFromModal"
      @toggle-wishlist="toggleWishlist"
    />

    <!-- Checkout Modal -->
    <CheckoutModal
      :is-open="showCheckout"
      :cart="cart"
      @close="showCheckout = false"
      @payment-success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

import { useRouter } from 'vue-router';
import placeholder1 from '../../../../assets/a.png';
import placeholder2 from '../../../../assets/b.png';
import placeholder3 from '../../../../assets/c.png';
import placeholder4 from '../../../../assets/d.png';
import placeholder5 from '../../../../assets/e.png';
import placeholder6 from '../../../../assets/f.png';
import placeholder7 from '../../../../assets/g.png';
import placeholder8 from '../../../../assets/h.png';
import CheckoutModal from './CheckoutModal.vue';
import ProductModal from './ProductModal.vue';

const props = defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'credits-updated', updatedCredits: number): void;
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

// Enhanced product data with e-commerce features
const items = [
  {
    id: '1',
    name: 'Chicha Morada Tea',
    description: 'Premium purple corn tea with authentic Peruvian flavor',
    price: 5,
    originalPrice: 8,
    image: placeholder4,
    category: 'Food & Beverages',
    rating: 4.5,
    reviewCount: 128,
    isNew: false
  },
  {
    id: '2',
    name: 'KFC Gift Card',
    description: 'Enjoy delicious fried chicken with this $10 gift card',
    price: 10,
    image: placeholder2,
    category: 'Gift Cards',
    rating: 4.8,
    reviewCount: 256,
    isNew: true
  },
  {
    id: '3',
    name: 'Fortnite V-Bucks',
    description: '1000 V-Bucks for in-game purchases and battle pass',
    price: 10,
    image: placeholder1,
    category: 'Gaming',
    rating: 4.7,
    reviewCount: 891,
    isNew: false
  },
  {
    id: '4',
    name: 'Riot Games RP',
    description: 'Riot Points for League of Legends and Valorant skins',
    price: 30,
    originalPrice: 35,
    image: placeholder3,
    category: 'Gaming',
    rating: 4.6,
    reviewCount: 445,
    isNew: false
  },
  {
    id: '5',
    name: 'Roblox Premium',
    description: 'Monthly Roblox Premium subscription with Robux',
    price: 30,
    image: placeholder5,
    category: 'Gaming',
    rating: 4.4,
    reviewCount: 672,
    isNew: false
  },
  {
    id: '6',
    name: 'Labubu Collectible',
    description: 'Limited edition Labubu figurine - perfect for collectors',
    price: 99,
    originalPrice: 120,
    image: placeholder6,
    category: 'Collectibles',
    rating: 4.9,
    reviewCount: 89,
    isNew: true
  },
  {
    id: '7',
    name: 'Pikachu Plush Toy',
    description: 'Adorable Pokemon Pikachu soft plush toy - 12 inches',
    price: 20,
    image: placeholder7,
    category: 'Toys',
    rating: 4.8,
    reviewCount: 334,
    isNew: false
  },
  {
    id: '8',
    name: 'Steam Wallet Code',
    description: '$30 Steam wallet credit for games and DLC purchases',
    price: 30,
    image: placeholder8,
    category: 'Gaming',
    rating: 4.9,
    reviewCount: 1205,
    isNew: false
  },
];

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
  const cats = new Set(items.map((item) => item.category));
  return Array.from(cats).sort();
});

// Filtering and sorting
const filteredItems = computed(() => {
  let filtered = [...items];

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
const addToCart = (item: any) => {
  const updatedCart = [...props.cart];
  const existingItem = updatedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    updatedCart.push({ ...item, quantity: 1 });
  }

  // Show success message
  purchaseMessage.value = item.id;
  setTimeout(() => {
    purchaseMessage.value = null;
  }, 2000);

  emit('add-to-cart', updatedCart);
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
