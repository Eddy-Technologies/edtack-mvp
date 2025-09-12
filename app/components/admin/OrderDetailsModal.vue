<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          Order Details #{{ order?.id?.slice(-8).toUpperCase() }}
        </h2>
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          @click="closeModal"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div v-if="order" class="space-y-6">
          <!-- Order Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Order Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">Order Information</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Order ID:</span>
                  <span class="font-medium">#{{ order.id.slice(-8).toUpperCase() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status:</span>
                  <span :class="getStatusBadgeClass(order.status)">
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Date:</span>
                  <span class="font-medium">{{ formatDate(order.created_at) }}</span>
                </div>
                <div v-if="order.tracking_number" class="flex justify-between">
                  <span class="text-gray-600">Tracking:</span>
                  <span class="font-medium">{{ order.tracking_number }}</span>
                </div>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Name:</span>
                  <span class="font-medium">
                    {{ order.user_infos?.first_name }} {{ order.user_infos?.last_name }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Email:</span>
                  <span class="font-medium">{{ order.user_infos?.email }}</span>
                </div>
                <div v-if="order.shipping_address" class="flex flex-col">
                  <span class="text-gray-600 mb-1">Shipping Address:</span>
                  <span class="font-medium text-xs">{{ order.shipping_address }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="item in order.order_items" :key="item.id">
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-3">
                        <img
                          v-if="item.products?.image_url"
                          :src="item.products.image_url"
                          :alt="item.products.name"
                          class="w-10 h-10 rounded object-cover"
                        >
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            {{ item.products?.name }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {{ item.quantity }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">
                      ${{ (item.unit_price_cents / 100).toFixed(2) }}
                    </td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                      ${{ (item.total_price_cents / 100).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Order Totals -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">${{ (order.subtotal_cents / 100).toFixed(2) }}</span>
              </div>
              <div v-if="order.tax_cents" class="flex justify-between text-sm">
                <span class="text-gray-600">Tax:</span>
                <span class="font-medium">${{ (order.tax_cents / 100).toFixed(2) }}</span>
              </div>
              <div v-if="order.shipping_cents" class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping:</span>
                <span class="font-medium">${{ (order.shipping_cents / 100).toFixed(2) }}</span>
              </div>
              <div v-if="order.discount_cents" class="flex justify-between text-sm">
                <span class="text-gray-600">Discount:</span>
                <span class="font-medium text-green-600">-${{ (order.discount_cents / 100).toFixed(2) }}</span>
              </div>
              <div class="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${{ (order.total_amount_cents / 100).toFixed(2) }} {{ order.currency }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.notes">
            <h3 class="font-semibold text-gray-900 mb-3">Order Notes</h3>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">{{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ORDER_STATUS, ORDER_FULFILLMENT } from '~~/shared/constants';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const getStatusBadgeClass = (status) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case ORDER_STATUS.PENDING:
      return `${baseClass} bg-orange-100 text-orange-700`;
    case ORDER_FULFILLMENT.PROCESSING:
      return `${baseClass} bg-blue-100 text-blue-700`;
    case ORDER_FULFILLMENT.SHIPPED:
      return `${baseClass} bg-green-100 text-green-700`;
    case ORDER_FULFILLMENT.DELIVERED:
      return `${baseClass} bg-green-100 text-green-800`;
    case ORDER_STATUS.CANCELLED:
      return `${baseClass} bg-red-100 text-red-700`;
    case ORDER_STATUS.REFUNDED:
      return `${baseClass} bg-gray-100 text-gray-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-700`;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
