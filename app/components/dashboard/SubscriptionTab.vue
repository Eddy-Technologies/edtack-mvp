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
              <h3 class="text-xl font-semibold text-gray-900">{{ currentPlan.name }} Plan</h3>
              <p class="text-gray-600">{{ currentPlan.description }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    currentPlan.name === 'Premium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ currentPlan.status }}
                </span>
                <span class="text-sm text-gray-500">Next billing: {{ currentPlan.nextBilling }}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">${{ currentPlan.price }}</div>
            <div class="text-sm text-gray-500">per month</div>
            <div v-if="currentPlan.name === 'Premium'" class="space-y-2 mt-3">
              <Button
                variant="secondary"
                text="Manage Billing"
                :loading="loading"
                @click="handleOpenCustomerPortal"
              />
            </div>
          </div>
        </div>
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

const { openCustomerPortal } = useStripe();

const currentPlan = ref({
  name: 'Free', // Can be 'Free' or 'Premium'
  description: 'Basic features to get started',
  price: 0,
  nextBilling: 'N/A',
  status: 'Active',
  stripeSubscriptionId: null,
  features: [
    '50 AI queries per month',
    'Basic study tools',
    'Limited practice questions',
    'Community support'
  ]
});

const loading = ref(false);

// Modal states
const showSubscriptionModal = ref(false);

// Stripe API functions
const fetchSubscription = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/stripe/subscription', {
      method: 'GET'
    });

    if (response?.subscription) {
      const sub = response.subscription;
      currentPlan.value = {
        email: sub.customer_email,
        name: 'Premium',
        description: 'Everything you need for comprehensive learning',
        price: sub.items.data[0].price.unit_amount / 100,
        nextBilling: new Date(sub.current_period_end * 1000).toLocaleDateString(),
        status: sub.status === 'active' ? 'Active' : 'Inactive',
        stripeSubscriptionId: sub.id,
        features: [
          'Unlimited AI queries',
          'Advanced study tools',
          'Unlimited practice questions',
          'Priority support',
          'Detailed progress tracking',
          'Offline access'
        ]
      };
    }
  } catch (err) {
    console.error('Failed to fetch subscription:', err);
  } finally {
    loading.value = false;
  }
};

const handleOpenCustomerPortal = () => {
  openCustomerPortal();// TODO: email
};

onMounted(async () => {
  await fetchSubscription();
});
</script>
