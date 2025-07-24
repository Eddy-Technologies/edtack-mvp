<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Processing your payment...</h2>
        <p class="text-gray-600">Please wait while we confirm your subscription.</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="sessionStatus === 'complete'" class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <!-- Success Header -->
        <div class="text-center mb-12">
          <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <svg
              class="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to your subscription!</h1>
          <p class="text-xl text-gray-600 mb-2">Your payment was successful.</p>
          <p v-if="customerEmail" class="text-gray-600">
            A confirmation email has been sent to <strong>{{ customerEmail }}</strong>
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <!-- Plan Details Card -->
          <div v-if="planDetails" class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
              <h2 class="text-2xl font-bold text-white">Your Plan</h2>
            </div>
            <div class="p-6">
              <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ planDetails.name }}</h3>
                <p v-if="planDetails.description" class="text-gray-600 mb-4">{{ planDetails.description }}</p>
                <div class="flex items-baseline space-x-2">
                  <span class="text-3xl font-bold text-gray-900">{{ planDetails.currency }} {{ planDetails.price }}</span>
                  <span class="text-gray-500">per {{ planDetails.interval }}</span>
                </div>
              </div>

              <!-- Features List -->
              <div v-if="planDetails.features && planDetails.features.length > 0">
                <h4 class="text-lg font-semibold text-gray-900 mb-3">What's included:</h4>
                <ul class="space-y-2">
                  <li v-for="feature in planDetails.features" :key="feature" class="flex items-start space-x-3">
                    <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-gray-700">{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Purchase Summary Card -->
          <div v-if="invoiceDetails" class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4">
              <h2 class="text-2xl font-bold text-white">Purchase Summary</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-gray-600">Plan</span>
                  <span class="font-semibold text-gray-900">{{ planDetails?.name || 'Subscription' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-gray-600">Amount</span>
                  <span class="font-semibold text-gray-900">{{ invoiceDetails.currency }} {{ invoiceDetails.amount_total }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-gray-600">Payment Method</span>
                  <span class="font-semibold text-gray-900 capitalize">{{ invoiceDetails.payment_method_types?.[0] || 'Card' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-gray-600">Status</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ invoiceDetails.payment_status }}
                  </span>
                </div>
                <div class="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4 mt-4">
                  <span class="text-lg font-semibold text-gray-900">Total Paid</span>
                  <span class="text-2xl font-bold text-gray-900">{{ invoiceDetails.currency }} {{ invoiceDetails.amount_total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- What's Next Section -->
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">What's next?</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-lg font-bold">1</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">Subscription Active</h3>
              <p class="text-gray-600 text-sm">Your subscription is now active and billing will begin according to your plan.</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-lg font-bold">2</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">Manage Anytime</h3>
              <p class="text-gray-600 text-sm">Update payment methods, view invoices, or cancel anytime in your account settings.</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-lg font-bold">3</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">Start Exploring</h3>
              <p class="text-gray-600 text-sm">Access all the premium features included in your plan!</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/dashboard"
            class="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center"
          >
            Go to Dashboard
          </NuxtLink>
          <button
            class="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            @click="redirectToCustomerPortal"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>

    <!-- Failed/Open State - Show retry checkout -->
    <div v-else-if="sessionStatus === 'open'" class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <div class="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg
              class="w-12 h-12 text-red-600"
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
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Payment incomplete</h1>
          <p class="text-lg text-gray-600 mb-8">Your payment was not successful. Please try again below.</p>
        </div>

        <!-- Retry Checkout Form -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Try again</h2>
            <p class="text-gray-600 mt-1">Complete your subscription payment</p>
          </div>

          <div id="retry-checkout" class="min-h-[400px]">
            <!-- Retry checkout form will mount here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto px-4">
        <div class="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg
            class="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p class="text-gray-600 mb-6">We couldn't process your subscription. Please try again or contact support.</p>
        <NuxtLink
          to="/subscription"
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Back to Plans
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { getSessionStatus, handleCustomerPortal } = useSubscription();
const { stripePromise } = useStripe();

const loading = ref(true);
const sessionStatus = ref<'complete' | 'open' | 'expired' | null>(null);
const customerEmail = ref<string | null>(null);
const planDetails = ref<any>(null);
const invoiceDetails = ref<any>(null);

const checkSessionStatus = async () => {
  try {
    loading.value = true;

    const sessionId = route.query.session_id as string;
    if (!sessionId) {
      throw new Error('Missing session ID');
    }

    const session = await getSessionStatus(sessionId);
    sessionStatus.value = session.status;
    customerEmail.value = session.customer_email;
    planDetails.value = session.plan;
    invoiceDetails.value = session.invoice;

    // If payment failed, mount retry checkout
    if (session.status === 'open' && session.client_secret) {
      await mountRetryCheckout(session.client_secret);
    }
  } catch (error: any) {
    console.error('Failed to check session status:', error);
    sessionStatus.value = null;
  } finally {
    loading.value = false;
  }
};

const mountRetryCheckout = async (clientSecret: string) => {
  try {
    const stripe = await stripePromise();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
    checkout.mount('#retry-checkout');
  } catch (error) {
    console.error('Failed to mount retry checkout:', error);
  }
};

const redirectToCustomerPortal = async () => {
  try {
    await handleCustomerPortal();
  } catch (error) {
    console.error('Failed to redirect to customer portal:', error);
  }
};

onMounted(() => {
  checkSessionStatus();
});
</script>
