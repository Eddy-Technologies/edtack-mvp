<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg">
      <!-- Logo -->
      <div class="flex items-center px-6 py-4 border-b">
        <NuxtLink to="/">
          <AppIcon class="w-8 h-8 mr-3" />
        </NuxtLink>
        <span class="text-xl font-semibold text-gray-800">Dashboard</span>
      </div>

      <!-- User Account Section -->
      <div class="px-6 py-4 border-b bg-gray-50">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <UserAvatar />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ userName }}
              </p>
            </div>
            <p class="text-xs text-gray-500 truncate">
              {{ userEmail }}
            </p>
            <UBadge
              :label="accountType"
              :color="accountType === 'parent' ? 'blue' : 'green'"
              size="xs"
              variant="solid"
            />
          </div>
        </div>
      </div>

      <!-- Chat Button -->
      <div class="px-6 py-4 border-b">
        <Button
          class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors"
          icon="i-lucide-message-circle"
          @click="navigateToRoute({ name: 'Chat', route: '/chat' })"
        >
          Back to Chat
        </Button>
      </div>

      <!-- Available Credits Section -->
      <div class="px-6 py-4 border-b">
        <div class="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
          <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
            <UIcon name="i-lucide-coins" class="text-blue-600" size="18" />
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-600 font-medium">Available Credits</p>
            <p class="text-sm font-bold text-blue-700">{{ formattedBalance }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="mt-6">
        <div v-for="item in navigationItems" :key="item.name" class="px-3">
          <!-- Main navigation item -->
          <div
            v-if="!item.children"
            :class="[
              'flex items-center justify-between px-3 py-2 mb-1 text-sm font-medium rounded-lg cursor-pointer transition-colors',
              isActiveRoute(item.route)
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
            @click="navigateToRoute(item)"
          >
            <div class="flex items-center">
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </div>
            <!-- Cart Badge -->
            <span
              v-if="item.name === 'Cart' && cartItemCount > 0"
              class="bg-primary text-white text-xs px-2 py-1 rounded-full min-w-[1.25rem] text-center"
            >
              {{ cartItemCount }}
            </span>
          </div>

          <!-- Navigation item with children -->
          <div v-else>
            <div
              :class="[
                'flex items-center justify-between px-3 py-2 mb-1 text-sm font-medium rounded-lg cursor-pointer transition-colors',
                'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
              @click="toggleSubmenu(item.name)"
            >
              <div class="flex items-center">
                <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </div>
              <div :class="['transition-transform', openSubmenus.includes(item.name) ? 'rotate-90' : '']">
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
              </div>
            </div>

            <!-- Submenu -->
            <div v-if="openSubmenus.includes(item.name)" class="ml-8 space-y-1">
              <div
                v-for="child in item.children"
                :key="child.name"
                :class="[
                  'flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors',
                  isActiveRoute(child.route)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                ]"
                @click="navigateToRoute(child)"
              >
                <div class="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                {{ child.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Horizontal Divider -->
        <div class="px-3 mt-6">
          <hr class="border-gray-200">
        </div>

        <!-- Settings and Logout Section -->
        <div class="px-3 mt-4 pt-2">
          <!-- Settings Items -->
          <div v-for="item in settingsItems" :key="item.name">
            <div
              :class="[
                'flex items-center justify-between px-3 py-2 mb-1 text-sm font-medium rounded-lg cursor-pointer transition-colors',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
              @click="navigateToRoute(item)"
            >
              <div class="flex items-center">
                <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- Logout Button -->
          <div
            :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors',
              isLoggingOut ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
            ]"
            @click="logout"
          >
            <!-- Loading Spinner -->
            <div
              v-if="isLoggingOut"
              class="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            <!-- Logout Icon -->
            <div v-else class="flex items-center justify-center w-5 h-5 mr-3">
              <UIcon name="i-lucide-log-out" class="w-5 h-5" />
            </div>
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </div>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '../common/Button.vue';
import UserAvatar from '~/components/common/UserAvatar.vue';
import { useAuth } from '~/composables/useAuth';
import { useMeStore } from '~/stores/me';

interface NavigationItem {
  name: string;
  route?: string;
  icon?: string;
  children?: NavigationItem[];
}

interface Props {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const props = defineProps<Props>();

const route = useRoute();
const router = useRouter();
const openSubmenus = ref<string[]>([]);

// Get cart count from localStorage
const cartItemCount = ref(0);

const updateCartCount = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        cartItemCount.value = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      } catch (error) {
        cartItemCount.value = 0;
      }
    } else {
      cartItemCount.value = 0;
    }
  }
};

// Get authentication state
const { signOut } = useAuth();
const isLoggingOut = ref(false);

// Get credit balance for sidebar display
const { formattedBalance, fetchCredits } = useCredit();

// Get user account type
const userStore = useMeStore();
const accountType = computed(() => {
  const role = userStore.user_role?.toLowerCase();
  return role === 'parent' ? 'parent' : role === 'student' ? 'student' : 'user';
});

const navigationItems: NavigationItem[] = [
  {
    name: 'Overview',
    route: '/dashboard?tab=overview',
    icon: 'i-lucide-user'
  },
  {
    name: 'Family',
    route: '/dashboard?tab=family',
    icon: 'i-lucide-users'
  },
  {
    name: 'Subscription',
    route: '/dashboard?tab=subscription',
    icon: 'i-lucide-credit-card'
  },
  {
    name: 'Credits',
    route: '/dashboard?tab=credits',
    icon: 'i-lucide-coins'
  },
  {
    name: 'Shop',
    route: '/dashboard?tab=shop',
    icon: 'i-lucide-shopping-bag'
  },
  {
    name: 'Wishlist',
    route: '/dashboard?tab=wishlist',
    icon: 'i-lucide-heart'
  },
  {
    name: 'Cart',
    route: '/dashboard?tab=cart',
    icon: 'i-lucide-shopping-cart'
  },
  {
    name: 'Tasks',
    route: '/dashboard?tab=tasks',
    icon: 'i-lucide-clipboard-list'
  },
  {
    name: 'Orders',
    route: '/dashboard?tab=orders',
    icon: 'i-lucide-package'
  }
];

const settingsItems: NavigationItem[] = [
  {
    name: 'Settings',
    route: '/dashboard?tab=settings',
    icon: 'i-lucide-settings'
  }
];

const isActiveRoute = (itemRoute?: string) => {
  if (!itemRoute) return false;

  // Handle dashboard query-based routes
  if (itemRoute.startsWith('/dashboard?tab=')) {
    const tabParam = itemRoute.split('tab=')[1];
    return route.query.tab === tabParam;
  }

  return false;
};

const navigateToRoute = (item: NavigationItem) => {
  if (item.route) {
    router.push(item.route);
  }
};

const toggleSubmenu = (itemName: string) => {
  const index = openSubmenus.value.indexOf(itemName);
  if (index > -1) {
    openSubmenus.value.splice(index, 1);
  } else {
    openSubmenus.value.push(itemName);
  }
};

const logout = async () => {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;
  try {
    await signOut();
    // Navigate to login page after successful logout
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // TODO: Show error message to user
  } finally {
    isLoggingOut.value = false;
  }
};

onMounted(() => {
  for (const item of navigationItems) {
    if (item.children) {
      const hasActiveChild = item.children.some((child) => child.route === route.path);
      if (hasActiveChild && !openSubmenus.value.includes(item.name)) {
        openSubmenus.value.push(item.name);
      }
    }
  }

  // Initialize cart count and listen for changes
  updateCartCount();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', updateCartCount);
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);
  }

  // Load credit balance for sidebar
  fetchCredits();
});

// Add cleanup for event listeners
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', updateCartCount);
    window.removeEventListener('cartUpdated', updateCartCount);
  }
});
</script>
