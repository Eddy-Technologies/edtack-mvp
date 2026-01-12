<template>
  <div class="h-full overflow-y-auto">
    <div class="p-4 sm:p-6 min-h-full w-full">
      <DashboardShop :cart="cart" @add-to-cart="addToCart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardShop from './shop/DashboardShop.vue';

defineProps<{
  cart: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'add-to-cart', updatedCart: any[]): void;
}>();

// Pass through cart updates to parent
const addToCart = (updatedCart: any[]) => {
  emit('add-to-cart', updatedCart);
};
</script>
