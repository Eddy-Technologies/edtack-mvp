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
            <div class="mt-2 space-x-2">
              <Button
                v-if="currentPlan?.isPremium"
                variant="secondary"
                text="Manage Billing"
                @click="manageBilling"
              />
              <Button
                v-if="currentPlan?.isPremium && currentPlan?.planType === 'premium_monthly'"
                variant="secondary"
                text="Upgrade to Yearly"
                @click="showUpgradeModal = true"
              />
              <Button
                v-if="currentPlan?.isPremium"
                variant="secondary-danger"
                text="Cancel Plan"
                @click="showCancelSubscription"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Section -->
    <div v-if="currentPlan && !currentPlan.isPremium" class="bg-orange-100 rounded-xl border-2 border-orange-200 p-6">
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
        <p class="text-gray-600 mb-4">Get unlimited access to all our learning tools and AI assistance</p>
        <div class="space-x-4">
          <Button
            variant="primary"
            text="Upgrade Now!"
            @click="upgradeAccount"
          />
        </div>
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

    <!-- Cancel Subscription Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showCancelModal = false"
        />

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  class="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Cancel Subscription
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                  </p>
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Why are you canceling? (Optional)
                    </label>
                    <select
                      v-model="cancellationReason"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a reason...</option>
                      <option v-for="reason in cancellationReasons" :key="reason" :value="reason">
                        {{ reason }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="secondary-danger"
              text="Cancel Subscription"
              :loading="stripeLoading"
              class="w-full sm:w-auto sm:ml-3"
              @click="handleCancelSubscription"
            />
            <Button
              variant="secondary"
              text="Keep Subscription"
              class="mt-3 w-full sm:mt-0 sm:w-auto"
              @click="showCancelModal = false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade to Yearly Modal -->
    <div v-if="showUpgradeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showUpgradeModal = false"
        />

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Upgrade to Yearly Plan
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Save 17% by switching to our yearly plan. You'll be charged SGD 290 now and your next billing date will be extended by 12 months.
                  </p>
                  <div class="mt-4 p-4 bg-green-50 rounded-lg">
                    <div class="flex">
                      <div class="text-sm">
                        <p class="font-medium text-green-800">Savings: SGD 58/year</p>
                        <p class="text-green-600">Monthly equivalent: SGD 24.17/month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="primary"
              text="Upgrade to Yearly"
              :loading="stripeLoading"
              class="w-full sm:w-auto sm:ml-3"
              @click="handleUpgradeToYearly"
            />
            <Button
              variant="secondary"
              text="Stay Monthly"
              class="mt-3 w-full sm:mt-0 sm:w-auto"
              @click="showUpgradeModal = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../common/Button.vue';
import SubscriptionModal from '../subscription/SubscriptionModal.vue';
import BillingUpdateModal from './common/BillingUpdateModal.vue';

const { subscriptionStatus, fetchSubscriptionStatus, handleCustomerPortal, isLoading, isPremium } = useSubscription();
const { cancelSubscription, upgradeSubscription, isLoading: stripeLoading } = useStripe();

// Modal states
const showSubscriptionModal = ref(false);
const showBillingModal = ref(false);
const showCancelModal = ref(false);
const showUpgradeModal = ref(false);

// Cancellation form
const cancellationReason = ref('');
const cancellationReasons = [
  'Too expensive',
  'Not using enough',
  'Missing features',
  'Technical issues',
  'Switching to competitor',
  'Other'
];

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
    interval: plan.interval_type,
    planType: plan.plan_type
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
  if (currentPlan.value?.planType === 'premium_monthly') {
    // Show upgrade to yearly modal
    showUpgradeModal.value = true;
  } else {
    // Show general subscription modal
    showSubscriptionModal.value = true;
  }
};

const handleUpgradeToYearly = async () => {
  try {
    const response = await upgradeSubscription('premium_yearly');
    if (response.success) {
      showUpgradeModal.value = false;
      await fetchSubscriptionStatus();
      // Show success message
    }
  } catch (error: any) {
    console.error('Failed to upgrade subscription:', error);
    // Show error message
  }
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

const showCancelSubscription = () => {
  showCancelModal.value = true;
};

const handleCancelSubscription = async () => {
  try {
    const response = await cancelSubscription(cancellationReason.value);
    if (response.success) {
      showCancelModal.value = false;
      await fetchSubscriptionStatus();
      // Show success message
    }
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    // Show error message
  }
};

const handlePaymentUpdated = (data: { card: any; address: any }) => {
  // Refresh subscription status after payment update
  fetchSubscriptionStatus();
  console.log('Updated billing info:', data);
};
</script>
