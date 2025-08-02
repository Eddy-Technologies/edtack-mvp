<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">Update Order Status</h2>
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          @click="closeModal"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Modal Content -->
      <form class="p-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Order Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 class="font-medium text-gray-900 mb-2">Order #{{ order?.id?.slice(-8).toUpperCase() }}</h3>
            <p class="text-sm text-gray-600">
              Customer: {{ order?.user_infos?.first_name }} {{ order?.user_infos?.last_name }}
            </p>
            <p class="text-sm text-gray-600">
              Total: ${{ (order?.total_amount_cents / 100).toFixed(2) }}
            </p>
          </div>

          <!-- Status Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              v-model="form.status"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <!-- Tracking Number -->
          <div v-if="form.status === 'shipped' || form.status === 'delivered'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              v-model="form.tracking_number"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter tracking number"
            >
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add any notes about this status update..."
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!form.status"
            class="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Status
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  status: '',
  tracking_number: '',
  notes: ''
});

// Watch for order changes to populate form
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    form.value = {
      status: newOrder.status || '',
      tracking_number: newOrder.tracking_number || '',
      notes: newOrder.notes || ''
    };
  } else {
    form.value = {
      status: '',
      tracking_number: '',
      notes: ''
    };
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!form.value.status) return;

  emit('save', { ...form.value });
};
</script>
