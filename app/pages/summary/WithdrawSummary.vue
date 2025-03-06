<template>
  <div class="confirmation-page">
    <div class="page-content bg-white dark:bg-gray-800">
      <h1 class="text-2xl font-bold mb-6">Confirm Your Withdrawal</h1>
      <div class="confirmation-content">
        <div class="cart-and-withdrawal">
          <div class="withdrawal-amount">
            <h3 class="text-lg font-medium mb-2">Withdrawal Amount</h3>
            <input
              v-model.number="withdrawalAmt"
              type="number"
              class="w-full p-2 border rounded withdrawal-input dark:text-white text-black"
              placeholder="Enter withdrawal amount"
            />
            Credits
          </div>
        </div>
        <div class="cashflow-summary">
          <h2 class="text-xl font-semibold mb-4">Cashflow Summary</h2>
          <div class="cashflow-details bg-gray-100 dark:bg-gray-700">
            <div class="summary-row">
              <span>Current Balance:</span>
              <span>{{ currentBalance.toFixed(2) }} Credits</span>
            </div>
            <div v-if="extraFee > 0" class="summary-row">
              <span>Fees:</span>
              <span>{{ extraFee.toFixed(2) }} Credits</span>
            </div>
            <div class="summary-row">
              <span>Total Deduction:</span>
              <span>{{ totalDeduction.toFixed(2) }} Credits</span>
            </div>
            <div class="summary-row font-bold">
              <span>Remaining Balance:</span>
              <span>{{ remainingBalance.toFixed(2) }} Credits</span>
            </div>
          </div>
        </div>
      </div>
      <button class="btn-confirm"
      @click="confirmOrder"
      :disabled="isInvalidWithdrawal"
      >Confirm Order</button>
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
const currentBalance = creditStore.childCredits[0] as number;

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

const isInvalidWithdrawal = computed(() => {
  return withdrawalAmt.value > currentBalance || withdrawalAmt.value <= 0;
});

const deleteItem = (index: number) => {
  cart.value.splice(index, 1);
};

const confirmOrder = () => {
  console.log('Confirming withdrawal:', withdrawalAmt.value);
  const previousBalance = currentBalance;
  if (creditStore.childCredits[0] === undefined) {
    alert("child credits is undefined");
    return;
  } else if (creditStore.childCredits[0] < totalDeduction.value) {
    alert("You do not have enough credits to complete this withdrawal!");
    return;
  } else {
    console.info('creditstore before:', creditStore.childCredits[0]);
    creditStore.childCredits[0] -= totalDeduction.value;
    console.info('creditstore updated:', creditStore.childCredits[0]);
  }
  router.push({
    name: 'success',
    query: {
      cartSubtotal: 0,
      extraFee: extraFee.value,
      discount: discount.value,
      withdrawalAmt: withdrawalAmt.value,
      cart: JSON.stringify([] as Cart),
      totalCost: totalDeduction.value,
      previousBalance: previousBalance
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-content {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.confirmation-content {
  display: flex;
  gap: 40px;
  justify-content: space-between;
  flex-wrap: wrap; /* Allows wrapping on smaller screens */
}

.cart-and-withdrawal,
.cashflow-summary {
  flex: 1;
  min-width: 300px; /* Ensures sections are flexible but don't get too narrow */
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
  padding: 15px;
  border-radius: 8px;
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

.btn-confirm:disabled {
  background-color: #B0BEC5;
  cursor: not-allowed;
}

input {
  color: #000000;
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
