<template>
  <div class="success-page">
    <AppHeader />
    <div class="success-container">
      <div class="item-list">
        <div class="success-section">
          <CheckoutSuccess
          :cart="cart"
            :withdrawal-amount="withdrawalAmount"
            :current-balance="currentBalance"
            :extra-fee="extraFee"
            :discount="discount"/>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import { ref } from 'vue';
import CheckoutSuccess from '~/pages/success/CheckoutSuccess.vue';

export default {
  components: {
    CheckoutSuccess,
  },
  setup() {
    // Reactive variable to hold cart items
    const cart = ref([]);
    const withdrawalAmount = ref(0);
    const extraFee = ref(0);
    const discount = ref(0);
    const currentBalance = ref(1000);

    // Return the reactive variables and methods for use in the template
    return {
      extraFee,
      discount,
      currentBalance,
      withdrawalAmount,
      cart,
    };
  }
};
</script>

<style scoped>
.success-container {
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

/* Summary Section */
.success-section {
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
