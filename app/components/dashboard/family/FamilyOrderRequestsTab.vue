<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoadingOrders" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p class="text-gray-600">Loading order requests...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="ordersError" class="text-center py-12">
      <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
        <UIcon name="i-lucide-alert-circle" size="48" />
      </div>
      <p class="text-red-600 mb-4">{{ ordersError }}</p>
      <Button
        variant="primary"
        text="Try Again"
        @clicked="loadPendingOrders"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Filters and Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Filter by Status:</label>
            <select
              v-model="selectedStatus"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
              @change="onStatusChange"
            >
              <option value="all">All Orders</option>
              <option :value="ORDER_STATUS.PENDING_PARENT_APPROVAL">Awaiting Approval</option>
              <option :value="ORDER_STATUS.PAID">Paid</option>
              <option :value="ORDER_STATUS.CONFIRMED">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option :value="ORDER_STATUS.CANCELLED">Cancelled</option>
              <option :value="ORDER_STATUS.REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        <Button
          variant="secondary"
          color="gray"
          text="Refresh"
          icon="i-lucide-refresh-cw"
          @clicked="loadPendingOrders"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingOrders && pendingOrders.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-shopping-cart" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p class="text-gray-500 mb-4">
          {{ isStudent ? 'You haven\'t placed any orders yet.' : 'No family member orders match the selected status filter.' }}
        </p>
      </div>

      <!-- Order Requests List -->
      <div v-else class="space-y-6">
        <!-- Pagination Top -->
        <Pagination
          v-if="pagination && pagination.total > 0"
          :pagination="paginationData"
          :is-loading="isLoadingOrders"
          item-label="orders"
          @go-to-page="goToPage"
          @change-limit="changeItemsPerPage"
        />

        <div class="grid gap-6">
          <div v-for="order in pendingOrders" :key="order.id" class="bg-white rounded-lg shadow-sm border p-6">
            <!-- Order Header -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Order #{{ order.orderNumber }}</h3>
                <p class="text-sm text-gray-600">
                  <template v-if="isStudent">
                    Your order • {{ new Date(order.createdAt).toLocaleDateString() }}
                  </template>
                  <template v-else>
                    Requested by <span class="font-medium text-gray-900">{{ order.child.name }}</span>
                    • {{ new Date(order.createdAt).toLocaleDateString() }}
                  </template>
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getStatusBadgeClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>

            <!-- Order Items -->
            <div class="space-y-3 mb-6">
              <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <img
                  :src="item.product.imageUrl"
                  :alt="item.product.name"
                  class="w-12 h-12 object-cover rounded-lg"
                >
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ item.product.name }}</h4>
                  <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">S${{ item.totalPriceSGD }}</p>
                  <p class="text-sm text-gray-500">S${{ item.unitPriceSGD }} each</p>
                </div>
              </div>
            </div>

            <!-- Order Total -->
            <div class="flex justify-between items-center py-3 border-t border-gray-200 mb-6">
              <span class="text-lg font-medium text-gray-900">Total Amount</span>
              <span class="text-xl font-bold text-primary">S${{ order.totalAmountSGD }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <!-- Parent Actions: Show approval buttons only for pending_parent_approval orders -->
              <template v-if="isParent && order.status === 'pending_parent_approval'">
                <Button
                  variant="primary"
                  text="Approve & Pay"
                  icon="i-lucide-check"
                  :loading="isProcessing && processingOrderId === order.id"
                  @clicked="approveOrder(order.id)"
                />
                <Button
                  variant="secondary"
                  color="red"
                  text="Reject"
                  icon="i-lucide-x"
                  :loading="isProcessing && processingOrderId === order.id"
                  @clicked="rejectOrder(order.id)"
                />
              </template>

              <!-- Student Actions: No action buttons for students - they can only view -->

              <!-- Always show view details button -->
              <Button
                variant="secondary"
                color="gray"
                text="View Details"
                icon="i-lucide-eye"
                @clicked="viewOrderDetails(order)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showDetailsModal && selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Order Details</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showDetailsModal = false">
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Order Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Order Number:</span>
                <span class="font-medium">{{ selectedOrder.orderNumber }}</span>
              </div>
              <div v-if="!isStudent" class="flex justify-between">
                <span class="text-gray-600">Requested by:</span>
                <span class="font-medium">{{ selectedOrder.child.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Request Date:</span>
                <span class="font-medium">{{ new Date(selectedOrder.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Amount:</span>
                <span class="font-bold text-primary">S${{ selectedOrder.totalAmountSGD }}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Items ({{ selectedOrder.itemCount }})</h4>
            <div class="space-y-3">
              <div v-for="item in selectedOrder.items" :key="item.id" class="flex items-center space-x-4 p-3 border rounded-lg">
                <img
                  :src="item.product.imageUrl"
                  :alt="item.product.name"
                  class="w-16 h-16 object-cover rounded-lg"
                >
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900">{{ item.product.name }}</h5>
                  <p class="text-sm text-gray-600">{{ item.product.description }}</p>
                  <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">S${{ item.totalPriceSGD }}</p>
                  <p class="text-sm text-gray-500">S${{ item.unitPriceSGD }} each</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Button from '~/components/common/Button.vue';
import Pagination from '~/components/common/Pagination.vue';
import { useMeStore } from '~/stores/me';
import { ORDER_STATUS } from '~~/shared/constants/codes';

// Reactive state
const pendingOrders = ref<any[]>([]);
const isLoadingOrders = ref(false);
const ordersError = ref<string | null>(null);
const isProcessing = ref(false);
const processingOrderId = ref<string | null>(null);
const showDetailsModal = ref(false);
const selectedOrder = ref<any>(null);
// Set default status based on user role
const selectedStatus = ref('all');

// Pagination state
const pagination = ref<any>(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Get user role from store
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);
const isStudent = computed(() => meStore.user_role?.toLowerCase() === 'student');

// Load orders from API
const loadPendingOrders = async (page = 1) => {
  try {
    isLoadingOrders.value = true;
    ordersError.value = null;

    const offset = (page - 1) * itemsPerPage.value;

    const response = await $fetch('/api/orders/pending-approval', {
      query: {
        status: selectedStatus.value,
        limit: itemsPerPage.value,
        offset: offset
      }
    });

    pendingOrders.value = response?.orders || [];
    pagination.value = response?.pagination || null;
    currentPage.value = page;

    console.log('[FamilyOrderRequestsTab] Loaded orders:', pendingOrders.value.length, 'Status:', selectedStatus.value, 'Page:', page);
  } catch (error) {
    console.error('Failed to load orders:', error);
    ordersError.value = 'Failed to load order requests. Please try again.';
    pendingOrders.value = [];
    pagination.value = null;
  } finally {
    isLoadingOrders.value = false;
  }
};

// Approve order
const approveOrder = async (orderId: string) => {
  try {
    isProcessing.value = true;
    processingOrderId.value = orderId;

    const response = await $fetch('/api/orders/approve-purchase', {
      method: 'POST',
      body: {
        order_id: orderId,
        approved: true
      }
    });

    if (response.success) {
      if (response.stripeCheckoutUrl) {
        // Redirect to Stripe for payment
        window.location.href = response.stripeCheckoutUrl;
      } else {
        // Order completed with credits
        alert('Order approved and completed successfully!');
        await loadPendingOrders(); // Refresh the list
      }
    } else {
      throw new Error(response.message || 'Failed to approve order');
    }
  } catch (error: any) {
    console.error('Failed to approve order:', error);
    alert(error.data?.message || error.message || 'Failed to approve order. Please try again.');
  } finally {
    isProcessing.value = false;
    processingOrderId.value = null;
  }
};

// Reject order
const rejectOrder = async (orderId: string) => {
  try {
    isProcessing.value = true;
    processingOrderId.value = orderId;

    const response = await $fetch('/api/orders/approve-purchase', {
      method: 'POST',
      body: {
        order_id: orderId,
        approved: false
      }
    });

    if (response.success) {
      alert('Order request rejected. Child credits have been released.');
      await loadPendingOrders(); // Refresh the list
    } else {
      throw new Error(response.message || 'Failed to reject order');
    }
  } catch (error: any) {
    console.error('Failed to reject order:', error);
    alert(error.data?.message || error.message || 'Failed to reject order. Please try again.');
  } finally {
    isProcessing.value = false;
    processingOrderId.value = null;
  }
};

// View order details
const viewOrderDetails = (order: any) => {
  selectedOrder.value = order;
  showDetailsModal.value = true;
};

// Helper functions for status display
const getStatusText = (status: string) => {
  const statusMap = {
    [ORDER_STATUS.PENDING_PARENT_APPROVAL]: 'Awaiting Approval',
    [ORDER_STATUS.PAID]: 'Paid',
    [ORDER_STATUS.CONFIRMED]: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.REJECTED]: 'Rejected'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classMap = {
    [ORDER_STATUS.PENDING_PARENT_APPROVAL]: 'bg-yellow-100 text-yellow-800',
    [ORDER_STATUS.PAID]: 'bg-blue-100 text-blue-800',
    [ORDER_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    [ORDER_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
    [ORDER_STATUS.REJECTED]: 'bg-red-100 text-red-800'
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

// Computed pagination data for Pagination component
const paginationData = computed(() => {
  if (!pagination.value) return null;

  const totalPages = Math.ceil(pagination.value.total / itemsPerPage.value);

  return {
    currentPage: currentPage.value,
    totalPages,
    totalCount: pagination.value.total,
    limit: itemsPerPage.value,
    hasPrevPage: currentPage.value > 1,
    hasNextPage: pagination.value.hasNext
  };
});

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && pagination.value && page <= Math.ceil(pagination.value.total / itemsPerPage.value)) {
    loadPendingOrders(page);
  }
};

const changeItemsPerPage = (newLimit: number) => {
  itemsPerPage.value = newLimit;
  currentPage.value = 1;
  loadPendingOrders(1);
};

// Handle status filter change
const onStatusChange = () => {
  currentPage.value = 1;
  loadPendingOrders(1);
};

onMounted(() => {
  loadPendingOrders(1);
});
</script>
