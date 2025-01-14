<template>
  <div class="store">
    <header
        class="bg-white/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
    >
      <UContainer class="flex flex-wrap items-center justify-between h-14">
        <div class="flex items-center gap-x-4">
          <ULink
              class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
              to="/"
          >
            <AppIcon class="w-8 h-8" /> EdAI
          </ULink>
        </div>
        <div class="flex items-center gap-x-2">
          <UIcon
              name="i-heroicons-currency-dollar-16-solid"
              class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
          />
          <span>{{ localCredits }}</span>
          <ULink
              class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
              to="/store"
          >
            <UIcon
                name="i-heroicons-building-storefront-16-solid"
                class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
            />
          </ULink>
          <ColorMode />
        </div>
      </UContainer>
    </header>
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
      <p>Current Credits: {{ localCredits }}</p>
    </div>
  </div>
</template>

<script>
import placeholder1 from '../../../assets/placeholder1.png';
import placeholder2 from '../../../assets/placeholder2.png';
import placeholder3 from '../../../assets/placeholder3.png';

export default {
  data() {
    return {
      items: [
        { id: 'item1', name: 'Cool Hat', price: 50, image: placeholder1 },
        { id: 'item2', name: 'Stylish Glasses', price: 100, image: placeholder2 },
        { id: 'item3', name: 'Awesome Backpack', price: 150, image: placeholder3 },
      ],
      purchaseMessage: null,
      insufficientFundsMessage: null,
      localCredits: localStorage.getItem("credits")
    };
  },
  watch: {
    credits(newValue){
      this.localCredits = newValue
    }
  },
  methods: {
    buyItem(item) {
      if (this.localCredits >= item.price) {
        this.localCredits -= item.price;
        this.$emit('credits-updated', this.localCredits); // Emit the updated credits
        this.purchaseMessage = item.id;
        this.insufficientFundsMessage = null
        setTimeout(() => {
          this.purchaseMessage = null;
        }, 3000);
      } else {
        this.insufficientFundsMessage = item.id;
        this.purchaseMessage = null
        setTimeout(() => {
          this.insufficientFundsMessage = null;
        }, 3000);
      }
    },
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
