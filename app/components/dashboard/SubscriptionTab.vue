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
            :loading="loading"
            :disabled="loading"
            @click="showSubscriptionModal = true"
          />
        </div>
      </div>
      <div class="p-6">
        <!-- Loading State -->
        <div v-if="loading && !subscription" class="animate-pulse">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gray-200 rounded-xl" />
              <div>
                <div class="h-6 bg-gray-200 rounded w-32 mb-2" />
                <div class="h-4 bg-gray-200 rounded w-48 mb-2" />
                <div class="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div class="text-right">
              <div class="h-8 bg-gray-200 rounded w-20 mb-2" />
              <div class="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>

        <!-- No Customer State -->
        <div v-else-if="stripeCustomerState === STRIPE_CUSTOMER.NOT_EXISTENT" class="text-center py-8">
          <div class="flex items-center justify-center mb-4">
            <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <AppIcon class="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Subscription</h3>
          <p class="text-gray-600 mb-4">You don't have a subscription yet. Get started with one of our plans!</p>
          <Button
            variant="primary"
            text="Subscribe Now"
            :loading="loading"
            :disabled="loading"
            @click="showSubscriptionModal = true"
          />
        </div>

        <!-- Customer Has No Active Subscription -->
        <div v-else-if="stripeCustomerState === STRIPE_CUSTOMER.NO_ACTIVE_SUBSCRIPTION" class="text-center py-8">
          <div class="flex items-center justify-center mb-4">
            <div class="w-16 h-16 rounded-xl flex items-center justify-center">
              <AppIcon class="w-18 h-18" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p class="text-gray-600 mb-4">You currently have no active subscription. Manage your account to reactivate or change your plan.</p>
          <Button
            variant="secondary"
            text="Open Customer Portal"
            :loading="loading"
            :disabled="loading"
            @click="handleOpenCustomerPortal"
          />
        </div>

        <!-- Active Subscription Data -->
        <div v-else-if="stripeCustomerState === STRIPE_CUSTOMER.WITH_ACTIVE_SUBSCRIPTION" class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-xl flex items-center justify-center">
              <AppIcon class="w-12 h-12 text-white" />
            </div>
            <div>
              <span class="flex items-center space-x-2">
                <h3 class="text-xl font-semibold text-gray-900">{{ subscription.productName }}</h3>
                <UBadge
                  :color="subscription.subscriptionStatus === 'active' ? 'primary' :
                    subscription.subscriptionStatus === 'past_due' ? 'red' : 'gray'"
                >
                  {{ subscription.subscriptionStatus }}
                </UBadge>
              </span>
              <p class="text-gray-600">{{ subscription.productDescription || 'Active subscription plan' }}</p>

              <!-- Marketing Features -->
              <div v-if="subscription.marketingFeatures && subscription.marketingFeatures.length > 0" class="mt-2">
                <ul class="text-sm text-gray-600 space-y-1">
                  <li v-for="feature in subscription.marketingFeatures" :key="feature" class="flex items-center">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <div class="flex items-center space-x-2 mt-1" />
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">${{ subscription.amount }}</div>
            <div class="text-sm text-gray-500">per {{ subscription.monthOrYear || 'month' }}</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500">Unable to load subscription information.</p>
          <Button
            variant="secondary"
            text="Retry"
            :loading="loading"
            class="mt-2"
            @click="fetchSubscription"
          />
        </div>
      </div>
    </div>

    <!-- Manage Billing Card (only show for active subscriptions or customers with no active subscription) -->
    <div
      v-if="stripeCustomerState === STRIPE_CUSTOMER.WITH_ACTIVE_SUBSCRIPTION"
      class="bg-white rounded-xl shadow-sm border"
    >
      <div class="p-6">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Billing Management</h3>
            <p class="text-gray-600 mb-4">
              Access your customer portal to manage all aspects of your billing and subscription:
            </p>
            <ul class="text-sm text-gray-600 space-y-2 mb-4">
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                Update payment methods and billing information
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                Upgrade or downgrade your subscription plan
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                View payment history and download invoices
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                Manage subscription settings and preferences
              </li>
            </ul>
            <Button
              variant="secondary"
              text="Open Customer Portal"
              :loading="loading"
              :disabled="loading"
              @click="handleOpenCustomerPortal"
            />
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-3">
          Use the Customer Portal to update payment methods, view invoices, cancel your subscription, and more.
        </p>
      </div>
    </div>

    <!-- Subscription Modal -->
    <SubscriptionModal
      v-if="showSubscriptionModal"
      :is-visible="showSubscriptionModal"
      @close="showSubscriptionModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '../common/Button.vue';
import SubscriptionModal from '../subscription/SubscriptionModal.vue';
import { useStripe } from '#imports';
import { STRIPE_CUSTOMER } from '~~/utils/constants';

const { openCustomerPortal } = useStripe();

const loading = ref(false);
const subscription = ref<any | null>(null);
const stripeCustomerState = ref<string | null>(null);

// Modal states
const showSubscriptionModal = ref(false);

// Stripe API functions
const fetchSubscription = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/stripe/subscription', {
      method: 'GET'
    });
    subscription.value = response;
    stripeCustomerState.value = response.stripeCustomerState;
  } catch (err) {
    console.error('Failed to fetch subscription:', err);
  } finally {
    loading.value = false;
  }
};

const handleOpenCustomerPortal = () => {
  openCustomerPortal(subscription.value.email);
};

onMounted(async () => {
  await fetchSubscription();
});
</script>
