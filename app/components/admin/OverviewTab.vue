<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-600 mt-2">Overview of your EdTack platform</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-green-600 font-medium">+12% from last month</span>
        </div>
      </div>

      <!-- Active Characters -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Characters</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.activeCharacters }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-bot" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-gray-500">{{ stats.totalCharacters }} total</span>
        </div>
      </div>

      <!-- Pending Orders -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Orders</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.pendingOrders }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-package" class="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-orange-600 font-medium">Needs attention</span>
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">${{ stats.totalRevenue }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-green-600 font-medium">+8% from last month</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Recent Orders -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <button
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
            @click="navigateToOrders"
          >
            View all
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
        </div>

        <div v-else-if="recentOrders.length === 0" class="text-center py-8 text-gray-500">
          No recent orders
        </div>

        <div v-else class="space-y-4">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Order #{{ order.id.slice(-8) }}</p>
              <p class="text-sm text-gray-600">{{ order.user_email }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">${{ order.total_amount }}</p>
              <span :class="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

        <div class="space-y-4">
          <button
            class="w-full flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
            @click="navigateToCharacters"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <UIcon name="i-lucide-plus" class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Add New Character</p>
              <p class="text-sm text-gray-600">Create a new AI character</p>
            </div>
          </button>

          <button
            class="w-full flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            @click="navigateToProducts"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Manage Products</p>
              <p class="text-sm text-gray-600">Add or edit products</p>
            </div>
          </button>

          <button
            class="w-full flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
            @click="navigateToOrders"
          >
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <UIcon name="i-lucide-package" class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Process Orders</p>
              <p class="text-sm text-gray-600">Review pending orders</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Stats
const stats = ref({
  totalUsers: 0,
  activeCharacters: 0,
  totalCharacters: 0,
  pendingOrders: 0,
  totalRevenue: 0
});

const recentOrders = ref([]);
const loading = ref(true);

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // TODO: Implement actual API calls
    // const { data } = await $fetch('/api/admin/dashboard');
    // stats.value = data.stats;
    // recentOrders.value = data.recentOrders;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusBadgeClass = (status: string) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case 'pending':
      return `${baseClass} bg-orange-100 text-orange-700`;
    case 'completed':
      return `${baseClass} bg-green-100 text-green-700`;
    case 'cancelled':
      return `${baseClass} bg-red-100 text-red-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700`;
  }
};

// Navigation methods
const navigateToOrders = () => {
  router.push('/admin?tab=orders');
};

const navigateToCharacters = () => {
  router.push('/admin?tab=characters');
};

const navigateToProducts = () => {
  router.push('/admin?tab=products');
};

onMounted(() => {
  loadDashboardData();
});
</script>
