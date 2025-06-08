<template>
  <div class="summary-page">
    <AppHeader />
    <div class="store-container">
      <div class="item-list">
        <div class="store-section">
          <CheckoutSummary
            v-if="cart.length > 0"
            :cart="cart"
            :extra-fee="extraFee"
            :discount="discount"
          />
          <WithdrawSummary v-if="withdrawalAmount > 0" :withdrawal-amount="withdrawalAmount" />
          <div v-else class="empty-message p-4 text-center text-gray-500">
            Your cart and withdrawals are empty.
          </div>
        </div>
      </div>
    </div>
    <!-- <AppFooter /> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Cart } from '~/models/Item';
import CheckoutSummary from '~/pages/summary/CheckoutSummary.vue';
import WithdrawSummary from '~/pages/summary/WithdrawSummary.vue';

const route = useRoute();

const cart = ref<Cart>([] as Cart);
const withdrawalAmount = ref(0);
const extraFee = ref(0);
const discount = ref(0);

onMounted(() => {
  console.log('summary onMount:', route.query);
  if (route.query.cart) {
    try {
      cart.value = JSON.parse(route.query.cart as string) as Cart; // Parse the string back into a Cart array
    } catch (error) {
      console.error('Error parsing cart data:', error);
      cart.value = []; // Fallback to an empty array if parsing fails
    }
  }

  withdrawalAmount.value = Number(route.query.withdrawalAmt) || 0;
  extraFee.value = Number(route.query.extraFee) || 0;
  discount.value = Number(route.query.discount) || 0;
});
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

.empty-message {
  color: #6b7280; /* Tailwind gray-500 */
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
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
