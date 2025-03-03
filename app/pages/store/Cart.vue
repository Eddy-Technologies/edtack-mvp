<template>
  <div class="cart-section border-black dark:border-gray-800">
    <h3>Your Cart</h3>
    <ul>
      <li v-for="item in cart" :key="item.id" class="cart-item">
        <!-- First Row: Thumbnail and Delete Icon -->
        <div class="item-details">
          <div class="item-info">
            <img :src="item.image" :alt="item.name" class="cart-item-image">
            <p>{{ item.name }}</p>
          </div>

          <!-- Quantity controls with delete icon -->
          <div class="quantity-controls">
            <input
              v-model.number="item.quantity"
              type="number"
              :min="1"
              class="quantity-input"
              @change="updateQuantity(item)"
            >
            <UIcon
              name="i-heroicons-trash"
              class="icon w-6 h-6 text-primary-600 dark:text-primary-400 sm:text-primary sm:dark:text-primary shrink-0 px-4"
              @click="deleteItem(item)"
            />
          </div>
        </div>

        <!-- Second Row: Subtotal -->
        <div class="item-total">
          <span>{{ item.price * item.quantity }}C</span>
        </div>
      </li>
    </ul>
    <p v-if="cart.length > 0" class="total">Total: {{ totalCredits }}C</p>
    <button v-if="cart.length > 0" class="checkout-button" @click="checkout">Checkout</button>
    <p v-else>Your cart is empty.</p>
  </div>
</template>

<script lang="ts">
import { ref, computed, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { useCreditStore } from '~/stores/credit';
import type { Cart } from '~/models/Item';
import { calculateItemSubTotal } from '~/utils/calculateCreditsUtils';

export default {
  props: {
    cart: {
      type: Array as PropType<Cart>,
      default: () => [] // Default empty cart
    }
  },
  setup(props, { emit }) {
    const router = useRouter();
    const creditStore = useCreditStore();

    // Calculate total credits in cart using computed
    const totalCredits = computed(() => {
      return props.cart.reduce((total, item) => total + calculateItemSubTotal(item), 0);
    });

    // Checkout function
    const checkout = () => {
      if (props.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      if (creditStore.count < totalCredits.value) {
        alert('You do not have enough credits to complete this purchase!');
        return;
      }
      console.log('Buying items:', JSON.stringify(props.cart as Cart));
      router.push({
        name: 'summary',
        query: {
          extraFee: 0,
          discount: 0,
          withdrawalAmt: 0,
          cart: JSON.stringify(props.cart as Cart)
        }
      });

      // const confirmCheckout = confirm(`You are about to purchase items totaling ${totalCredits.value} Credits. Proceed?`);

      // if (confirmCheckout) {
      //   clearCart();
      //   alert("Checkout successful! Your items will be processed.");
      // }
    };

    // Clear the cart (Reset the cart state)
    const clearCart = () => {
      emit('clearCart');
    };

    // Function to update the quantity of an item directly
    const updateQuantity = (item) => {
      if (item.quantity < 1) {
        item.quantity = 1; // Ensure quantity doesn't go below 1
      }
      emit('update-cart', props.cart); // Emit the updated cart to the parent
    };

    // Function to delete an item from the cart
    const deleteItem = (item) => {
      const index = props.cart.findIndex((cartItem) => cartItem.id === item.id);
      if (index !== -1) {
        props.cart.splice(index, 1); // Remove the item from the cart
        emit('update-cart', props.cart); // Emit the updated cart to the parent
      }
    };

    return {
      totalCredits,
      checkout,
      updateQuantity,
      deleteItem
    };
  }
};
</script>

<style scoped>
h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.cart-section {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #ddd; /* Default border */
  border-radius: 8px; /* Apply round corners */
}

.cart-item {
  margin-bottom: 10px; /* Spacing between cart items */
}

.item-details {
  display: flex; /* Align thumbnail, quantity, and delete icon in a row */
  justify-content: space-between; /* Space out the elements */
  align-items: center; /* Vertically center the items */
}

.item-info {
  display: flex;
  align-items: center;
}

.cart-item-image {
  max-width: 30px;
  height: auto;
  margin-right: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 10px;
}

.quantity-input {
  width: 50px;
  padding: 5px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.item-total {
  font-size: 14px;
  font-weight: bold;
  text-align: right; /* Align the total to the right */
  margin-top: 5px; /* Add some space above the total */
  margin-right: 10px;
}

.checkout-button {
  font-size: 12px;
  background-color: #3a80d2;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.checkout-button:hover {
  background-color: #317bb5;
}
.total {
  font-size: 24px;
  text-align: right;
  margin-right: 10px;
}
</style>
