<template>
  <Layout
    :user-name="user.userDisplayFullName"
    :user-email="user.email"
  >
    <OverviewTab v-if="currentTab === 'overview'" />
    <StudyTaskTab v-else-if="currentTab === 'study'" />
    <SubscriptionTab v-else-if="currentTab === 'subscription'" />
    <SettingsTab v-else-if="currentTab === 'settings'" />
    <ShopTab
      v-else-if="currentTab === 'shop'"
      :cart="cart"
      @add-to-cart="updateCart"
    />
    <WishlistTab
      v-else-if="currentTab === 'wishlist'"
      @add-to-cart="addSingleItemToCart"
    />
    <CartTab
      v-else-if="currentTab === 'cart'"
      :cart="cart"
      @update-cart="updateCart"
      @clear-cart="clearCart"
    />
    <TasksTab v-else-if="currentTab === 'tasks'" />
    <FamilyTab v-else-if="currentTab === 'family'" />
    <OrdersTab v-else-if="currentTab === 'orders'" />
    <CreditsTab v-else-if="currentTab === 'credits'" />
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
      <p class="text-gray-600">Select a section from the sidebar to get started.</p>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '~/components/dashboard/Layout.vue';
import { useMeStore } from '~/stores/me';

// Unified Components
import OverviewTab from '~/components/dashboard/OverviewTab.vue';
import StudyTaskTab from '~/components/dashboard/StudyTaskTab.vue';
import SubscriptionTab from '~/components/dashboard/SubscriptionTab.vue';
import ShopTab from '~/components/dashboard/ShopTab.vue';
import WishlistTab from '~/components/dashboard/WishlistTab.vue';
import CartTab from '~/components/dashboard/CartTab.vue';
import FamilyTab from '~/components/dashboard/FamilyTab.vue';
import TasksTab from '~/components/dashboard/family/FamilyTasksTab.vue';
import OrdersTab from '~/components/dashboard/OrdersTab.vue';
import CreditsTab from '~/components/dashboard/CreditsTab.vue';
import SettingsTab from '~/components/dashboard/SettingsTab.vue';

definePageMeta({
  middleware: ['auth'],
});

// Get authentication state
const user = useMeStore();

// Cart state management
const cart = ref<any[]>([]);

// Get current tab from route query or default to 'overview'
const route = useRoute();
const currentTab = computed(() => {
  return (route.query.tab as string) || 'overview';
});

// Cart management functions
let cartUpdateTimeout: NodeJS.Timeout | null = null;

const updateCart = (updatedCart: any[]) => {
  cart.value = updatedCart;

  // Debounce localStorage updates to prevent rapid successive writes
  if (cartUpdateTimeout) {
    clearTimeout(cartUpdateTimeout);
  }

  cartUpdateTimeout = setTimeout(() => {
    // Persist cart to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopping-cart', JSON.stringify(updatedCart));
      // Emit custom event to update navigation badge
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, 100); // 100ms debounce
};

const clearCart = () => {
  cart.value = [];
  // Clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shopping-cart');
    // Emit custom event to update navigation badge
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

const addSingleItemToCart = (product: any) => {
  const existingItemIndex = cart.value.findIndex((item) => item.id === product.id);

  if (existingItemIndex !== -1) {
    // If item exists, increase quantity and update timestamp
    const updatedCart = [...cart.value];
    updatedCart[existingItemIndex].quantity += 1;
    updatedCart[existingItemIndex].lastUpdated = new Date().toISOString();
    updateCart(updatedCart);
  } else {
    // If item doesn't exist, add new item with timestamps
    const newItem = {
      ...product,
      quantity: product.quantity || 1,
      addedAt: product.addedAt || new Date().toISOString(),
      lastUpdated: product.lastUpdated || new Date().toISOString()
    };
    updateCart([...cart.value, newItem]);
  }
};

// Load cart from localStorage on mount
const loadCartFromStorage = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Migrate existing cart items to include timestamps if they don't have them
        cart.value = parsedCart.map((item: any) => ({
          ...item,
          addedAt: item.addedAt || new Date().toISOString(),
          lastUpdated: item.lastUpdated || new Date().toISOString()
        }));

        // Save the migrated cart back to localStorage
        if (cart.value.some((item) => !item.addedAt || !item.lastUpdated)) {
          localStorage.setItem('shopping-cart', JSON.stringify(cart.value));
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        cart.value = [];
      }
    }
  }
};

// Update page title based on current tab and subtab
const pageTitle = computed(() => {
  const currentSubtab = route.query.subtab as string;

  const tabTitles = {
    overview: 'Overview',
    study: 'Study',
    tasks: 'Tasks',
    subscription: 'Subscription',
    settings: 'Settings',
    shop: 'Shop',
    wishlist: 'Wishlist',
    cart: 'Cart',
    family: 'Family',
    orders: 'Orders',
    credits: 'Credits',
  };

  // Handle family subtabs
  if (currentTab.value === 'family' && currentSubtab) {
    const subtabTitles = {
      'management': 'Family Management',
      'order-requests': 'Order Requests',
      'tasks': 'Family Tasks'
    };
    return subtabTitles[currentSubtab as keyof typeof subtabTitles] || 'Family';
  }

  return tabTitles[currentTab.value as keyof typeof tabTitles] || 'Dashboard';
});

// Set page title
useHead({
  title: () => `${pageTitle.value} - Dashboard`,
});

// Load cart on mount
onMounted(() => {
  loadCartFromStorage();
});
</script>
