<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>

      <!-- Order Tabs -->
      <div class="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          :class="['flex-1 px-4 py-2 rounded text-sm font-medium transition-colors', orderTab === 'current' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
          @click="orderTab = 'current'"
        >
          Current Orders ({{ isLoadingOrders ? '...' : currentOrders.length }})
        </button>
        <button
          :class="['flex-1 px-4 py-2 rounded text-sm font-medium transition-colors', orderTab === 'past' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
          @click="orderTab = 'past'"
        >
          Past Orders ({{ isLoadingOrders ? '...' : pastOrders.length }})
        </button>
      </div>
    </div>

    <!-- Current Orders -->
    <div v-if="orderTab === 'current'">
      <!-- Loading State -->
      <div v-if="isLoadingOrders" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="ordersError" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ ordersError }}</p>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" @click="loadOrders">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoadingOrders && currentOrders.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-file-text" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No current orders</h3>
        <p class="text-gray-500 mb-4">You don't have any current orders yet.</p>

        <Button
          variant="primary"
          text="Start Shopping"
          @clicked="$router.push('/dashboard?tab=shop')"
        />
      </div>

      <div v-else class="grid gap-6">
        <div v-for="order in currentOrders" :key="order.id" class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-600">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getOrderStatusClass(order.status)]">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <div class="flex items-center space-x-4 mb-4">
            <img :src="order.items[0]?.product?.imageUrl" :alt="order.items[0]?.product?.name" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ order.items[0]?.product?.name }}</h4>
              <p class="text-sm text-gray-600">{{ order.itemCount }} item{{ order.itemCount > 1 ? 's' : '' }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-primary">S${{ order.totalAmountSGD }}</p>
            </div>
          </div>

          <!-- Tracking Progress -->
          <div v-if="order.hasTracking" class="mb-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Order Progress</span>
              <span>{{ getTrackingText(order.status) }}</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2">
              <div :class="['h-2 rounded-full transition-all duration-300', getTrackingProgress(order.status)]" :style="{ width: getTrackingWidth(order.status) }" />
            </div>
          </div>

          <div class="flex space-x-3">
            <Button
              variant="primary"
              text="Track Items"
              size="sm"
            />
            <Button
              variant="secondary"
              text="View Details"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Past Orders -->
    <div v-if="orderTab === 'past'">
      <!-- Loading State -->
      <div v-if="isLoadingOrders" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="ordersError" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ ordersError }}</p>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" @click="loadOrders">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoadingOrders && pastOrders.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-file-text" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No past orders</h3>
        <p class="text-gray-500 mb-4">You don't have any completed orders yet.</p>
        <Button
          variant="primary"
          text="Start Shopping"
          @clicked="$router.push('/dashboard?tab=shop')"
        />
      </div>

      <div v-else class="grid gap-6">
        <div v-for="order in pastOrders" :key="order.id" class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-600">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getOrderStatusClass(order.status)]">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <div class="flex items-center space-x-4 mb-4">
            <img :src="order.items[0]?.product?.imageUrl" :alt="order.items[0]?.product?.name" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ order.items[0]?.product?.name }}</h4>
              <p class="text-sm text-gray-600">{{ order.itemCount }} item{{ order.itemCount > 1 ? 's' : '' }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-primary">S${{ order.totalAmountSGD }}</p>
            </div>
          </div>

          <div class="flex space-x-3">
            <Button
              variant="primary"
              text="View Receipt"
              size="sm"
            />
            <Button
              variant="secondary"
              text="Reorder"
              size="sm"
            />
            <Button
              variant="secondary"
              text="View Details"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../common/Button.vue';
import { ORDER_STATUS } from '~~/shared/constants';

const router = useRouter();

// Order tab state
const orderTab = ref('current');

// Order status codes using enum values
const orderStatusCodes = ref({
  pending: ORDER_STATUS.PENDING,
  pending_parent_approval: ORDER_STATUS.PENDING_PARENT_APPROVAL,
  paid: ORDER_STATUS.PAID,
  confirmed: ORDER_STATUS.CONFIRMED,
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: ORDER_STATUS.CANCELLED,
  refunded: ORDER_STATUS.REFUNDED,
  completed: 'completed'
});

// Orders data from database
const currentOrders = ref<any[]>([]);
const pastOrders = ref<any[]>([]);
const isLoadingOrders = ref(false);
const ordersError = ref<string | null>(null);

// Load orders from API
const loadOrders = async () => {
  try {
    isLoadingOrders.value = true;
    ordersError.value = null;

    // Fetch current and past orders in parallel
    const [currentOrdersResponse, pastOrdersResponse] = await Promise.all([
      $fetch('/api/orders/current'),
      $fetch('/api/orders/past')
    ]);

    currentOrders.value = currentOrdersResponse?.orders || [];
    pastOrders.value = pastOrdersResponse?.orders || [];

    console.log('[OrdersTab] Loaded orders:', {
      current: currentOrders.value.length,
      past: pastOrders.value.length
    });
  } catch (error) {
    console.error('Failed to load orders:', error);
    ordersError.value = 'Failed to load orders. Please try again.';
    currentOrders.value = [];
    pastOrders.value = [];
  } finally {
    isLoadingOrders.value = false;
  }
};

// Order helper functions
const getOrderStatusClass = (status: string) => {
  switch (status) {
    case orderStatusCodes.value.pending:
    case orderStatusCodes.value.pending_parent_approval:
      return 'bg-yellow-100 text-yellow-800';
    case orderStatusCodes.value.paid:
    case orderStatusCodes.value.confirmed:
      return 'bg-green-100 text-green-800';
    case orderStatusCodes.value.processing:
      return 'bg-blue-100 text-blue-800';
    case orderStatusCodes.value.shipped:
      return 'bg-purple-100 text-purple-800';
    case orderStatusCodes.value.delivered:
    case orderStatusCodes.value.completed:
      return 'bg-green-100 text-green-800';
    case orderStatusCodes.value.cancelled:
      return 'bg-red-100 text-red-800';
    case orderStatusCodes.value.refunded:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case ORDER_STATUS.PENDING_PARENT_APPROVAL:
      return 'Awaiting Approval';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'completed':
      return 'Completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const getTrackingProgress = (status: string) => {
  switch (status) {
    case orderStatusCodes.value.pending:
    case orderStatusCodes.value.pending_parent_approval:
      return 'bg-yellow-400';
    case orderStatusCodes.value.paid:
    case orderStatusCodes.value.confirmed:
      return 'bg-green-400';
    case orderStatusCodes.value.processing:
      return 'bg-blue-400';
    case orderStatusCodes.value.shipped:
      return 'bg-purple-400';
    case orderStatusCodes.value.delivered:
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
};

const getTrackingWidth = (status: string) => {
  switch (status) {
    case orderStatusCodes.value.pending:
    case orderStatusCodes.value.pending_parent_approval:
      return '20%';
    case orderStatusCodes.value.paid:
      return '40%';
    case orderStatusCodes.value.confirmed:
      return '60%';
    case orderStatusCodes.value.processing:
      return '70%';
    case orderStatusCodes.value.shipped:
      return '90%';
    case orderStatusCodes.value.delivered:
      return '100%';
    default:
      return '0%';
  }
};

const getTrackingText = (status: string) => {
  switch (status) {
    case orderStatusCodes.value.pending:
      return 'Payment pending';
    case orderStatusCodes.value.pending_parent_approval:
      return 'Awaiting parent approval';
    case orderStatusCodes.value.paid:
      return 'Payment confirmed';
    case orderStatusCodes.value.confirmed:
      return 'Order confirmed';
    case orderStatusCodes.value.processing:
      return 'Processing order';
    case orderStatusCodes.value.shipped:
      return 'Shipped';
    case orderStatusCodes.value.delivered:
      return 'Delivered';
    default:
      return 'Order placed';
  }
};

onMounted(() => {
  // Load orders from database APIs
  loadOrders();
});
</script>
