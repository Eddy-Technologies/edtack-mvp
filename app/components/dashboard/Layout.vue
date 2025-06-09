<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg">
      <!-- Logo -->
      <div class="flex items-center px-6 py-4 border-b">
        <AppIcon class="w-8 h-8 mr-3" />
        <span class="text-xl font-semibold text-gray-800">Dashboard</span>
      </div>

      <!-- User Account Section -->
      <div class="px-6 py-4 border-b bg-gray-50">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <img class="w-10 h-10 rounded-full object-cover" :src="userAvatar" :alt="userName">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ userName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ userEmail }}
            </p>
            <div class="flex items-center mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                {{ userType === 'student' ? 'Student' : 'Parent' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Button -->
      <div class="px-6 py-4 border-b">
        <button
          class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors"
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
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
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
  userEmail?: string;
  userAvatar?: string;
  studentPaysForSubscription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'User',
  userEmail: 'user@example.com',
  userAvatar: '/default-avatar.png',
  studentPaysForSubscription: false
});
const route = useRoute();
const router = useRouter();
const openSubmenus = ref<string[]>([]);

const studentNavigation = computed((): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      name: 'Overview',
      route: '/dashboard?tab=overview',
      icon: 'UserIcon'
    },
    {
      name: 'Notes',
      route: '/dashboard?tab=notes',
      icon: 'DocumentTextIcon'
    }
  ];

  // Only add subscription if student pays for it
  if (props.studentPaysForSubscription) {
    baseItems.push({
      name: 'Subscription',
      route: '/dashboard?tab=subscription',
      icon: 'CreditCardIcon'
    });
  }

  baseItems.push(
    {
      name: 'Shop',
      route: '/dashboard?tab=shop',
      icon: 'ShoppingBagIcon'
    },
    {
      name: 'Permissions',
      route: '/dashboard?tab=permissions',
      icon: 'LockClosedIcon'
    },
    {
      name: 'Account',
      route: '/dashboard?tab=account',
      icon: 'CogIcon'
    },
    {
      name: 'Security',
      route: '/dashboard?tab=security',
      icon: 'ShieldCheckIcon'
    }
  );

  return baseItems;
});

const parentNavigation: NavigationItem[] = [
  {
    name: 'Overview',
    route: '/dashboard?tab=overview',
    icon: 'UserIcon'
  },
  {
    name: 'Children',
    route: '/dashboard?tab=children',
    icon: 'UsersIcon'
  },
  {
    name: 'Shop',
    route: '/dashboard?tab=shop',
    icon: 'ShoppingBagIcon'
  },
  {
    name: 'Subscription',
    route: '/dashboard?tab=subscription',
    icon: 'CreditCardIcon'
  },
  {
    name: 'Permissions',
    route: '/dashboard?tab=permissions',
    icon: 'LockClosedIcon'
  },
  {
    name: 'Account',
    route: '/dashboard?tab=account',
    icon: 'CogIcon'
  },
  {
    name: 'Security',
    route: '/dashboard?tab=security',
    icon: 'ShieldCheckIcon'
  }
];

const navigationItems = computed(() => {
  return props.userType === 'student' ? studentNavigation.value : parentNavigation;
});

const currentPageTitle = computed(() => {
  const currentTab = route.query.tab as string;

  // Map tab query parameter to display names
  const tabTitles: Record<string, string> = {
    overview: 'Overview',
    profile: 'Profile', // Keep for backward compatibility
    notes: 'Notes',
    subscription: 'Subscription',
    account: 'Account',
    security: 'Security',
    children: 'Children',
    permissions: 'Permissions',
    shop: 'Shop'
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
