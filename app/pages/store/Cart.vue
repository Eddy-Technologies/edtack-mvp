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
import { computed } from 'vue';
import type { PropType } from 'vue';
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
  emits: ['update-cart'],
  setup(props: { cart: Cart }, { emit }: { emit: (event: string, ...args: unknown[]) => void }) {
    const router = useRouter();
    const creditStore = useCreditStore();

    // Calculate total credits in cart using computed
    const totalCredits = computed(() => {
      return props.cart.reduce((total: number, item: Cart[number]) => total + calculateItemSubTotal(item), 0);
    });

    // Checkout function
    const checkout = () => {
      if (!props.cart || props.cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      if (!creditStore.childCredits || creditStore.childCredits.length === 0 || (creditStore.childCredits?.[0] ?? 0) < totalCredits.value) {
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
    };

    // Function to update the quantity of an item directly
    const updateQuantity = (item: Cart[number]) => {
      if (item.quantity < 1) {
        item.quantity = 1; // Ensure quantity doesn't go below 1
      }
      // Emit a new array to avoid mutating the prop directly
      emit('update-cart', props.cart.map((cartItem: Cart[number]) =>
        cartItem.id === item.id ? { ...cartItem, quantity: item.quantity } : cartItem
      ));
    };

    // Function to delete an item from the cart
    const deleteItem = (item: Cart[number]) => {
      // Emit a new array with the item removed
      emit('update-cart', props.cart.filter((cartItem: Cart[number]) => cartItem.id !== item.id));
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
