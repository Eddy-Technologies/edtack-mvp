<template>
  <div class="space-y-6">
    <!-- Current Plan -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">My Subscription</h2>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="showSubscriptionModal = true"
          >
            View Plans
          </button>
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
            <button
              v-if="currentPlan.name === 'Premium'"
              class="mt-3 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
              @click="cancelPlan"
            >
              Cancel Plan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Section -->
    <div v-if="currentPlan.name === 'Free'" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Unlock Premium Features</h3>
        <p class="text-gray-600 mb-4">Get unlimited access to all our learning tools and AI assistance</p>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          @click="upgradeAccount"
        >
          Upgrade to Premium - $25/month
        </button>
      </div>
    </div>

    <!-- Payment Method (only show if not free plan) -->
    <div v-if="currentPlan.name !== 'Free'" class="bg-white rounded-xl shadow-sm border">
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
          <button
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="showBillingModal = true"
          >
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Billing History (only show if not free plan) -->
    <div v-if="currentPlan.name !== 'Free'" class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing History</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="bill in paginatedBillingHistory" :key="bill.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ bill.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ bill.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ bill.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ bill.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-700">Download</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, billingHistory.length) }} of {{ billingHistory.length }} results
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
              @click="currentPage--"
            >
              Previous
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <button
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
              @click="currentPage++"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription Modal -->
    <SubscriptionModal
      :is-open="showSubscriptionModal"
      @close="showSubscriptionModal = false"
      @plan-selected="handlePlanSelected"
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
import { ref, computed } from 'vue';
import SubscriptionModal from '../common/SubscriptionModal.vue';
import BillingUpdateModal from '../common/BillingUpdateModal.vue';

const currentPlan = ref({
  name: 'Premium', // Can be 'Free' or 'Premium'
  description: 'Everything you need for comprehensive learning',
  price: 25,
  nextBilling: 'March 15, 2024',
  status: 'Active',
  features: [
    'Unlimited AI queries',
    'Advanced study tools',
    'Unlimited practice questions',
    'Priority support',
    'Detailed progress tracking',
    'Offline access'
  ]
});

const paymentMethod = ref({
  lastFour: '4242',
  expiry: '12/26'
});

const billingHistory = ref([
  {
    id: 1,
    date: 'Feb 15, 2024',
    description: 'Premium Plan - Monthly',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 2,
    date: 'Jan 15, 2024',
    description: 'Premium Plan - Monthly',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 3,
    date: 'Dec 15, 2023',
    description: 'Premium Plan - Monthly',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 4,
    date: 'Nov 15, 2023',
    description: 'Premium Plan - Monthly',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 5,
    date: 'Oct 15, 2023',
    description: 'Premium Plan - Monthly',
    amount: 25.00,
    status: 'paid'
  }
]);

// Modal states
const showSubscriptionModal = ref(false);
const showBillingModal = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() => Math.ceil(billingHistory.value.length / itemsPerPage));

const paginatedBillingHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return billingHistory.value.slice(start, end);
});

// Methods
const upgradeAccount = () => {
  showSubscriptionModal.value = true;
};

const handlePlanSelected = (plan: 'free' | 'premium') => {
  currentPlan.value.name = plan === 'premium' ? 'Premium' : 'Free';
  currentPlan.value.price = plan === 'premium' ? 25 : 0;
  currentPlan.value.nextBilling = plan === 'premium' ? 'March 15, 2024' : 'N/A';
  currentPlan.value.description = plan === 'premium' ?
    'Everything you need for comprehensive learning' :
    'Basic features to get started';

  if (plan === 'premium') {
    currentPlan.value.features = [
      'Unlimited AI queries',
      'Advanced study tools',
      'Unlimited practice questions',
      'Priority support',
      'Detailed progress tracking',
      'Offline access'
    ];

    // Add billing history entry for upgrade
    billingHistory.value.unshift({
      id: billingHistory.value.length + 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: 'Premium Plan - Monthly',
      amount: 25.00,
      status: 'paid'
    });
  } else {
    currentPlan.value.features = [
      '50 AI queries per month',
      'Basic study tools',
      'Limited practice questions',
      'Community support'
    ];
  }
};

const handlePaymentUpdated = (data: { card: any; address: any }) => {
  // Update payment method display with new card info
  paymentMethod.value.lastFour = data.card.number.slice(-4);
  paymentMethod.value.expiry = data.card.expiry;

  // Billing address would also be updated in the backend
  console.log('Updated billing address:', data.address);
};

const cancelPlan = () => {
  if (confirm('Are you sure you want to cancel your Premium plan? You will lose access to premium features at the end of your billing period.')) {
    currentPlan.value.name = 'Free';
    currentPlan.value.price = 0;
    currentPlan.value.nextBilling = 'N/A';
    currentPlan.value.status = 'Cancelled';
    currentPlan.value.description = 'Basic features to get started';
    currentPlan.value.features = [
      '50 AI queries per month',
      'Basic study tools',
      'Limited practice questions',
      'Community support'
    ];

    // Add cancellation entry to billing history
    billingHistory.value.unshift({
      id: billingHistory.value.length + 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: 'Plan Cancellation',
      amount: 0,
      status: 'processed'
    });
  }
};
</script>
