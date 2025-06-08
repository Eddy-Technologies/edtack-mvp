<template>
  <div class="store bg-background">
    <AppHeader />
    <div class="store-container">
      <div class="item-list">
        <div class="store-section">
          <Store :cart="cart" @add-to-cart="addToCart" />
        </div>
        <div class="sidebar">
          <div class="cart-section">
            <Cart :cart="cart" @update-cart="updateCart" @clear-cart="clearCart" />
          </div>
        </div>
      </div>
    </div>
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Credits from '~/pages/store/Credits.vue';
import Store from '~/pages/store/Store.vue';
import Cart from '~/pages/store/Cart.vue';

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
.store-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
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

/* Store Section */
.store-section {
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
