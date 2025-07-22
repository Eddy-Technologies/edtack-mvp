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

      <!-- <SubscriptionPlans :is-modal="true" @close="closeModal" /> -->
      <stripe-pricing-table
        pricing-table-id="prctbl_1RnYsF2ennKEEze8SxzrXmI5"
        publishable-key="pk_test_51RmqmU2ennKEEze82gSWEvmABvBIVugAVmR5NKvMxW1braDV3rc4DeO0SQulwsqoe4Zl7BT8yK5Bw4kk7vkm7BU100SRjRNxVK"
      />
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

onMounted(() => {
  if (!document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.head.appendChild(script);
  }
});
</script>
