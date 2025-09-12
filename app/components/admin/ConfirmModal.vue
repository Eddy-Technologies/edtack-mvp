<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="handleCancel"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
      </div>

      <!-- Modal Content -->
      <div class="p-6">
        <p class="text-gray-600">{{ message }}</p>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>
