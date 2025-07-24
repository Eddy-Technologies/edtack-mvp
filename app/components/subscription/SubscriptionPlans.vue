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
      :pricing-table-id="config.public.stripePricingTableId"
      :publishable-key="config.public.stripePublishableKey"
      :customer-email="me.email"
    />
  </div>
</template>

<script setup>
// import me from meStore
const me = useMeStore();
const config = useRuntimeConfig();

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
</script>
