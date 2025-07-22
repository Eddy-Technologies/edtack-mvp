<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Choose Your Plan</h2>
      <p class="text-gray-600">
        Select the perfect plan for your child's educational journey
      </p>
    </div>

    <!-- Stripe Pricing Table -->

    <stripe-pricing-table
      pricing-table-id="prctbl_1RnYsF2ennKEEze8SxzrXmI5"
      publishable-key="pk_test_51RmqmU2ennKEEze82gSWEvmABvBIVugAVmR5NKvMxW1braDV3rc4DeO0SQulwsqoe4Zl7BT8yK5Bw4kk7vkm7BU100SRjRNxVK"
      :customer-email="me.email"
    />
  </div>
</template>

<script setup>
// import me from meStore
const me = useMeStore();

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
</script>
