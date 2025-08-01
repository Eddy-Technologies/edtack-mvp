<template>
  <div class="dashboard-shop">
    <div class="shop-container">
      <DashboardShop :cart="cart" @add-to-cart="addToCart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardShop from './shop/DashboardShop.vue';

const props = defineProps<{
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

<style scoped>
.dashboard-shop {
  height: 100%;
  overflow-y: auto;
}

.shop-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
}
</style>