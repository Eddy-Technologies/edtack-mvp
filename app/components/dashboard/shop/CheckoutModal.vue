<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Checkout</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Order Summary -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div class="space-y-3">
            <div
              v-for="item in cart"
              :key="item.id"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <img :src="item.image" :alt="item.name" class="w-12 h-12 object-cover rounded">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                <p class="text-sm text-gray-600">{{ item.price }}C × {{ item.quantity }}</p>
              </div>
              <span class="font-semibold text-gray-900">{{ item.price * item.quantity }}C</span>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-4 pt-4 border-t">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-gray-900">Total:</span>
              <span class="text-2xl font-bold text-blue-600">{{ total }}C</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">≈ ${{ (total * 0.1).toFixed(2) }} USD</p>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div class="space-y-3">
            <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                v-model="paymentMethod"
                type="radio"
                value="credits"
                class="mr-3 text-blue-600"
              >
              <div class="flex-1">
                <span class="font-medium text-gray-900">Use Credits</span>
                <p class="text-sm text-gray-600">Pay with your available credits ({{ availableCredits }}C available)</p>
              </div>
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </label>

            <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                v-model="paymentMethod"
                type="radio"
                value="stripe"
                class="mr-3 text-blue-600"
              >
              <div class="flex-1">
                <span class="font-medium text-gray-900">Credit/Debit Card</span>
                <p class="text-sm text-gray-600">Pay securely with Stripe</p>
              </div>
              <div class="flex space-x-2">
                <svg class="w-8 h-5" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="1"
                    y="4"
                    width="22"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path d="M1 10h22" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
            </label>
          </div>
        </div>

        <!-- Stripe Payment Form -->
        <div v-if="paymentMethod === 'stripe'" class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>
          <div class="space-y-4">
            <!-- Card Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input
                v-model="cardDetails.number"
                type="text"
                placeholder="1234 5678 9012 3456"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="formatCardNumber"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Expiry Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  v-model="cardDetails.expiry"
                  type="text"
                  placeholder="MM/YY"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @input="formatExpiry"
                >
              </div>

              <!-- CVC -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                <input
                  v-model="cardDetails.cvc"
                  type="text"
                  placeholder="123"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxlength="4"
                >
              </div>
            </div>

            <!-- Cardholder Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
              <input
                v-model="cardDetails.name"
                type="text"
                placeholder="John Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Billing Address -->
        <div v-if="paymentMethod === 'stripe'" class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  v-model="billingAddress.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  v-model="billingAddress.lastName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <input
                v-model="billingAddress.address1"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
              <input
                v-model="billingAddress.address2"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  v-model="billingAddress.city"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  v-model="billingAddress.state"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  v-model="billingAddress.zipCode"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            :disabled="isProcessing || !canProceed"
            :class="[
              'flex-1 px-6 py-3 rounded-lg font-medium transition-colors',
              isProcessing || !canProceed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
            @click="processPayment"
          >
            <span v-if="isProcessing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
            <span v-else>
              Complete Order ({{ total }}C)
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const props = defineProps<{
  isOpen: boolean;
  cart: CartItem[];
}>();

const emit = defineEmits<{
  (e: 'close' | 'payment-success'): void;
}>();

// Payment state
const paymentMethod = ref('credits');
const isProcessing = ref(false);
const errorMessage = ref('');
const availableCredits = ref(250); // This would come from user store/API

// Card details
const cardDetails = ref({
  number: '',
  expiry: '',
  cvc: '',
  name: ''
});

// Billing address
const billingAddress = ref({
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zipCode: ''
});

// Computed properties
const total = computed(() => {
  return props.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const canProceed = computed(() => {
  if (paymentMethod.value === 'credits') {
    return total.value <= availableCredits.value;
  } else if (paymentMethod.value === 'stripe') {
    return cardDetails.value.number &&
      cardDetails.value.expiry &&
      cardDetails.value.cvc &&
      cardDetails.value.name &&
      billingAddress.value.firstName &&
      billingAddress.value.lastName &&
      billingAddress.value.address1 &&
      billingAddress.value.city &&
      billingAddress.value.state &&
      billingAddress.value.zipCode;
  }
  return false;
});

// Methods
const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  paymentMethod.value = 'credits';
  cardDetails.value = {
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  };
  billingAddress.value = {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  };
  errorMessage.value = '';
};

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  if (formattedValue.length <= 19) {
    cardDetails.value.number = formattedValue;
  }
};

const formatExpiry = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  cardDetails.value.expiry = value;
};

const processPayment = async () => {
  if (!canProceed.value) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    if (paymentMethod.value === 'credits') {
      await processCreditsPayment();
    } else if (paymentMethod.value === 'stripe') {
      await processStripePayment();
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Payment failed. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};

const processCreditsPayment = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (total.value > availableCredits.value) {
    throw new Error('Insufficient credits');
  }

  // Success - update credits and complete purchase
  availableCredits.value -= total.value;
  emit('payment-success');
  closeModal();
};

const processStripePayment = async () => {
  // Simulate Stripe API call
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // In a real implementation, you would:
  // 1. Create a payment intent with Stripe
  // 2. Confirm the payment
  // 3. Handle the response

  // For demo purposes, we'll simulate success
  const success = Math.random() > 0.2; // 80% success rate for demo

  if (!success) {
    throw new Error('Card declined. Please check your card details and try again.');
  }

  // Success
  emit('payment-success');
  closeModal();
};
</script>
