<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Modern Sidebar -->
    <div class="w-72 bg-white border-r border-slate-200 flex flex-col">
      <!-- Header -->
      <div class="px-6 py-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">StudyWithEddy</h1>
              <p class="text-xs text-slate-500">Dashboard</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-6 space-y-2">
        <div class="space-y-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Main</p>

          <div v-for="item in navigationItems" :key="item.name">
            <!-- Simple navigation item -->
            <div
              v-if="!item.children"
              :class="[
                'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
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
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ]"
                @click="toggleSubmenu(item.name)"
              >
                <div class="flex items-center space-x-3">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <span>{{ item.name }}</span>
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
                  <div class="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-4">
                    <div
                      v-for="child in item.children"
                      :key="child.name"
                      :class="[
                        'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200',
                        isActiveRoute(child.route)
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      ]"
                      @click="navigateToRoute(child)"
                    >
                      <div class="flex items-center space-x-3">
                        <div class="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <span>{{ child.name }}</span>
                      </div>
                      <!-- Badge for cart in submenu -->
                      <span
                        v-if="child.name === 'Cart' && cartItemCount > 0"
                        class="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full font-medium"
                      >
                        {{ cartItemCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="pt-6 mt-6 border-t border-slate-200">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Account</p>

          <!-- Settings Items -->
          <div v-for="item in settingsItems" :key="item.name">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
              isLoggingOut ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
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
        <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
          <UserAvatar />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ userName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
            <span class="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full" :class="accountTypeBadgeClass">
              {{ accountTypeLabel }}
            </span>
          </div>
        </div>

        <!-- Back to Chat Button -->
        <Button
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
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
      <main class="flex-1 p-8 overflow-auto">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
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

defineProps<Props>();

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
  return 'bg-slate-100 text-slate-700';
});

// Check if a parent item has any active children
const hasActiveChild = (item: NavigationItem) => {
  if (!item.children) return false;
  return item.children.some((child) => isActiveRoute(child.route));
};

const navigationItems: NavigationItem[] = [
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

onMounted(() => {
  // Auto-expand sections with active children
  for (const item of navigationItems) {
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
