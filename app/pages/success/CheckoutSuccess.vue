<template>
  <div class="success-page">
    <div class="success-content bg-white dark:bg-gray-800">
      <div class="success-icon">
        <UIcon class="h-16 w-16 text-green-500" name="i-heroicons-check-circle" />
      </div>
      <h1 class="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      <p class="mb-6">Thank you for your purchase. Your order has been confirmed.</p>
      <div class="order-details">
        <h2 class="text-xl font-semibold mb-2">Order Details</h2>
        <div class="detail-item">
          <span>Order Date:</span>
          <span>{{ orderDate }}</span>
        </div>
        <div class="detail-item">
          <span>Previous Balance:</span>
          <span>{{ previousBalance.toFixed(2) }} Credits</span>
        </div>
        <div class="detail-item">
          <span>Cart Subtotal:</span>
          <span>{{ cartSubtotal.toFixed(2) }} Credits</span>
        </div>
        <div v-if="discount > 0" class="detail-item">
          <span>Discount:</span>
          <span>Saved {{ discount.toFixed(2) }} Credits</span>
        </div>
        <div v-if="extraFee > 0" class="detail-item">
          <span>Fees:</span>
          <span>{{ extraFee.toFixed(2) }} Credits</span>
        </div>
        <div class="detail-item font-bold">
          <span>Total Amount:</span>
          <span>{{ totalCost.toFixed(2) }} Credits</span>
        </div>
        <div class="detail-item font-bold">
          <span>Remaining Balance:</span>
          <span>{{ currentBalance.toFixed(2) }} Credits</span>
        </div>
      </div>
      <div class="order-summary" v-if="cart.length > 0">
        <h3 class="text-lg font-semibold mb-2">Order Summary</h3>
        <div v-for="(item, index) in cart" :key="index" class="order-item">
          <img :src="item.image" :alt="item.name" class="item-image">
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span>{{ (item.price * item.quantity).toFixed(2) }} Credits</span>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-primary" @click="goToHome">Continue Shopping</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import type { Cart } from '~/models/Item';
import { useCreditStore } from '~/stores/credit'; // Import your store

const route = useRoute();
const router = useRouter();
const creditStore = useCreditStore();

const props = defineProps({
  cart: {
    type: Array as PropType<Cart>,
    default: () => []
  },
  cartSubtotal: {
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
  },
  totalCost: {
    type: Number,
    default: 0
  },
  previousBalance: {
    type: Number,
    default: 0
  }
});

const cart = ref<Cart>(props.cart as Cart);
const cartSubtotal = ref(props.cartSubtotal);
const extraFee = ref(props.extraFee);
const discount = ref(props.discount);
const currentBalance = creditStore.childCredits[0] as number;
const totalCost = ref(props.totalCost);
const previousBalance = ref(props.previousBalance);
const orderDate = new Date().toLocaleDateString();

const goToHome = () => {
  router.push({ name: 'home' });
};

onMounted(() => {
  console.log('onMount:', route.query);

  cartSubtotal.value = Number(route.query.cartSubtotal) || 0;
  extraFee.value = Number(route.query.extraFee) || 0;
  discount.value = Number(route.query.discount) || 0;
  totalCost.value = Number(route.query.totalCost) || 0;
  previousBalance.value = Number(route.query.previousBalance) || 0;

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
.success-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  /* Aligns content to the top */
  min-height: 100vh;  /* Ensures the page takes at least full height */
  padding: 20px;
}

.success-content {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Aligns content to the top */
  width: 100%;
  max-width: 800px;  /* Limits the width to a maximum size */
  margin: 0 auto;  /* Centers the content horizontally */
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.order-details,
.order-summary {
  text-align: left;
  margin-bottom: 20px;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.detail-item,
.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #e0e0e0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

:global(.dark) .success-content {
  background-color: #2a2a2a;
  color: #ffffff;
}

:global(.dark) .detail-item,
:global(.dark) .order-item {
  border-bottom-color: #444444;
}

:global(.dark) .btn-secondary {
  background-color: #3a3a3a;
  color: #ffffff;
}
</style>
