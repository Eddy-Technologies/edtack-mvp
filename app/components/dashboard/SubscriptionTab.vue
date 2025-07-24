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
            <AppIcon class="w-12 h-12 mr-3" />
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ currentPlan?.name || 'Loading...' }}</h3>
              <p class="text-gray-600">{{ currentPlan?.description || 'Loading subscription details...' }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span v-if="currentPlan?.nextBilling !== 'N/A'" class="text-sm text-gray-500">Next billing: {{ currentPlan?.nextBilling }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">SGD {{ currentPlan?.price || '0' }}</div>
            <div class="text-sm text-gray-500">per {{ currentPlan?.interval || 'month' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Section -->
    <div v-if="!customer" class="bg-orange-100 rounded-xl border-2 border-orange-200 p-6">
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
        <p class="text-gray-600 mb-4">Get unlimited access to all our learning tools and AI assistance</p>
        <div class="space-x-4">
          <Button
            variant="primary"
            text="Upgrade Now!"
            @click="showSubscriptionModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Billing Management Card -->
    <div v-if="customer" class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing Management</h3>
      </div>
      <div class="p-6">
        <div class="flex gap-3">
          <Button
            variant="primary"
            text="Manage Subscription"
            :disabled="!customer"
            @click="redirectToCustomerPortal"
          />
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
import { ref, computed, onMounted } from 'vue';
import type Stripe from 'stripe';
import Button from '../common/Button.vue';
import SubscriptionModal from '../subscription/SubscriptionModal.vue';

const { customer, fetchCustomer, redirectToCustomerPortal, isLoading } = useSubscription();

// Modal states
const showSubscriptionModal = ref(false);

const currentPlan = computed(() => {
  const subscription = customer.value?.subscription;

  // If no subscription, return free plan
  if (!subscription) {
    return {
      name: 'Free Plan',
      description: 'Basic features to get started',
      price: 0,
      nextBilling: 'N/A',
      status: 'Free',
      features: [],
      interval: 'month',
      planType: 'free'
    };
  }

  // Extract data from Stripe subscription
  const subscriptionItem = subscription.items?.data[0];
  const price = subscriptionItem?.price;
  const product = price?.product as Stripe.Product;

  return {
    name: product?.name,
    description: product?.description,
    price: price?.unit_amount ? (price.unit_amount / 100) : 0,
    status: subscription.status ?
      subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) :
      'Unknown',
    features: product?.marketing_features?.map((f) => f.name) || [],
    interval: price?.recurring?.interval,
    planType: product?.metadata?.plan_type
  };
});

onMounted(() => {
  fetchCustomer();
});
</script>
