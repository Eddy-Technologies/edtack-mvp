<template>
  <div class="store">
    <AppHeader />
    <div class="store-container">
      <h1>Store</h1>
      <div class="item-list">
        <div v-for="item in items" :key="item.id" class="item">
          <img :src="item.image" :alt="item.name" class="item-image">
          <h3>{{ item.name }}</h3>
          <p>Price: {{ item.price }} Credits</p>
          <button class="buy-button" @click="buyItem(item)" :disabled="localCredits < item.price">
            Buy
          </button>
          <p v-if="purchaseMessage === item.id">Purchase Successful!</p>
          <p v-if="insufficientFundsMessage === item.id" class="error-message">Insufficient Funds!</p>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import placeholder1 from '../../../assets/placeholder1.png';
import placeholder2 from '../../../assets/placeholder2.png';
import placeholder3 from '../../../assets/placeholder3.png';

import { ref } from 'vue';
import {useCreditStore} from "~/stores/credit";

export default {
  setup(props, { emit }) {
    // Define reactive state with `ref`
    const items = [
      { id: 'item1', name: 'Cool Hat', price: 50, image: placeholder1 },
      { id: 'item2', name: 'Stylish Glasses', price: 100, image: placeholder2 },
      { id: 'item3', name: 'Awesome Backpack', price: 150, image: placeholder3 },
    ];

    const purchaseMessage = ref(null);
    const insufficientFundsMessage = ref(null);
    const creditStore = useCreditStore();

    // Buy item method
    const buyItem = (item) => {
      if (creditStore.count >= item.price) {
        creditStore.count -= item.price;
        emit('credits-updated', creditStore.count); // Emit the updated credits
        purchaseMessage.value = item.id;
        insufficientFundsMessage.value = null;

        // Clear purchase message after 3 seconds
        setTimeout(() => {
          purchaseMessage.value = null;
        }, 3000);
      } else {
        insufficientFundsMessage.value = item.id;
        purchaseMessage.value = null;

        // Clear insufficient funds message after 3 seconds
        setTimeout(() => {
          insufficientFundsMessage.value = null;
        }, 3000);
      }
    };

    // Return reactive state and methods to template
    return {
      items,
      purchaseMessage,
      insufficientFundsMessage,
      buyItem,
    };
  },
};
</script>
<style scoped>
.store-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px; /* Spacing between items */
}

.item {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  width: 200px; /* Adjust as needed */
}

.item-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}
.error-message {
  color: red
}

.buy-button {
  background-color: #3a80d2;
  transform: translateY(-2px);
}
</style>
