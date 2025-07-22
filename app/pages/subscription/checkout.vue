<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Premium Plan Checkout</h1>
          <p class="text-gray-600">Complete your subscription to unlock unlimited learning</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Premium Plan</span>
                <span class="font-semibold text-gray-900">SGD 29.00</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Billing Cycle</span>
                <span class="text-gray-900">Monthly</span>
              </div>
              <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-gray-900">Total</span>
                  <span class="text-lg font-bold text-primary-600">SGD 29.00/month</span>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-primary-50 rounded-lg">
              <h3 class="font-semibold text-primary-900 mb-2">What's included:</h3>
              <ul class="text-sm text-primary-800 space-y-1">
                <li>• Unlimited AI queries</li>
                <li>• Advanced study tools</li>
                <li>• Unlimited practice questions</li>
                <li>• Priority support</li>
                <li>• Detailed progress tracking</li>
                <li>• Offline access</li>
              </ul>
            </div>
          </div>

          <!-- Payment Form -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>

            <form class="space-y-4" @submit.prevent="handleSubmit">
              <!-- Payment Method -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="card"
                      class="mr-3"
                    >
                    <span class="text-gray-700">Credit Card</span>
                  </label>
                  <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      v-model="paymentMethod"
                      type="radio"
                      value="stripe"
                      class="mr-3"
                    >
                    <span class="text-gray-700">Stripe</span>
                  </label>
                </div>
              </div>

              <!-- Card Details -->
              <div v-if="paymentMethod === 'card'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    v-model="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    :disabled="isLoading"
                  >
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      v-model="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      v-model="cvv"
                      type="text"
                      placeholder="123"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                </div>
              </div>

              <!-- Stripe Integration -->
              <div v-if="paymentMethod === 'stripe'" class="p-4 bg-gray-50 rounded-lg">
                <p class="text-gray-600 text-sm mb-2">
                  Stripe payment integration will be implemented here
                </p>
                <div class="h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                  <span class="text-gray-500">Stripe Payment Element</span>
                </div>
              </div>

              <!-- Billing Address -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Billing Address</h3>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      v-model="billingAddress.firstName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      v-model="billingAddress.lastName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    v-model="billingAddress.address"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    :disabled="isLoading"
                  >
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      v-model="billingAddress.city"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      v-model="billingAddress.postalCode"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      :disabled="isLoading"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    v-model="billingAddress.country"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    :disabled="isLoading"
                  >
                    <option value="">Select Country</option>
                    <option value="SG">Singapore</option>
                    <option value="MY">Malaysia</option>
                    <option value="TH">Thailand</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isLoading || !isFormValid"
              >
                <span v-if="isLoading" class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                <span v-else>Complete Subscription</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '#imports';

const router = useRouter();
const toast = useToast();
const { handleCheckout } = useStripe();

// Form state
const isLoading = ref(false);
const paymentMethod = ref('card');
const cardNumber = ref('');
const expiryDate = ref('');
const cvv = ref('');

const billingAddress = ref({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  country: ''
});

// Form validation
const isFormValid = computed(() => {
  const addressValid = billingAddress.value.firstName &&
    billingAddress.value.lastName &&
    billingAddress.value.address &&
    billingAddress.value.city &&
    billingAddress.value.postalCode &&
    billingAddress.value.country;

  if (paymentMethod.value === 'card') {
    return cardNumber.value && expiryDate.value && cvv.value && addressValid;
  }

  return addressValid;
});

// Handle form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  try {
    // Use Stripe composable to handle checkout for monthly premium plan
    await handleCheckout('premium_monthly');
    
  } catch (error) {
    console.error('Checkout error:', error);
    toast.add({
      title: 'Payment Failed',
      description: error.data?.message || error.message || 'There was an error processing your payment. Please try again.',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
