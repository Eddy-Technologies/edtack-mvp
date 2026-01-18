<template>
  <div class="flex h-screen bg-stone-50">
    <!-- Mobile Header with Hamburger -->
    <div
      v-if="isMobile"
      class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden"
    >
      <button
        class="p-2.5 -ml-2 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors"
        aria-label="Open menu"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-menu" class="w-6 h-6 text-gray-700" />
      </button>
      <NuxtLink to="/" class="flex items-center space-x-2">
        <AppLogo size="sm" />
        <span class="text-base font-semibold text-gray-900">StudyWithEddy</span>
      </NuxtLink>
      <Button
        size="sm"
        variant="secondary"
        @click="router.push('/chat/eddy/new')"
      >
        Back to Chat
      </Button>
    </div>

    <!-- Mobile Drawer -->
    <MobileDrawer :visible="isDrawerOpen && isMobile" @close="isDrawerOpen = false">
      <div class="flex flex-col h-full bg-white">
        <!-- Drawer Header -->
        <div class="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center space-x-2" @click="isDrawerOpen = false">
            <AppLogo size="sm" />
            <span class="text-base font-semibold text-gray-900">StudyWithEddy</span>
          </NuxtLink>
          <button
            class="p-2 rounded-xl hover:bg-stone-100 active:bg-stone-200"
            aria-label="Close menu"
            @click="isDrawerOpen = false"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Drawer Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div v-for="item in navigationItems" :key="item.name">
            <!-- Simple navigation item -->
            <div
              v-if="!item.children"
              :class="[
                'flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-stone-100 active:bg-stone-200'
              ]"
              :data-tour="item.name === 'Study' ? 'study-tab' : item.name === 'Credits' ? 'credits-tab' : item.name === 'Tasks' ? 'tasks-tab' : undefined"
              @click="handleMobileNavigate(item)"
            >
              <div class="flex items-center space-x-3">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <span>{{ item.name }}</span>
              </div>
              <span v-if="item.name === 'Cart' && cartItemCount > 0" class="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {{ cartItemCount }}
              </span>
              <span v-if="item.name === 'Tasks' && availableTasksCount > 0" class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {{ availableTasksCount }}
              </span>
              <span v-if="item.name === 'Credits'" class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                {{ formattedBalance }}
              </span>
            </div>

            <!-- Expandable navigation item -->
            <div v-else>
              <div
                :class="[
                  'flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
                  hasActiveChild(item) ? 'bg-stone-100 text-gray-900' : 'text-gray-600 hover:bg-stone-100'
                ]"
                @click="toggleSubmenu(item.name)"
              >
                <div class="flex items-center space-x-3">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <span>{{ item.name }}</span>
                  <span v-if="item.name === 'Family' && pendingOrderRequestCount > 0" class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {{ pendingOrderRequestCount }}
                  </span>
                </div>
                <UIcon name="i-lucide-chevron-down" :class="['w-4 h-4 transition-transform', openSubmenus.includes(item.name) ? 'rotate-180' : '']" />
              </div>
              <div v-if="openSubmenus.includes(item.name)" class="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
                <div
                  v-for="child in item.children"
                  :key="child.name"
                  :class="[
                    'flex items-center justify-between px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-all',
                    isActiveRoute(child.route) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-500 hover:bg-stone-100'
                  ]"
                  @click="handleMobileNavigate(child)"
                >
                  <span>{{ child.name }}</span>
                  <span v-if="child.name === 'Cart' && cartItemCount > 0" class="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{{ cartItemCount }}</span>
                  <span v-if="child.name === 'Wishlist' && wishlistCount > 0" class="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">{{ wishlistCount }}</span>
                  <span v-if="child.name === 'Orders' && currentOrdersCount > 0" class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{{ currentOrdersCount }}</span>
                  <span v-if="child.name === 'Order Requests' && pendingOrderRequestCount > 0" class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{{ pendingOrderRequestCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="pt-4 mt-4 border-t border-gray-200">
            <div
              v-for="item in settingsItems"
              :key="item.name"
              :class="[
                'flex items-center px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
                isActiveRoute(item.route) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-stone-100'
              ]"
              @click="handleMobileNavigate(item)"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </div>
            <div
              :class="['flex items-center px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all', isLoggingOut ? 'text-gray-400' : 'text-red-600 hover:bg-red-50']"
              @click="logout"
            >
              <UIcon v-if="!isLoggingOut" name="i-lucide-log-out" class="w-5 h-5 mr-3" />
              <div v-else class="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
            </div>
          </div>
        </nav>

        <!-- Drawer Footer -->
        <div class="px-4 py-4 border-t border-gray-200 space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-stone-100 rounded-xl">
            <UserAvatar />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
            </div>
          </div>
          <Button
            class="w-full"
            icon="i-lucide-message-circle"
            @click="handleBackToChat"
          >
            Back to Chat
          </Button>
        </div>
      </div>
    </MobileDrawer>

    <!-- Desktop Sidebar (hidden on mobile) -->
    <div class="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <AppLogo size="md" />
            <div>
              <h1 class="text-lg font-semibold text-gray-900">StudyWithEddy</h1>
              <p class="text-xs text-gray-500">Dashboard</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
        <div class="space-y-1">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Main</p>

          <div v-for="item in navigationItems" :key="item.name">
            <!-- Simple navigation item -->
            <div
              v-if="!item.children"
              :class="[
                'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
              ]"
              :data-tour="item.name === 'Study' ? 'study-tab' : item.name === 'Credits' ? 'credits-tab' : item.name === 'Tasks' ? 'tasks-tab' : undefined"
              @click="navigateToRoute(item)"
            >
              <div class="flex items-center space-x-3">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <span>{{ item.name }}</span>
              </div>
              <!-- Badge for cart -->
              <span
                v-if="item.name === 'Cart' && cartItemCount > 0"
                class="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {{ cartItemCount }}
              </span>
              <!-- Badge for tasks (students only) -->
              <span
                v-if="item.name === 'Tasks' && availableTasksCount > 0"
                class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {{ availableTasksCount }}
              </span>
              <!-- Credits amount for Credits tab -->
              <span
                v-if="item.name === 'Credits'"
                class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full"
              >
                {{ formattedBalance }}
              </span>
            </div>

            <!-- Expandable navigation item -->
            <div v-else>
              <!-- Parent item -->
              <div
                :class="[
                  'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                  hasActiveChild(item) || openSubmenus.includes(item.name)
                    ? 'bg-stone-100 text-gray-900'
                    : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
                ]"
                @click="toggleSubmenu(item.name)"
              >
                <div class="flex items-center space-x-3">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <span>{{ item.name }}</span>
                  <!-- Badge for Family nav item showing pending order requests -->
                  <span
                    v-if="item.name === 'Family' && pendingOrderRequestCount > 0"
                    class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {{ pendingOrderRequestCount }}
                  </span>
                </div>
                <UIcon
                  name="i-lucide-chevron-down"
                  :class="[
                    'w-4 h-4 transition-transform duration-200',
                    openSubmenus.includes(item.name) ? 'rotate-180' : ''
                  ]"
                />
              </div>

              <!-- Submenu with smooth animation -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-96"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-96"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="openSubmenus.includes(item.name)" class="overflow-hidden">
                  <div class="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
                    <div
                      v-for="child in item.children"
                      :key="child.name"
                      :class="[
                        'flex items-center justify-between px-3 py-2 text-sm rounded-xl cursor-pointer transition-all duration-200',
                        isActiveRoute(child.route)
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-500 hover:bg-stone-100 hover:text-gray-700'
                      ]"
                      @click="navigateToRoute(child)"
                    >
                      <div class="flex items-center space-x-3">
                        <div class="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        <span>{{ child.name }}</span>
                      </div>
                      <!-- Badge for cart in submenu -->
                      <span
                        v-if="child.name === 'Cart' && cartItemCount > 0"
                        class="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {{ cartItemCount }}
                      </span>
                      <!-- Badge for order requests in submenu -->
                      <span
                        v-if="child.name === 'Order Requests' && pendingOrderRequestCount > 0"
                        class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {{ pendingOrderRequestCount }}
                      </span>
                      <!-- Badge for wishlist in submenu -->
                      <span
                        v-if="child.name === 'Wishlist' && wishlistCount > 0"
                        class="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {{ wishlistCount }}
                      </span>
                      <!-- Badge for orders in submenu -->
                      <span
                        v-if="child.name === 'Orders' && currentOrdersCount > 0"
                        class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {{ currentOrdersCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="pt-6 mt-6 border-t border-gray-200">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Account</p>

          <!-- Settings Items -->
          <div v-for="item in settingsItems" :key="item.name">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
              ]"
              @click="navigateToRoute(item)"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </div>
          </div>

          <!-- Logout Button -->
          <div
            :class="[
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
              isLoggingOut ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
            ]"
            @click="logout"
          >
            <div v-if="isLoggingOut" class="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <UIcon v-else name="i-lucide-log-out" class="w-5 h-5 mr-3" />
            {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
          </div>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-6 pb-6 space-y-4">
        <!-- User Profile -->
        <div class="flex items-center space-x-3 p-3 bg-stone-100 rounded-xl">
          <UserAvatar />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
            <span
              v-if="userStore.user_role"
              class="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full"
              :class="accountTypeBadgeClass"
            >
              {{ accountTypeLabel }}
            </span>
          </div>
        </div>

        <!-- Back to Chat Button -->
        <Button
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors"
          icon="i-lucide-message-circle"
          @click="router.push('/')"
        >
          Back to Chat
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Page Content -->
      <main ref="mainContentRef" :class="['flex-1 overflow-auto', isMobile ? 'pt-20 p-4' : 'p-8']">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '../common/Button.vue';
import UserAvatar from '~/components/common/UserAvatar.vue';
import MobileDrawer from '~/components/common/MobileDrawer.vue';
import AppLogo from '~/components/common/AppLogo.vue';
import { useAuth } from '~/composables/useAuth';
import { useMeStore } from '~/stores/me';
import { useFeatureFlags } from '~/composables/useFeatureFlags';
import { useResponsive } from '~/composables/useResponsive';
import { useTour } from '~/composables/useTour';

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

defineProps<Props>();

const route = useRoute();
const router = useRouter();
const openSubmenus = ref<string[]>([]);

// Main content ref for scroll-to-top functionality
const mainContentRef = ref<HTMLElement | null>(null);

// Watch for tab changes and scroll to top instantly
watch(
  () => route.query.tab,
  async () => {
    await nextTick();
    if (mainContentRef.value) {
      mainContentRef.value.scrollTop = 0;
    }
  }
);

// Mobile responsive state
const { isMobile } = useResponsive();
const isDrawerOpen = ref(false);

// Mobile navigation handler
const handleMobileNavigate = (item: NavigationItem) => {
  if (item.route) {
    router.push(item.route);
    isDrawerOpen.value = false;
  }
};

const handleBackToChat = () => {
  router.push('/');
  isDrawerOpen.value = false;
};

// Get cart count from localStorage
const cartItemCount = ref(0);

// Get pending order request count
const pendingOrderRequestCount = ref(0);

const updatePendingOrderCount = async () => {
  // Only fetch for parents
  if (userStore.user_role?.toLowerCase() !== 'parent') {
    pendingOrderRequestCount.value = 0;
    return;
  }

  try {
    const response = await $fetch('/api/orders/pending-approval', {
      query: {
        status: 'PENDING_PARENT_APPROVAL',
        limit: 1,
        offset: 0
      }
    });
    pendingOrderRequestCount.value = response?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to fetch pending order count:', error);
    pendingOrderRequestCount.value = 0;
  }
};

// Get current orders count
const currentOrdersCount = ref(0);

const updateCurrentOrdersCount = async () => {
  try {
    const response = await $fetch('/api/orders/current', {
      query: {
        limit: 1,
        offset: 0
      }
    });
    currentOrdersCount.value = response?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to fetch current orders count:', error);
    currentOrdersCount.value = 0;
  }
};

// Get incomplete chapters count (for students - counts incomplete chapters across all OPEN tasks)
const availableTasksCount = ref(0);

const updateAvailableTasksCount = async () => {
  // Only fetch for students
  if (userStore.user_role?.toLowerCase() !== 'student') {
    availableTasksCount.value = 0;
    return;
  }

  try {
    const response = await $fetch('/api/tasks/user-tasks', {
      query: {
        status: 'OPEN',
        limit: 100,
        offset: 0
      }
    });

    // Count total incomplete chapters across all OPEN tasks
    const tasks = response?.tasks || [];
    let incompleteChaptersCount = 0;
    for (const task of tasks) {
      if (task.chapters) {
        incompleteChaptersCount += task.chapters.filter(
          (chapter: any) => chapter.completedAt === null
        ).length;
      }
    }
    availableTasksCount.value = incompleteChaptersCount;
  } catch (error) {
    console.error('Failed to fetch available tasks count:', error);
    availableTasksCount.value = 0;
  }
};

// Get wishlist count
const wishlistCount = ref(0);

const updateWishlistCount = async () => {
  try {
    const response = await $fetch('/api/wishlist/list', {
      query: {
        limit: 1,
        offset: 0
      }
    });
    wishlistCount.value = response?.pagination?.total || 0;
  } catch (error) {
    console.error('Failed to fetch wishlist count:', error);
    wishlistCount.value = 0;
  }
};

const updateCartCount = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        cartItemCount.value = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      } catch {
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

// Get feature flags
const { subscriptionPlans } = useFeatureFlags();

// Get credit balance for sidebar display
const { formattedBalance, fetchCredits } = useCredit();

// Get user account type
const userStore = useMeStore();
const accountType = computed(() => {
  const role = userStore.user_role?.toLowerCase();
  return role === 'parent' ? 'parent' : role === 'student' ? 'student' : 'user';
});

const accountTypeLabel = computed(() => {
  return accountType.value === 'parent' ? 'Parent' : accountType.value === 'student' ? 'Student' : 'User';
});

const accountTypeBadgeClass = computed(() => {
  if (accountType.value === 'parent') {
    return 'bg-primary-100 text-primary-700';
  } else if (accountType.value === 'student') {
    return 'bg-green-100 text-green-700';
  }
  return 'bg-stone-100 text-gray-700';
});

// Check if a parent item has any active children
const hasActiveChild = (item: NavigationItem) => {
  if (!item.children) return false;
  return item.children.some((child) => isActiveRoute(child.route));
};

const allNavigationItems: NavigationItem[] = [
  {
    name: 'Overview',
    route: '/dashboard?tab=overview',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    name: 'Study',
    route: '/dashboard?tab=study',
    icon: 'i-lucide-book-open'
  },
  {
    name: 'Tasks',
    route: '/dashboard?tab=tasks',
    icon: 'i-lucide-clipboard-list'
  },
  {
    name: 'Family',
    icon: 'i-lucide-users',
    children: [
      {
        name: 'Management',
        route: '/dashboard?tab=family&subtab=management',
        icon: 'i-lucide-users'
      },
      {
        name: 'Order Requests',
        route: '/dashboard?tab=family&subtab=order-requests',
        icon: 'i-lucide-shopping-cart'
      }
    ]
  },
  {
    name: 'Shop',
    icon: 'i-lucide-shopping-bag',
    children: [
      {
        name: 'Products',
        route: '/dashboard?tab=shop',
        icon: 'i-lucide-package'
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
        name: 'Orders',
        route: '/dashboard?tab=orders',
        icon: 'i-lucide-package'
      }
    ]
  },
  {
    name: 'Credits',
    route: '/dashboard?tab=credits',
    icon: 'i-lucide-coins'
  },
  {
    name: 'Subscription',
    route: '/dashboard?tab=subscription',
    icon: 'i-lucide-credit-card'
  }
];

// Filter navigation items based on feature flags and user role
const navigationItems = computed(() => {
  return allNavigationItems.filter((item) => {
    if (item.name === 'Subscription') {
      return subscriptionPlans.value;
    }
    // Tasks tab now visible to all roles (unified interface)
    return true;
  });
});

const settingsItems: NavigationItem[] = [
  {
    name: 'Settings',
    route: '/dashboard?tab=settings',
    icon: 'i-lucide-settings'
  },
  {
    name: 'User Guides',
    route: '/about?tab=guides',
    icon: 'i-lucide-book-open'
  }
];

const isActiveRoute = (itemRoute?: string) => {
  if (!itemRoute) return false;

  // Handle dashboard query-based routes
  if (itemRoute.startsWith('/dashboard?tab=')) {
    const urlParams = new URLSearchParams(itemRoute.split('?')[1]);
    const tabParam = urlParams.get('tab');
    const subtabParam = urlParams.get('subtab');

    // Check if tab matches
    const currentTab = route.query.tab as string;
    const currentSubtab = route.query.subtab as string;

    if (tabParam && currentTab !== tabParam) {
      return false;
    }

    // Handle overview default case
    if (!currentTab && tabParam === 'overview') {
      return true;
    }

    // If route has subtab, check subtab match
    if (subtabParam) {
      return currentTab === tabParam && currentSubtab === subtabParam;
    }

    // For routes without subtab, only match if current route also has no subtab
    return currentTab === tabParam && !currentSubtab;
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

// Handler for tour drawer open event
const handleOpenDrawerForTour = () => {
  if (isMobile.value) {
    isDrawerOpen.value = true;
  }
};

onMounted(() => {
  // Auto-expand sections with active children
  for (const item of navigationItems.value) {
    if (item.children) {
      const hasActive = item.children.some((child) => isActiveRoute(child.route));
      if (hasActive && !openSubmenus.value.includes(item.name)) {
        openSubmenus.value.push(item.name);
      }
    }
  }

  // Initialize cart count and listen for changes
  updateCartCount();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('orderRequestsUpdated', updatePendingOrderCount);
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    window.addEventListener('ordersUpdated', updateCurrentOrdersCount);
    window.addEventListener('tasksUpdated', updateAvailableTasksCount);
    window.addEventListener('openDashboardDrawer', handleOpenDrawerForTour);
  }

  // Load credit balance for sidebar
  fetchCredits();

  // Load pending order request count for parents
  updatePendingOrderCount();

  // Load current orders count
  updateCurrentOrdersCount();

  // Load wishlist count
  updateWishlistCount();

  // Load available tasks count for students
  updateAvailableTasksCount();

  // Start dashboard tour for users who completed onboarding but haven't seen it
  const { startTour, isTourCompleted } = useTour();
  if (userStore.onboarding_completed && !isTourCompleted('dashboard-tour')) {
    setTimeout(() => {
      startTour('dashboard-tour', isMobile.value);
    }, 800);
  }
});

// Add cleanup for event listeners
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', updateCartCount);
    window.removeEventListener('cartUpdated', updateCartCount);
    window.removeEventListener('orderRequestsUpdated', updatePendingOrderCount);
    window.removeEventListener('wishlistUpdated', updateWishlistCount);
    window.removeEventListener('ordersUpdated', updateCurrentOrdersCount);
    window.removeEventListener('tasksUpdated', updateAvailableTasksCount);
    window.removeEventListener('openDashboardDrawer', handleOpenDrawerForTour);
  }
});
</script>
