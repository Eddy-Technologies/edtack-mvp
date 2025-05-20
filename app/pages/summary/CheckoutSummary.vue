<template>
  <div class="confirmation-page">
    <div class="page-content bg-white dark:bg-gray-800">
      <h1 class="text-2xl font-bold mb-6">Confirm Your Order</h1>
      <div class="confirmation-content">
        <div class="cart-and-withdrawal">
          <div class="cart-items">
            <div v-for="(item, index) in cart" :key="index" class="cart-item">
              <img :src="item.image" :alt="item.name" class="item-image">
              <div class="item-details">
                <span class="item-name">{{ item.name }}</span>
                <div class="item-price-quantity">
                  <span class="item-price">{{ item.price.toFixed(2) }} Credits x </span>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    :min="1"
                    class="quantity-input dark:text-white text-black"
                    @change="updateQuantity(item)"
                  >
                </div>
                <span class="item-total">{{ (item.price * item.quantity).toFixed(2) }} Credits</span>
              </div>
              <div class="item-actions">
                <button class="btn-icon btn-delete" title="Delete item">
                  <UIcon
                    name="i-heroicons-trash"
                    class="icon w-6 h-6 text-primary dark:text-primary sm:text-primary sm:dark:text-primary shrink-0 px-4"
                    @click="deleteItem(index)"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="cart-summary bg-gray-100 dark:bg-gray-700">
            <div class="summary-row">
              <span>Cart Subtotal:</span>
              <span>{{ subtotal.toFixed(2) }} Credits</span>
            </div>
            <div v-if="extraFee > 0" class="summary-row">
              <span>Fees:</span>
              <span>{{ extraFee.toFixed(2) }} Credits</span>
            </div>
            <div v-if="discount > 0" class="summary-row">
              <span>Discount:</span>
              <span>-{{ discount.toFixed(2) }} Credits</span>
            </div>
            <div class="summary-row font-bold">
              <span>Total:</span>
              <span>{{ totalDeduction.toFixed(2) }} Credits</span>
            </div>
          </div>
        </div>
        <div class="cashflow-summary">
          <h2 class="text-xl font-semibold mb-4">Cashflow Summary</h2>
          <div class="cashflow-details bg-gray-100 dark:bg-gray-700">
            <div class="summary-row">
              <span>Current Balance:</span>
              <span>{{ currentBalance.toFixed(2) }} Credits</span>
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
      <button
        class="btn-confirm"
        :disabled="isInvalidCheckout"
        @click="confirmOrder"
      >
        Confirm Order
      </button>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Cart, Item } from '~/models/Item';
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
const extraFee = ref(props.extraFee);
const discount = ref(props.discount);
const currentBalance = creditStore.childCredits[0] as number;

const subtotal = computed(() => {
  return calculateCartSubtotal(cart.value);
});

const totalDeduction = computed(() => {
  return subtotal.value + extraFee.value - discount.value;
});

const remainingBalance = computed(() => {
  return currentBalance - totalDeduction.value;
});

const isInvalidCheckout = computed(() => {
  return totalDeduction.value > currentBalance || cart.value.length <= 0;
});

const updateQuantity = (item: Item) => {
  if (item.quantity < 1) {
    item.quantity = 1; // Ensure quantity doesn't go below 1
  }
};

const deleteItem = (index: number) => {
  cart.value.splice(index, 1);
};

const confirmOrder = () => {
  console.log('Confirming order:', JSON.stringify(cart.value as Cart));
  const previousBalance = currentBalance;
  if (creditStore.childCredits[0] === undefined) {
    console.error('Child credits is undefined');
    alert('Child credits is undefined');
    return;
  } else if (creditStore.childCredits[0] < totalDeduction.value) {
    console.error('You do not have enough credits to complete this withdrawal!');
    alert('You do not have enough credits to complete this withdrawal!');
    return;
  } else {
    console.info('creditstore before:', creditStore.childCredits[0]);
    creditStore.childCredits[0] -= totalDeduction.value;
    console.info('creditstore updated:', creditStore.childCredits[0]);
  }
  router.push({
    name: 'success',
    query: {
      cartSubtotal: subtotal.value,
      extraFee: extraFee.value,
      discount: discount.value,
      withdrawalAmt: 0,
      cart: JSON.stringify(cart.value as Cart),
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

.item-price-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-price {
  font-weight: bold;
}

.quantity-input {
  width: 50px;
  padding: 5px;
  text-align: center;
  border-radius: 4px;
}

.item-total {
  font-weight: bold;
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
