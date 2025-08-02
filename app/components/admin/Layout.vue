<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Admin Sidebar -->
    <div class="w-72 bg-white border-r border-slate-200 flex flex-col" style="background-color: #f8f9fa; min-height: 100vh;">
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
      <main class="flex-1 p-8 overflow-auto">
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

// Check admin access
const userStore = useMeStore();
const router = useRouter();
const route = useRoute();

// Initialize user store and check admin access
onMounted(async () => {
  if (!userStore.isInitialized) {
    await userStore.initialize();
  }

  // Redirect non-admin users after store is initialized
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