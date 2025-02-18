<template>
  <div class="store">
    <AppHeader />
    <div class="store-container">
      <div class="item-list">
        <div class="store-section">
          <Store @add-to-cart="addToCart" />
        </div>
        <div class="sidebar">
          <div class="credits-section">
            <Credits />
          </div>
          <div class="cart-section">
            <Cart :cart="cart" @clearCart="clearCart" />
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import { ref } from 'vue';
import Credits from '~/pages/store/Credits.vue';
import Store from "~/pages/store/Store.vue";
import Cart from "~/pages/store/Cart.vue";

export default {
  components: {
    Cart,
    Store,
    Credits
  },
  setup() {
    // Reactive variable to hold cart items
    const cart = ref([]);

    // Method to add items to the cart
    const addToCart = (updatedCart) => {
      cart.value = updatedCart; // Update the cart with the new cart items
    };

    // Method to clear the cart
    const clearCart = () => {
      cart.value = []; // Reset the cart array to clear the items
    };

    // Return the reactive variables and methods for use in the template
    return {
      cart,
      addToCart,
      clearCart
    };
  }
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
