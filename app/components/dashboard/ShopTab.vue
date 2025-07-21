<template>
  <div class="dashboard-shop">
    <div class="shop-container">
      <DashboardShop :cart="cart" @add-to-cart="addToCart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DashboardShop from './shop/DashboardShop.vue';

// Reactive cart
const cart = ref([]);

// Update cart after an item is added
const addToCart = (updatedCart: any[]) => {
  cart.value = updatedCart;
};

// Clear all items
const clearCart = () => {
  cart.value = [];
};

// Update cart from child (e.g., delete/edit)
const updateCart = (updatedCart: any[]) => {
  cart.value = updatedCart;
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
