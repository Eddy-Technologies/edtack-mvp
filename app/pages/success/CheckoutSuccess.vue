<template>
  <div class="success-page">
    <div class="success-content">
      <div class="success-icon">
        <UIcon class="h-16 w-16 text-green-500" />
      </div>
      <h1 class="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      <p class="mb-6">Thank you for your purchase. Your order has been confirmed.</p>
      <div class="order-details">
        <h2 class="text-xl font-semibold mb-2">Order Details</h2>
        <div class="detail-item">
          <span>Order Number:</span>
          <span>{{ orderNumber }}</span>
        </div>
        <div class="detail-item">
          <span>Order Date:</span>
          <span>{{ orderDate }}</span>
        </div>
        <div class="detail-item font-bold">
          <span>Total Amount:</span>
          <span>${{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <div class="order-summary">
        <h3 class="text-lg font-semibold mb-2">Order Summary</h3>
        <div v-for="(item, index) in orderItems" :key="index" class="order-item">
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-primary" @click="goToHome">Continue Shopping</button>
        <button class="btn-secondary" @click="viewOrderDetails">View Order Details</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const extraFee = ref(0);
const discount = ref(0);
const currentBalance = ref(0);
const withdrawalAmt = ref(0);
const cart = ref([]);

// In a real application, you would get these values from your state management or API
const orderNumber = ref('ORD' + Math.random().toString(36).substr(2, 9).toUpperCase());
const orderDate = ref(new Date().toLocaleDateString());
const totalAmount = ref(150.99);
const orderItems = ref([
  { name: 'Product 1', quantity: 2, price: 29.99 },
  { name: 'Product 2', quantity: 1, price: 89.99 },
  { name: 'Product 3', quantity: 1, price: 1.02 },
]);

const goToHome = () => {
  router.push({ name: 'home' });
};

const viewOrderDetails = () => {
  router.push({ name: 'orderDetails', params: { orderId: orderNumber.value } });
};

onMounted(() => {
  extraFee.value = Number(route.params.extraFee) || 0;
  discount.value = Number(route.params.discount) || 0;
  currentBalance.value = Number(route.params.currentBalance) || 0;
  withdrawalAmt.value = Number(route.params.withdrawalAmt) || 0;

  try {
    cart.value = JSON.parse(route.params.cart) || [];
  } catch (error) {
    console.error('Error parsing cart data:', error);
    cart.value = [];
  }
});
</script>

<style scoped>
.success-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.success-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
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
