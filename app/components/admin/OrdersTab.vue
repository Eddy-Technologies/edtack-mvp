<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
        <p class="text-gray-600 mt-2">Process and fulfill customer orders</p>
      </div>
      <button
        :disabled="loading"
        class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
        @click="refreshOrders"
      >
        <UIcon :name="loading ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'" :class="loading ? 'animate-spin' : ''" class="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Orders</p>
            <p class="text-3xl font-bold text-orange-600">{{ orderStats.pending }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-clock" class="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Processing</p>
            <p class="text-3xl font-bold text-blue-600">{{ orderStats.processing }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-package" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Shipped</p>
            <p class="text-3xl font-bold text-green-600">{{ orderStats.shipped }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-truck" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">${{ totalRevenue }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @change="loadOrders"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search orders..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span class="ml-3 text-gray-600">Loading orders...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-shopping-bag" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p class="text-gray-600">Orders will appear here when customers make purchases.</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#{{ order.id.slice(-8).toUpperCase() }}</div>
                <div v-if="order.tracking_number" class="text-sm text-gray-500">{{ order.tracking_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ order.user_infos?.first_name }} {{ order.user_infos?.last_name }}
                </div>
                <div class="text-sm text-gray-500">{{ order.user_infos?.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  <div v-for="item in order.order_items" :key="item.id" class="flex items-center space-x-2 mb-1">
                    <img
                      v-if="item.products?.image_url"
                      :src="item.products.image_url"
                      :alt="item.products.name"
                      class="w-6 h-6 rounded object-cover"
                    >
                    <span>{{ item.quantity }}x {{ item.products?.name }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${{ (order.total_amount_cents / 100).toFixed(2) }}</div>
                <div class="text-sm text-gray-500">{{ order.currency }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(order.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-primary-600 hover:text-primary-900 mr-3"
                  @click="updateOrderStatus(order)"
                >
                  Update
                </button>
                <button
                  class="text-gray-600 hover:text-gray-900"
                  @click="viewOrderDetails(order)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Update Status Modal -->
    <AdminOrderStatusModal
      :is-open="isStatusModalOpen"
      :order="selectedOrder"
      @close="closeStatusModal"
      @save="handleStatusUpdate"
    />

    <!-- Order Details Modal -->
    <AdminOrderDetailsModal
      :is-open="isDetailsModalOpen"
      :order="selectedOrder"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// State
const orders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('');
const isStatusModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const selectedOrder = ref(null);

// Computed
const orderStats = computed(() => {
  const stats = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0
  };

  orders.value.forEach((order) => {
    // eslint-disable-next-line no-prototype-builtins
    if (stats.hasOwnProperty(order.status)) {
      stats[order.status]++;
    }
  });

  return stats;
});

const totalRevenue = computed(() => {
  const total = orders.value
    .filter((order) => ['delivered', 'processing', 'shipped'].includes(order.status))
    .reduce((sum, order) => sum + order.total_amount_cents, 0);
  return (total / 100).toFixed(2);
});

const filteredOrders = computed(() => {
  let filtered = orders.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((order) =>
      order.id.toLowerCase().includes(query) ||
      order.user_infos?.email?.toLowerCase().includes(query) ||
      order.user_infos?.first_name?.toLowerCase().includes(query) ||
      order.user_infos?.last_name?.toLowerCase().includes(query) ||
      order.tracking_number?.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((order) => order.status === selectedStatus.value);
  }

  return filtered;
});

// Methods
const loadOrders = async () => {
  loading.value = true;
  try {
    const query = selectedStatus.value ? `?status=${selectedStatus.value}` : '';
    const response = await $fetch(`/api/admin/orders${query}`);
    if (response.success) {
      orders.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    // TODO: Show error toast
  } finally {
    loading.value = false;
  }
};

const refreshOrders = () => {
  loadOrders();
};

const updateOrderStatus = (order) => {
  selectedOrder.value = order;
  isStatusModalOpen.value = true;
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  isDetailsModalOpen.value = true;
};

const closeStatusModal = () => {
  isStatusModalOpen.value = false;
  selectedOrder.value = null;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedOrder.value = null;
};

const handleStatusUpdate = async (statusData) => {
  try {
    await $fetch(`/api/admin/orders/${selectedOrder.value.id}/status`, {
      method: 'PUT',
      body: statusData
    });

    await loadOrders();
    closeStatusModal();
    // TODO: Show success toast
  } catch (error) {
    console.error('Failed to update order status:', error);
    // TODO: Show error toast
  }
};

const getStatusBadgeClass = (status) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case 'pending':
      return `${baseClass} bg-orange-100 text-orange-700`;
    case 'processing':
      return `${baseClass} bg-blue-100 text-blue-700`;
    case 'shipped':
      return `${baseClass} bg-green-100 text-green-700`;
    case 'delivered':
      return `${baseClass} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${baseClass} bg-red-100 text-red-700`;
    case 'refunded':
      return `${baseClass} bg-gray-100 text-gray-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700`;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Load orders on mount
onMounted(() => {
  loadOrders();
});
</script>
