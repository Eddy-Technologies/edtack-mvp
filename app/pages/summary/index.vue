<template>
  <div class="summary-page">
    <AppHeader />
    <div class="store-container">
      <div class="item-list">
        <div class="store-section">
          <CheckoutSummary />
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import { ref } from 'vue';
import CheckoutSummary from '~/pages/summary/CheckoutSummary.vue';

export default {
  components: {
    CheckoutSummary,
  },
  setup() {
    // Reactive variable to hold cart items
    const cart = ref([]);
    const withdrawalAmount = ref(0);

    // Return the reactive variables and methods for use in the template
    return {
      cart,
      withdrawalAmount,
    };
  }
};
</script>

<style scoped>
.summary-container {
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
.summary-section {
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
