<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Mobile Header with Hamburger -->
    <div
      v-if="isMobile"
      class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:hidden"
    >
      <button
        class="p-2.5 -ml-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors"
        aria-label="Open menu"
        @click="isDrawerOpen = true"
      >
        <UIcon name="i-lucide-menu" class="w-6 h-6 text-slate-700" />
      </button>
      <div class="flex items-center space-x-2">
        <div class="w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xs">A</span>
        </div>
        <span class="text-base font-semibold text-slate-900">Admin</span>
      </div>
      <div class="w-10" />
    </div>

    <!-- Mobile Drawer -->
    <MobileDrawer :visible="isDrawerOpen && isMobile" @close="isDrawerOpen = false">
      <div class="flex flex-col h-full bg-white">
        <!-- Drawer Header -->
        <div class="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center space-x-2" @click="isDrawerOpen = false">
            <div class="w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xs">A</span>
            </div>
            <span class="text-base font-semibold text-slate-900">EdTack Admin</span>
          </NuxtLink>
          <button class="p-2 rounded-xl hover:bg-slate-100" @click="isDrawerOpen = false">
            <UIcon name="i-lucide-x" class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- Drawer Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Dashboard</p>
          <div
            v-for="item in navigationItems"
            :key="item.name"
            :class="[
              'flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
              isActiveRoute(item.route) ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="handleMobileNavigate(item)"
          >
            <div class="flex items-center space-x-3">
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span>{{ item.name }}</span>
            </div>
            <span v-if="item.name === 'Orders' && pendingOrdersCount > 0" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {{ pendingOrdersCount }}
            </span>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-200">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Management</p>
            <div
              v-for="item in managementItems"
              :key="item.name"
              :class="[
                'flex items-center px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all',
                isActiveRoute(item.route) ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-100'
              ]"
              @click="handleMobileNavigate(item)"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </div>
          </div>
        </nav>

        <!-- Drawer Footer -->
        <div class="px-4 py-4 border-t border-slate-200 space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
            <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
              {{ userInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ userName }}</p>
              <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <NuxtLink
            to="/"
            class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl"
            @click="isDrawerOpen = false"
          >
            <UIcon name="i-lucide-message-circle" class="w-4 h-4 mr-2" />
            Back to Chat
          </NuxtLink>
          <button
            :class="['w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-xl', isLoggingOut ? 'text-slate-400' : 'text-red-600 hover:bg-red-50']"
            @click="logout"
          >
            <UIcon v-if="!isLoggingOut" name="i-lucide-log-out" class="w-5 h-5 mr-2" />
            {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
      </div>
    </MobileDrawer>

    <!-- Desktop Sidebar (hidden on mobile) -->
    <div class="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col" style="background-color: #f8f9fa; min-height: 100vh;">
      <!-- Header -->
      <div class="px-6 py-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">EdTack Admin</h1>
              <p class="text-xs text-slate-500">Management Panel</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-6 space-y-2">
        <div class="space-y-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Dashboard</p>

          <div v-for="item in navigationItems" :key="item.name">
            <div
              :class="[
                'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
              @click="navigateToRoute(item)"
            >
              <div class="flex items-center space-x-3">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <span>{{ item.name }}</span>
              </div>
              <!-- Badge for orders pending -->
              <span
                v-if="item.name === 'Orders' && pendingOrdersCount > 0"
                class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {{ pendingOrdersCount }}
              </span>
            </div>
          </div>
        </div>

        <!-- Management Section -->
        <div class="pt-6 mt-6 border-t border-slate-200">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Management</p>

          <div v-for="item in managementItems" :key="item.name">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                isActiveRoute(item.route)
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
              @click="navigateToRoute(item)"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </div>
          </div>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-6 pb-6 space-y-4">
        <!-- User Profile -->
        <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
          <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">{{ userName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
            <span class="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
              Administrator
            </span>
          </div>
        </div>

        <!-- Back to Chat Button -->
        <NuxtLink
          to="/"
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <UIcon name="i-lucide-message-circle" class="w-4 h-4 mr-2" />
          Back to Chat
        </NuxtLink>

        <!-- Logout Button -->
        <button
          :class="[
            'w-full group flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
            isLoggingOut ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
          ]"
          @click="logout"
        >
          <div v-if="isLoggingOut" class="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <UIcon v-else name="i-lucide-log-out" class="w-5 h-5 mr-3" />
          {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Page Content -->
      <main :class="['flex-1 overflow-auto', isMobile ? 'pt-20 p-4' : 'p-8']">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useMeStore } from '~/stores/me';
import MobileDrawer from '~/components/common/MobileDrawer.vue';
import { useResponsive } from '~/composables/useResponsive';

// Check admin access
const userStore = useMeStore();
const supabaseUser = useSupabaseUser();
const router = useRouter();
const route = useRoute();

// Check admin access after profile loads
onMounted(async () => {
  // Wait for profile to load if user is authenticated
  if (supabaseUser.value && !userStore.user_role) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        () => userStore.user_role,
        (role) => {
          if (role) {
            unwatch();
            resolve();
          }
        },
        { immediate: true }
      );
    });
  }

  // Redirect non-admin users after store is loaded
  if (userStore.user_role !== 'ADMIN') {
    console.log('Non-admin user detected, redirecting to dashboard');
    router.push('/dashboard');
  }
});

interface NavigationItem {
  name: string;
  route: string;
  icon: string;
}

// Mobile responsive state
const { isMobile } = useResponsive();
const isDrawerOpen = ref(false);

const handleMobileNavigate = (item: NavigationItem) => {
  router.push(item.route);
  isDrawerOpen.value = false;
};

const pendingOrdersCount = ref(0); // TODO: Get this from API

// Get authentication state
const { signOut } = useAuth();
const isLoggingOut = ref(false);

const navigationItems: NavigationItem[] = [
  {
    name: 'Overview',
    route: '/admin?tab=overview',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    name: 'Orders',
    route: '/admin?tab=orders',
    icon: 'i-lucide-package'
  },
  {
    name: 'Token Usage',
    route: '/admin?tab=tokens',
    icon: 'i-lucide-activity'
  }
];

const managementItems: NavigationItem[] = [
  {
    name: 'Products',
    route: '/admin?tab=products',
    icon: 'i-lucide-shopping-bag'
  },
  {
    name: 'Characters',
    route: '/admin?tab=characters',
    icon: 'i-lucide-users'
  },
  {
    name: 'Subjects',
    route: '/admin?tab=subjects',
    icon: 'i-lucide-book'
  }
];

const userName = computed(() => {
  return userStore.first_name || 'Admin';
});

const userEmail = computed(() => {
  return userStore.email || 'admin@edtack.com';
});

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase();
});

const isActiveRoute = (itemRoute: string) => {
  if (itemRoute.startsWith('/admin?tab=')) {
    const tabParam = itemRoute.split('tab=')[1];
    return route.query.tab === tabParam || (route.query.tab === undefined && tabParam === 'overview');
  }
  return route.path === itemRoute;
};

const navigateToRoute = (item: NavigationItem) => {
  if (item.route) {
    router.push(item.route);
  }
};

const logout = async () => {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;
  try {
    await signOut();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>
