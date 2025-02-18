<template>
  <div class="cart-section">
    <h3>Your Cart</h3>
    <ul>
      <li v-for="item in cart" :key="item.id" class="cart-item">
        <div class="item-details">
          <img :src="item.image" :alt="item.name" class="cart-item-image">
          <p>{{ item.name }}</p>
        </div>

        <!-- Quantity controls with buttons aligned to the right -->
        <div class="quantity-controls">
          <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
          <span>{{ item.quantity }}</span> <!-- Display the current quantity -->
          <button @click="increaseQuantity(item)">+</button>
        </div>

        <!-- Item total price -->
        <div class="item-total">
          <span>{{ item.price * item.quantity }}</span>
        </div>

        <UIcon
            @click="deleteItem(item)"
            name="i-heroicons-trash"
            class="icon w-6 h-6 text-primary-600 dark:text-primary-400 sm:text-primary sm:dark:text-primary shrink-0 px-4"
        />
      </li>
    </ul>
    <p v-if="cart.length > 0">Total: {{ totalCredits }} C</p> <!-- Displaying total credits -->
    <button v-if="cart.length > 0" class="checkout-button" @click="checkout">Proceed to Checkout</button>
    <p v-else>Your cart is empty.</p>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useCreditStore } from "~/stores/credit";

export default {
  props: {
    cart: {
      type: Array,
      default: () => [] // Provide a default empty array for the cart
    }
  },
  setup(props, { emit }) {
    const creditStore = useCreditStore();

    // Calculate total credits in cart using computed
    const totalCredits = computed(() => {
      return props.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    });

    // Checkout function
    const checkout = () => {
      if (props.cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      if (creditStore.count < totalCredits.value) {
        alert("You do not have enough credits to complete this purchase!");
        return;
      }

      const confirmCheckout = confirm(`You are about to purchase items totaling ${totalCredits.value} Credits. Proceed?`);

      if (confirmCheckout) {
        clearCart();
        alert("Checkout successful! Your items will be processed.");
      }
    };

    // Clear the cart (Reset the cart state)
    const clearCart = () => {
      emit('clearCart');
    };

    // Function to increase the quantity of an item
    const increaseQuantity = (item) => {
      item.quantity++;
      emit('update-cart', props.cart); // Emit the updated cart to the parent
    };

    // Function to decrease the quantity of an item
    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity--;
        emit('update-cart', props.cart); // Emit the updated cart to the parent
      }
    };

    // Function to delete an item from the cart
    const deleteItem = (item) => {
      const index = props.cart.findIndex(cartItem => cartItem.id === item.id);
      if (index !== -1) {
        props.cart.splice(index, 1); // Remove the item from the cart
        emit('update-cart', props.cart); // Emit the updated cart to the parent
      }
    };

    return {
      totalCredits,
      checkout,
      increaseQuantity,
      decreaseQuantity,
      deleteItem
    };
  }
};
</script>

<style scoped>
.cart-section {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: white;
  width: 100%;
  max-width: 400px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-details {
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
  justify-content: flex-end;
  margin-left: auto;
}

.quantity-controls button {
  padding: 5px 10px;
  margin: 0 5px;
  font-size: 14px;
  cursor: pointer;
}

.quantity-controls span {
  font-size: 16px;
  font-weight: bold;
}

.item-total {
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
}

.delete-button {
  background-color: red;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.delete-button:hover {
  background-color: darkred;
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
</style>
