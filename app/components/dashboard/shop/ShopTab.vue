<template>
  <div class="dashboard-shop">
    <div class="shop-container">
      <div class="item-list">
        <div class="shop-section">
          <DashboardShop :cart="cart" @add-to-cart="addToCart" />
        </div>
        <div class="sidebar">
          <div class="cart-section">
            <DashboardCart :cart="cart" @update-cart="updateCart" @clear-cart="clearCart" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DashboardShop from './DashboardShop.vue';
import DashboardCart from './DashboardCart.vue';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100%;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

/* Sidebar (Desktop View) */
.sidebar {
  padding: 10px;
  z-index: 10;
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 20px;
}

/* Shop Section */
.shop-section {
  flex-grow: 1;
  padding: 10px;
  min-height: 400px;
  max-width: 800px;
}

/* Responsive Design */
@media (max-width: 1115px) {
  .item-list {
    flex-direction: column-reverse; /* Store appears below sidebar */
    align-items: center;
  }

  .sidebar {
    width: 100%;
    position: static; /* Remove sticky positioning */
    margin-bottom: 20px;
  }
}
</style>
