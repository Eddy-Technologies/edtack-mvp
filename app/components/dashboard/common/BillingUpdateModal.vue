<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Update Payment & Billing Information</h2>
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
        <form @submit.prevent="updatePaymentMethod">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column - Payment Information -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
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

            <!-- Right Column - Billing Address -->
            <div class="space-y-6 bg-gray-100 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
              <!-- Street Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  v-model="billingAddress.street"
                  type="text"
                  placeholder="123 Main Street"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- City -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    v-model="billingAddress.city"
                    type="text"
                    placeholder="New York"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>

                <!-- State -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    v-model="billingAddress.state"
                    type="text"
                    placeholder="NY"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- ZIP Code -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    v-model="billingAddress.zipCode"
                    type="text"
                    placeholder="10001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>

                <!-- Country -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    v-model="billingAddress.country"
                    type="text"
                    placeholder="United States"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Re-authentication Section -->
          <div class="border-t pt-8 mt-8 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Your Identity</h3>
            <div class="max-w-md">
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter Your Password</label>
              <input
                v-model="authPassword"
                type="password"
                placeholder="Enter your account password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <p class="text-xs text-gray-500 mt-1">We need to verify your identity before updating payment information</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 mt-8 mb-4">
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isProcessing || !isFormValid"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                isProcessing || !isFormValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              <span v-if="isProcessing" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
              <span v-else>Update Payment & Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  isOpen: boolean;
  currentAddress?: any;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'payment-updated', data: { card: any; address: any }): void;
}>();

const cardDetails = ref({
  number: '',
  expiry: '',
  cvc: '',
  name: ''
});

const billingAddress = ref({
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: ''
});

const authPassword = ref('');

const isProcessing = ref(false);
const errorMessage = ref('');

const isFormValid = computed(() => {
  return cardDetails.value.number &&
    cardDetails.value.expiry &&
    cardDetails.value.cvc &&
    cardDetails.value.name &&
    billingAddress.value.street &&
    billingAddress.value.city &&
    billingAddress.value.state &&
    billingAddress.value.zipCode &&
    billingAddress.value.country &&
    authPassword.value;
});

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  cardDetails.value = {
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  };
  billingAddress.value = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };
  authPassword.value = '';
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

const updatePaymentMethod = async () => {
  if (!isFormValid.value) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In real implementation, this would:
    // 1. Authenticate the user with their password
    // 2. Update payment method with card details
    // 3. Update billing address
    // const authResponse = await authenticateUser(authPassword.value);
    // const paymentResponse = await updatePaymentMethodAPI(cardDetails.value);
    // const addressResponse = await updateBillingAddressAPI(billingAddress.value);

    emit('payment-updated', {
      card: cardDetails.value,
      address: billingAddress.value
    });
    closeModal();
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update payment method. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};
</script>
