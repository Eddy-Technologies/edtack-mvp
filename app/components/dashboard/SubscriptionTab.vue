<template>
  <div class="space-y-6">
    <!-- Current Plan -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">My Subscription</h2>
          <Button
            variant="primary"
            text="View Plans"
            @click="showSubscriptionModal = true"
          />
        </div>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ currentPlan?.name || 'Loading...' }}</h3>
              <p class="text-gray-600">{{ currentPlan?.description || 'Loading subscription details...' }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    currentPlan?.isPremium ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ currentPlan?.status || 'Loading...' }}
                </span>
                <span v-if="currentPlan?.isTrialing" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Trial
                </span>
                <span v-if="currentPlan?.nextBilling !== 'N/A'" class="text-sm text-gray-500">Next billing: {{ currentPlan?.nextBilling }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">SGD {{ currentPlan?.price || '0' }}</div>
            <div class="text-sm text-gray-500">per {{ currentPlan?.interval || 'month' }}</div>
            <Button
              v-if="currentPlan?.isPremium"
              variant="secondary"
              text="Manage Billing"
              @click="manageBilling"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Section -->
    <div v-if="currentPlan && !currentPlan.isPremium" class="bg-primary-50 rounded-xl border p-6">
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
        <p class="text-gray-600 mb-4">Get unlimited access to all our learning tools and AI assistance</p>
        <Button
          variant="primary"
          text="Upgrade to Premium - SGD 29/month"
          @click="upgradeAccount"
        />
      </div>
    </div>

    <!-- Payment Method (only show if premium plan) -->
    <div v-if="currentPlan && currentPlan.isPremium" class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Payment Method</h3>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
              <span class="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p class="font-medium text-gray-900">•••• •••• •••• {{ paymentMethod.lastFour }}</p>
              <p class="text-sm text-gray-600">Expires {{ paymentMethod.expiry }}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            text="Update"
            @click="manageBilling"
          />
        </div>
      </div>
    </div>

    <!-- Billing History -->
    <div v-if="currentPlan && currentPlan.isPremium" class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Billing History</h3>
          <Button
            variant="secondary"
            text="View Full History"
            @click="manageBilling"
          />
        </div>
      </div>
      <div class="p-6">
        <p class="text-gray-600">
          View your complete billing history, download invoices, and manage payment methods through our secure customer portal.
        </p>
        <div class="mt-4">
          <Button
            variant="primary"
            text="Open Billing Portal"
            @click="manageBilling"
          />
        </div>
      </div>
    </div>

    <!-- Subscription Modal -->
    <SubscriptionModal
      v-if="showSubscriptionModal"
      :is-visible="showSubscriptionModal"
      @close="showSubscriptionModal = false"
    />

    <!-- Billing Update Modal -->
    <BillingUpdateModal
      :is-open="showBillingModal"
      @close="showBillingModal = false"
      @payment-updated="handlePaymentUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../common/Button.vue';
import SubscriptionModal from '../subscription/SubscriptionModal.vue';
import BillingUpdateModal from './common/BillingUpdateModal.vue';

const { subscriptionStatus, fetchSubscriptionStatus, handleCustomerPortal, isLoading, isPremium } = useSubscription();

// Modal states
const showSubscriptionModal = ref(false);
const showBillingModal = ref(false);

const currentPlan = computed(() => {
  if (!subscriptionStatus.value) return null;

  const plan = subscriptionStatus.value.currentPlan;
  const subscription = subscriptionStatus.value.subscription;

  return {
    name: plan.display_name,
    description: plan.description || 'Basic features to get started',
    price: plan.price_sgd,
    nextBilling: subscription?.currentPeriodEnd ?
        new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) :
      'N/A',
    status: subscription?.status ?
      subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) :
      'Free',
    features: plan.features || [],
    isPremium: subscriptionStatus.value.isPremium,
    isTrialing: subscriptionStatus.value.isTrialing,
    interval: plan.interval_type
  };
});

onMounted(() => {
  fetchSubscriptionStatus();
});

const paymentMethod = ref({
  lastFour: '••••',
  expiry: 'MM/YY'
});

// Methods
const upgradeAccount = () => {
  showSubscriptionModal.value = true;
};

const manageBilling = async () => {
  try {
    // Use Stripe composable with fallback to billing modal
    await handleCustomerPortal(() => {
      showBillingModal.value = true;
    });
  } catch (error: any) {
    console.error('Failed to open billing portal:', error);
    // Fallback is already handled by handleCustomerPortal
  }
};

const handlePaymentUpdated = (data: { card: any; address: any }) => {
  // Refresh subscription status after payment update
  fetchSubscriptionStatus();
  console.log('Updated billing info:', data);
};
</script>
