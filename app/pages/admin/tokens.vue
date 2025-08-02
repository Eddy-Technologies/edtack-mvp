<template>
  <AdminLayout>
    <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Token Usage Dashboard</h1>
        <p class="text-gray-600 mt-2">Monitor API token consumption across users and features</p>
      </div>
      <div class="flex space-x-3">
        <button
          :disabled="loading"
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
          @click="refreshData"
        >
          <UIcon :name="loading ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'" :class="loading ? 'animate-spin' : ''" class="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <select
          v-model="timeRange"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @change="loadTokenUsage"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Tokens</p>
            <p class="text-3xl font-bold text-gray-900">{{ formatNumber(stats.totalTokens) }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-zap" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-500">{{ timeRangeLabel }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.activeUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-500">Users with token usage</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avg per User</p>
            <p class="text-3xl font-bold text-gray-900">{{ formatNumber(stats.avgTokensPerUser) }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-trending-up" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-500">Tokens per active user</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Cost Estimate</p>
            <p class="text-3xl font-bold text-gray-900">${{ stats.estimatedCost }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-500">Based on $0.002/1K tokens</span>
        </div>
      </div>
    </div>

    <!-- Charts and Data -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Usage Over Time Chart -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Token Usage Over Time</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <UIcon name="i-lucide-bar-chart-3" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Chart integration coming soon</p>
            <p class="text-sm">Will show daily/hourly token usage trends</p>
          </div>
        </div>
      </div>

      <!-- Top Features -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Features by Usage</h3>
        <div class="space-y-4">
          <div v-for="feature in topFeatures" :key="feature.name" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <UIcon :name="feature.icon" class="w-4 h-4 text-primary-600" />
              </div>
              <span class="font-medium text-gray-900">{{ feature.name }}</span>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-900">{{ formatNumber(feature.tokens) }}</div>
              <div class="text-sm text-gray-500">{{ feature.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Top Users by Token Usage</h3>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span class="ml-3 text-gray-600">Loading usage data...</span>
      </div>

      <div v-else-if="topUsers.length === 0" class="text-center py-12 text-gray-500">
        <UIcon name="i-lucide-database" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No token usage data available</p>
        <p class="text-sm">Token usage tracking will be implemented in a future update</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Tokens
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Cost
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in topUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-600">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatNumber(user.totalTokens) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(user.lastActive) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${{ user.estimatedCost }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '~/layouts/admin-simple.vue';

// State
const loading = ref(true);
const timeRange = ref('7d');

const stats = ref({
  totalTokens: 0,
  activeUsers: 0,
  avgTokensPerUser: 0,
  estimatedCost: 0
});

const topUsers = ref([]);
const topFeatures = ref([]);

// Computed
const timeRangeLabel = computed(() => {
  switch (timeRange.value) {
    case '24h': return 'Last 24 hours';
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    default: return 'Selected period';
  }
});

// Methods
const loadTokenUsage = async () => {
  loading.value = true;
  try {
    // TODO: Implement actual API call to token usage service
    // const response = await $fetch(`/api/admin/tokens/usage?range=${timeRange.value}`);
    // if (response.success) {
    //   stats.value = response.data.stats;
    //   topUsers.value = response.data.topUsers;
    //   topFeatures.value = response.data.topFeatures;
    // }
  } catch (error) {
    console.error('Failed to load token usage:', error);
    // TODO: Show error toast
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadTokenUsage();
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const getRoleBadgeClass = (role) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (role) {
    case 'ADMIN':
      return `${baseClass} bg-red-100 text-red-700`;
    case 'TEACHER':
      return `${baseClass} bg-blue-100 text-blue-700`;
    case 'PARENT':
      return `${baseClass} bg-green-100 text-green-700`;
    case 'STUDENT':
      return `${baseClass} bg-purple-100 text-purple-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700`;
  }
};

// Load data on mount
onMounted(() => {
  loadTokenUsage();
});
</script>
