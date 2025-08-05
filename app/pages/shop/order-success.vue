<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Processing your payment...</h2>
        <p class="text-gray-600">Please wait while we confirm your transaction.</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-red-500 mb-4">
          <UIcon name="i-lucide-alert-circle" size="64" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Payment Error</h2>
        <p class="text-red-600 mb-6">{{ error }}</p>
        <Button
          variant="primary"
          text="Return to Dashboard"
          icon="i-lucide-arrow-left"
          @clicked="goToDashboard"
        />
      </div>

      <!-- Success State -->
      <div v-else-if="successData" class="text-center">
        <!-- Success Icon -->
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-green-500 mb-4">
          <UIcon name="i-lucide-check-circle" size="64" />
        </div>

        <!-- Success Message -->
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ getSuccessTitle() }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{ getSuccessMessage() }}
        </p>

        <!-- Transaction Details -->
        <div v-if="successData.details" class="bg-white rounded-lg border p-6 mb-6 text-left">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>

          <!-- Order Details -->
          <div v-if="successData.type === 'purchase'" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Order Number:</span>
              <span class="font-medium text-gray-900">{{ successData.details.orderNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Items:</span>
              <span class="font-medium text-gray-900">{{ successData.details.totalItems }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Amount:</span>
              <span class="font-medium text-gray-900">S${{ (successData.details.amount / 100).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Payment Method:</span>
              <span class="font-medium text-gray-900">{{ successData.details.paymentMethod }}</span>
            </div>
          </div>

          <!-- Credit Top-up Details -->
          <div v-else-if="successData.type === 'credit_topup'" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Credits Added:</span>
              <span class="font-medium text-green-600">{{ successData.details.amount }} credits</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Amount Paid:</span>
              <span class="font-medium text-gray-900">S${{ (successData.details.amount / 100).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Subscription Details -->
          <div v-else-if="successData.type === 'subscription'" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Plan:</span>
              <span class="font-medium text-gray-900">{{ successData.details.planName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium text-green-600">Active</span>
            </div>
          </div>

          <!-- Transaction ID -->
          <div v-if="successData.details.sessionId" class="pt-3 border-t">
            <div class="flex justify-between">
              <span class="text-gray-600">Transaction ID:</span>
              <span class="font-mono text-sm text-gray-900">{{ successData.details.sessionId }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button
            variant="primary"
            :text="getPrimaryActionText()"
            :icon="getPrimaryActionIcon()"
            extra-classes="w-full"
            @clicked="handlePrimaryAction"
          />

          <Button
            variant="secondary"
            text="Return to Dashboard"
            icon="i-lucide-home"
            extra-classes="w-full"
            @clicked="goToDashboard"
          />
        </div>
      </div>

      <!-- Default State (no session_id) -->
      <div v-else class="text-center">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-blue-500 mb-4">
          <UIcon name="i-lucide-info" size="64" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome Back!</h2>
        <p class="text-gray-600 mb-6">Thank you for your purchase. Your transaction has been completed successfully.</p>
        <Button
          variant="primary"
          text="Go to Dashboard"
          icon="i-lucide-arrow-right"
          @clicked="goToDashboard"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '~/components/common/Button.vue';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref<string | null>(null);
const successData = ref<any>(null);

// Fetch success data
const fetchSuccessData = async () => {
  try {
    const sessionId = route.query.session_id as string;

    if (sessionId) {
      // Fetch checkout session details
      const response = await $fetch('/api/shop/success', {
        method: 'GET',
        query: { session_id: sessionId }
      });

      successData.value = response;

      // Clear cart if this was a purchase
      if (response.type === 'purchase') {
        clearCart();
      }
    } else {
      // Handle subscription returns or direct visits
      successData.value = {
        type: 'subscription',
        details: null
      };
    }
  } catch (err: any) {
    console.error('Failed to fetch success data:', err);
    error.value = err.data?.message || err.message || 'Failed to load transaction details.';
  } finally {
    loading.value = false;
  }
};

// Clear cart from localStorage
const clearCart = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shopping-cart');
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

// Helper functions
const getSuccessTitle = () => {
  switch (successData.value?.type) {
    case 'purchase':
      return 'Order Confirmed!';
    case 'credit_topup':
      return 'Credits Added!';
    case 'subscription':
      return 'Subscription Active!';
    default:
      return 'Payment Successful!';
  }
};

const getSuccessMessage = () => {
  switch (successData.value?.type) {
    case 'purchase':
      return 'Your order has been confirmed and will be processed shortly. You will receive an email confirmation soon.';
    case 'credit_topup':
      return 'Your credits have been successfully added to your account and are ready to use.';
    case 'subscription':
      return 'Your subscription is now active and you can start enjoying all the benefits immediately.';
    default:
      return 'Your payment has been processed successfully.';
  }
};

const getPrimaryActionText = () => {
  switch (successData.value?.type) {
    case 'purchase':
      return 'View Orders';
    case 'credit_topup':
      return 'View Credits';
    case 'subscription':
      return 'Go to Dashboard';
    default:
      return 'Continue';
  }
};

const getPrimaryActionIcon = () => {
  switch (successData.value?.type) {
    case 'purchase':
      return 'i-lucide-package';
    case 'credit_topup':
      return 'i-lucide-coins';
    case 'subscription':
      return 'i-lucide-crown';
    default:
      return 'i-lucide-arrow-right';
  }
};

const handlePrimaryAction = () => {
  switch (successData.value?.type) {
    case 'purchase':
      router.push('/dashboard?tab=orders');
      break;
    case 'credit_topup':
      router.push('/dashboard?tab=credits');
      break;
    case 'subscription':
      router.push('/dashboard?tab=subscription');
      break;
    default:
      goToDashboard();
  }
};

const goToDashboard = () => {
  router.push('/dashboard');
};

// Initialize
onMounted(() => {
  fetchSuccessData();
});
</script>
