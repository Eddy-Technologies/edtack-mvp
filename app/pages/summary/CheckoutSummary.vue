<template>
  <div class="confirmation-page">
    <div class="page-content">
      <h1 class="text-2xl font-bold mb-6">Confirm Your Order</h1>
      <div class="confirmation-content">
        <div class="cart-and-withdrawal">
          <h2 class="text-xl font-semibold mb-4">Cart Items & Withdrawal</h2>
          <div class="cart-items">
            <div v-for="(item, index) in cart" :key="index" class="cart-item">
              <img :src="item.image" :alt="item.name" class="item-image">
              <div class="item-details">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-price">${{ item.price.toFixed(2) }} x {{ item.quantity }}</span>
                <span class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="item-actions">
                <button class="btn-icon btn-delete" title="Delete item" @click="deleteItem(index)">
                  <UIcon
                    name="i-heroicons-trash"
                    class="icon w-6 h-6 text-primary-600 dark:text-primary-400 sm:text-primary sm:dark:text-primary shrink-0 px-4"
                    @click="deleteItem(item)"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="withdrawal-amount">
            <h3 class="text-lg font-medium mb-2">Withdrawal Amount</h3>
            <input v-model.number="withdrawalAmt" type="number" class="w-full p-2 border rounded">
          </div>
          <div class="cart-summary">
            <div class="summary-row">
              <span>Cart Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="extraFee > 0" class="summary-row">
              <span>Extra Fee:</span>
              <span>${{ extraFee.toFixed(2) }}</span>
            </div>
            <div v-if="discount > 0" class="summary-row">
              <span>Discount:</span>
              <span>-${{ discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row font-bold">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="cashflow-summary">
          <h2 class="text-xl font-semibold mb-4">Cashflow Summary</h2>
          <div class="cashflow-details">
            <div class="summary-row">
              <span>Current Balance:</span>
              <span>${{ currentBalance.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Total Deduction:</span>
              <span>${{ totalDeduction.toFixed(2) }}</span>
            </div>
            <div class="summary-row font-bold">
              <span>Remaining Balance:</span>
              <span>${{ remainingBalance.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="btn-confirm" @click="confirmOrder">Confirm Order</button>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, PropType, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Cart } from '~/models/Item';
import { calculateCartSubtotal } from '~/utils/calculateCreditsUtils';
import { useCreditStore } from '~/stores/credit'; // Import your store

const route = useRoute();
const router = useRouter();
const creditStore = useCreditStore();

const props = defineProps({
  cart: {
    type: Array as PropType<Cart>,
    default: () => []
  },
  withdrawalAmount: {
    type: Number,
    default: 0
  },
  extraFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  }
});

const cart = ref<Cart>(props.cart as Cart);
const withdrawalAmt = ref(props.withdrawalAmount);
const extraFee = ref(props.extraFee);
const discount = ref(props.discount);
const currentBalance = creditStore.childCredits[0];

const subtotal = computed(() => {
  return calculateCartSubtotal(cart.value);
});

const total = computed(() => {
  return subtotal.value + extraFee.value - discount.value;
});

const totalDeduction = computed(() => {
  return total.value + withdrawalAmt.value;
});

const remainingBalance = computed(() => {
  return currentBalance - totalDeduction.value;
});

const deleteItem = (index: number) => {
  cart.value.splice(index, 1);
};

const confirmOrder = () => {
  console.log('Confirming order:', JSON.stringify(cart.value as Cart), withdrawalAmt.value);
  router.push({
    name: 'success',
    query: {
      extraFee: extraFee.value,
      discount: discount.value,
      withdrawalAmt: withdrawalAmt.value,
      cart: JSON.stringify(cart.value as Cart),
      totalCost: totalDeduction.value,
      previousBalance: currentBalance
    }
  });
  console.log('Order confirmed');
};

onMounted(() => {
  console.log('onMount:', route.query);
  extraFee.value = Number(route.query.extraFee) || 0;
  discount.value = Number(route.query.discount) || 0;
  withdrawalAmt.value = Number(route.query.withdrawalAmt) || 0;

  if (route.query.cart) {
    try {
      cart.value = JSON.parse(route.query.cart as string) as Cart; // Parse the string back into a Cart array
    } catch (error) {
      console.error('Error parsing cart data:', error);
      cart.value = []; // Fallback to an empty array if parsing fails
    }
  }
});
</script>

<style scoped>
.confirmation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.page-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:global(.dark) .page-content {
  background-color: #2a2a2a;
  color: #ffffff;
}

.confirmation-content {
  display: flex;
  gap: 40px;
}

.cart-and-withdrawal,
.cashflow-summary {
  flex: 1;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

:global(.dark) .cart-item {
  border-color: #444444;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: bold;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-edit {
  background-color: #4a90e2;
}

.btn-delete {
  background-color: #e74c3c;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.8;
}

.withdrawal-amount {
  margin-bottom: 20px;
}

.cart-summary,
.cashflow-details {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
}

:global(.dark) .cart-summary,
:global(.dark) .cashflow-details {
  background-color: #3a3a3a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.btn-confirm {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #2ecc71;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  margin-top: 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-confirm:hover {
  background-color: #27ae60;
}

input {
  background-color: #ffffff;
  color: #000000;
}

:global(.dark) input {
  background-color: #3a3a3a;
  color: #ffffff;
}

@media (max-width: 768px) {
  .confirmation-content {
    flex-direction: column;
  }

  .cart-and-withdrawal,
  .cashflow-summary {
    width: 100%;
  }
}
</style>
