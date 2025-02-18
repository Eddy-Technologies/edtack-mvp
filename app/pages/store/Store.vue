<template>
  <div>
    <div class="store-header">
      <h2 class="title text-primary">STORE</h2>

      <div class="view-toggle">
        <UIcon
            @click="viewMode = 'icon'"
            name="i-heroicons-squares-2x2"
            class="icon w-6 h-6 text-primary-600 dark:text-primary-400 sm:text-primary sm:dark:text-primary shrink-0 px-4"
        />
        <UIcon
            @click="viewMode = 'list'"
            name="i-heroicons-list-bullet"
            class="icon w-6 h-6 text-primary-600 dark:text-primary-400 sm:text-primary sm:dark:text-primary shrink-0"
        />
      </div>
    </div>
    <p>Here are some amazing products.</p>

    <!-- Icon View -->
    <div v-if="viewMode === 'icon'" class="icon-view">
      <div v-for="item in items" :key="item.id" class="item icon-item">
        <div class="image-container">
          <img :src="item.image" :alt="item.name" class="item-image">
          <button
            class="cart-button"
            @click="addToCart(item)"
            :aria-label="'Add ' + item.name + ' to Cart'">
            Add to Cart
          </button>

        </div>
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p>{{ item.price }} Credits</p>
        </div>
        <p v-if="purchaseMessage === item.id">Purchase Successful!</p>
        <p v-if="insufficientFundsMessage === item.id" class="error-message">Insufficient Funds!</p>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div v-for="item in items" :key="item.id" class="item list-item">
        <img :src="item.image" :alt="item.name" class="item-image">
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p>Price: {{ item.price }} Credits</p>
        </div>
        <button
          class="cart-button"
          @click="addToCart(item)"
          :aria-label="'Add ' + item.name + ' to Cart'">
          Add to Cart
        </button>

        <p v-if="purchaseMessage === item.id">Purchase Successful!</p>
        <p v-if="insufficientFundsMessage === item.id" class="error-message">Insufficient Funds!</p>
      </div>
    </div>
  </div>
</template>

<script>
import placeholder1 from '../../../assets/a.png';
import placeholder2 from '../../../assets/b.png';
import placeholder3 from '../../../assets/c.png';
import placeholder4 from '../../../assets/d.png';
import placeholder5 from '../../../assets/e.png';

import { ref, onMounted, onUnmounted } from "vue";
import { useCreditStore } from "~/stores/credit";

export default {
  setup(props, { emit }) {
    const items = [
      { id: '1', name: 'Chicha', price: 5, image: placeholder4 },
      { id: '3', name: 'KFC', price: 10, image: placeholder2 },
      { id: '2', name: 'Fornite', price: 5, image: placeholder1 },
      { id: '4', name: 'Riot Games', price: 10, image: placeholder3 },
      { id: '5', name: 'Roblox', price: 10, image: placeholder5 },
    ];

    const purchaseMessage = ref(null);
    const insufficientFundsMessage = ref(null);
    const creditStore = useCreditStore();
    const viewMode = ref('icon'); // Default to 'icon' view
    const cart = ref([]); // Cart array to hold added items
    const screenWidth = ref(null);

    // Check if window is available (for SSR)
    const isWindowAvailable = typeof window !== 'undefined';

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

    const addToCart = (item) => {
      // Check if item is already in the cart
      const existingItem = cart.value.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        // Increase the quantity of the item if it already exists
        existingItem.quantity++;
      } else {
        // If item doesn't exist in the cart, add it with quantity 1
        cart.value.push({ ...item, quantity: 1 });
      }

      emit('add-to-cart', cart.value); // Send updated cart to parent
    };

    // Function to update screen width and change view mode
    const updateScreenSize = () => {
      if (isWindowAvailable) {
        screenWidth.value = window.innerWidth;
        if (screenWidth.value <= 768) {
          viewMode.value = "icon"; // Always default to icon mode on mobile
        }
      }
    };

    // Add event listener for screen resizing
    onMounted(() => {
      updateScreenSize();
      if (isWindowAvailable) {
        window.addEventListener("resize", updateScreenSize);
      }
    });

    // Cleanup event listener when component unmounts
    onUnmounted(() => {
      if (isWindowAvailable) {
        window.removeEventListener("resize", updateScreenSize);
      }
    });

    // Return reactive state and methods to template
    return {
      items,
      purchaseMessage,
      insufficientFundsMessage,
      buyItem,
      addToCart,
      viewMode,
      cart
    };
  },
};
</script>

<style scoped>
.store-header {
  display: flex;
  justify-content: space-between; /* Space out text and buttons */
  align-items: center; /* Vertically center items */
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.title {
  font-weight: normal;
}

/* Icon view styles */
.icon-view {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Default: 4 columns */
  gap: 20px; /* Spacing between items */
  margin-top: 20px;
}

/* List view styles */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Adjust items */
.item {
  padding: 10px;
  text-align: center;
  width: 100%; /* Adjust width for responsiveness */
  max-width: 300px;
}

.icon-item, .list-item {
  display: flex;
  flex-direction: column; /* Stack image and details vertically */
  align-items: center; /* Center everything */
  justify-content: center;
  text-align: center; /* Ensure text is centered */
  padding: 15px;
}

.item-image {
  width: 150px;  /* Square image */
  height: 150px;
  object-fit: cover; /* Maintain aspect ratio without distortion */
  border-radius: 8px;
  margin-bottom: 10px; /* Add space between image and details */
}

.image-container {
  position: relative; /* Needed for absolute positioning */
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-button {
  position: absolute;
  top: 10px; /* Position at top */
  right: 10px; /* Position at right */
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0; /* Initially hidden */
  transition: opacity 0.3s ease-in-out;
}

.icon-item:hover .cart-button {
  opacity: 1; /* Show button on hover */
}

.view-toggle {
  display: flex;
  gap: 10px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .icon-view {
    grid-template-columns: repeat(3, 1fr); /* 3 columns for tablets */
  }
}

@media (max-width: 768px) {
  .view-toggle {
    display: none;
  }

  .icon-view {
    grid-template-columns: repeat(2, 1fr); /* 2 columns for smaller screens */
  }

  .store-header {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .icon-view {
    grid-template-columns: repeat(1, 1fr); /* 1 column for mobile */
  }

  .list-item {
    flex-direction: column;
    text-align: center;
  }

  .list-item img {
    max-width: 80%;
    margin-bottom: 10px;
  }
}
</style>
