<template>
  <div class="success-page">
    <AppHeader />
    <div class="success-container">
      <div class="item-list">
        <div class="success-section">
          <CheckoutSuccess
            v-if="cart.length > 0"
            :cart="cart"
            :cart-subtotal="cartSubtotal"
            :previous-balance="previousBalance"
            :extra-fee="extraFee"
            :total-cost="totalCost"
            :discount="discount"/>
          <WithdrawSuccess
            v-if="withdrawalAmount > 0"
            :previous-balance="previousBalance"
            :withdrawal-amount="withdrawalAmount"
          />
          <div v-else class="empty-message p-4 text-center text-gray-500 dark:text-gray-400">
            You did not exchange credits for items and withdraw any credits.
          </div>
        </div>
      </div>
    </div>
    <!-- <AppFooter /> -->
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Cart } from '~/models/Item';
import CheckoutSuccess from '~/pages/success/CheckoutSuccess.vue';
import WithdrawSuccess from '~/pages/success/WithdrawSuccess.vue';

const route = useRoute();

const cart = ref<Cart>([] as Cart);
const cartSubtotal = ref(0);
const withdrawalAmount = ref(0);
const extraFee = ref(0);
const discount = ref(0);
const previousBalance = ref(0);
const totalCost = ref(0);

onMounted(() => {
  console.log('success onMount:', route.query);
  if (route.query.cart) {
    try {
      cart.value = JSON.parse(route.query.cart as string) as Cart; // Parse the string back into a Cart array
    } catch (error) {
      console.error('Error parsing cart data:', error);
      cart.value = []; // Fallback to an empty array if parsing fails
    }
  }

  cartSubtotal.value = Number(route.query.cartSubtotal) || 0;
  withdrawalAmount.value = Number(route.query.withdrawalAmt) || 0;
  extraFee.value = Number(route.query.extraFee) || 0;
  discount.value = Number(route.query.discount) || 0;
  previousBalance.value = Number(route.query.previousBalance) || 0;
});
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
