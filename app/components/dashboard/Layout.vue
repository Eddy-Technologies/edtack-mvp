<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg">
      <!-- Logo -->
      <div class="flex items-center px-6 py-4 border-b">
        <AppIcon class="w-8 h-8 mr-3" />
        <span class="text-xl font-semibold text-gray-800">Dashboard</span>
      </div>
      <!-- Chat Button -->
      <div class="px-6 py-4 border-b">
        <button
          class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          @click="navigateToRoute({ name: 'Chat', route: '/video' })"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413L4 21l1.413-6.297A8.955 8.955 0 014 12C4 7.582 7.582 4 12 4s8 3.582 8 8z"
            />
          </svg>
          Back to Chat
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-6">
        <div v-for="item in navigationItems" :key="item.name" class="px-3">
          <!-- Main navigation item -->
          <div
            v-if="!item.children"
            :class="[
              'flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg cursor-pointer transition-colors',
              isActiveRoute(item.route)
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
            @click="navigateToRoute(item)"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
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
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </div>
              <svg
                :class="['w-4 h-4 transition-transform', openSubmenus.includes(item.name) ? 'rotate-90' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <!-- Submenu -->
            <div v-if="openSubmenus.includes(item.name)" class="ml-8 space-y-1">
              <div
                v-for="child in item.children"
                :key="child.name"
                :class="[
                  'flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors',
                  isActiveRoute(child.route)
                    ? 'bg-blue-50 text-blue-700'
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

        <!-- Logout Button -->
        <div class="px-3 mt-8 pt-4 border-t">
          <div
            class="flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
            @click="logout"
          >
            <svg
              class="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </div>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Header -->
      <header class="bg-white shadow-sm border-b px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h1 class="text-2xl font-semibold text-gray-900">{{ currentPageTitle }}</h1>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface NavigationItem {
  name: string;
  route?: string;
  icon?: string;
  children?: NavigationItem[];
}

interface Props {
  userType: 'student' | 'parent';
  userName?: string;
  userAvatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'User',
  userAvatar: '/default-avatar.png'
});
const route = useRoute();
const router = useRouter();
const openSubmenus = ref<string[]>([]);

const studentNavigation: NavigationItem[] = [
  {
    name: 'Profile',
    route: '/dashboard?tab=profile',
    icon: 'UserIcon'
  },
  {
    name: 'Notes',
    route: '/dashboard?tab=notes',
    icon: 'DocumentTextIcon'
  },
  {
    name: 'Subscription',
    route: '/dashboard?tab=subscription',
    icon: 'CreditCardIcon'
  },
  {
    name: 'Store',
    route: '/store',
    icon: 'ShoppingBagIcon'
  },
  {
    name: 'Account',
    route: '/dashboard?tab=account',
    icon: 'CogIcon'
  }
];

const parentNavigation: NavigationItem[] = [
  {
    name: 'Profile',
    route: '/dashboard?tab=profile',
    icon: 'UserIcon'
  },
  {
    name: 'Children',
    route: '/dashboard?tab=children',
    icon: 'UsersIcon'
  },
  {
    name: 'Permissions',
    route: '/dashboard?tab=permissions',
    icon: 'LockClosedIcon'
  },
  {
    name: 'Subscription',
    route: '/dashboard?tab=subscription',
    icon: 'CreditCardIcon'
  },
  {
    name: 'Store',
    route: '/store',
    icon: 'ShoppingBagIcon'
  },
  {
    name: 'Account',
    route: '/dashboard?tab=account',
    icon: 'CogIcon'
  }
];

const navigationItems = computed(() => {
  return props.userType === 'student' ? studentNavigation : parentNavigation;
});

const currentPageTitle = computed(() => {
  const currentTab = route.query.tab as string;

  // Map tab query parameter to display names
  const tabTitles: Record<string, string> = {
    profile: 'Profile',
    notes: 'Notes',
    subscription: 'Subscription',
    account: 'Account',
    children: 'Children',
    permissions: 'Permissions'
  };

  return tabTitles[currentTab] || 'Dashboard';
});

const isActiveRoute = (itemRoute?: string) => {
  if (!itemRoute) return false;

  // Handle store route separately (external route)
  if (itemRoute === '/store') {
    return route.path === '/store';
  }

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

const logout = () => {
  router.push('/login');
};

onMounted(() => {
  for (const item of navigationItems.value) {
    if (item.children) {
      const hasActiveChild = item.children.some((child) => child.route === route.path);
      if (hasActiveChild && !openSubmenus.value.includes(item.name)) {
        openSubmenus.value.push(item.name);
      }
    }
  }
});
</script>
