<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto m-4 w-full"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <div />
        <button
          class="text-gray-500 hover:text-gray-700 transition-colors"
          @click="closeModal"
        >
          <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
      </div>

      <SubscriptionPlans :is-modal="true" @close="closeModal" />
    </div>
  </div>
</template>

<script setup>
import SubscriptionPlans from './SubscriptionPlans.vue';

defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
