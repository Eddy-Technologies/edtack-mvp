<template>
  <div class="space-y-6">
    <!-- Children Plans Overview -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Children's Subscriptions</h2>
          <button
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="showSubscriptionModal = true"
          >
            View Plans
          </button>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="child in children" :key="child.id" class="border rounded-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <img :src="child.avatar" :alt="child.name" class="w-12 h-12 rounded-full">
              <div>
                <h4 class="font-semibold text-gray-900">{{ child.name }}</h4>
                <div class="flex items-center space-x-2">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      child.plan === 'Premium' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ child.plan }} Plan
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Next billing</span>
                <span class="font-medium">{{ child.nextBilling }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Status</span>
                <span
                  :class="[
                    'font-medium',
                    child.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                  ]"
                >
                  {{ child.status }}
                </span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t space-y-2">
              <button
                v-if="child.plan === 'Free'"
                class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                @click="upgradeChild(child)"
              >
                Upgrade to Premium
              </button>
              <button
                v-else
                class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                @click="manageChildPlan(child)"
              >
                Manage Plan
              </button>
              <button
                v-if="child.plan === 'Premium'"
                class="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                @click="cancelChildPlan(child)"
              >
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="bg-white rounded-xl shadow-sm border">
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
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
            @click="showBillingModal = true"
          >
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Billing History -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing History TODO</h3>
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
                  ? 'bg-primary text-white'
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
      :student-name="selectedChild?.name"
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

const children = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    avatar: '/child1-avatar.png',
    plan: 'Premium',
    status: 'Active',
    nextBilling: 'March 15, 2024'
  },
  {
    id: 2,
    name: 'Liam Johnson',
    avatar: '/child2-avatar.png',
    plan: 'Free',
    status: 'Active',
    nextBilling: 'N/A'
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    avatar: '/child3-avatar.png',
    plan: 'Premium',
    status: 'Active',
    nextBilling: 'March 15, 2024'
  }
]);

const paymentMethod = ref({
  lastFour: '4242',
  expiry: '12/26'
});

const billingHistory = ref([
  {
    id: 1,
    date: 'Feb 15, 2024',
    description: 'Emma Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 2,
    date: 'Feb 15, 2024',
    description: 'Sophia Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 3,
    date: 'Jan 15, 2024',
    description: 'Emma Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 4,
    date: 'Jan 15, 2024',
    description: 'Sophia Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 5,
    date: 'Dec 15, 2023',
    description: 'Emma Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 6,
    date: 'Dec 15, 2023',
    description: 'Sophia Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 7,
    date: 'Nov 15, 2023',
    description: 'Emma Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  },
  {
    id: 8,
    date: 'Nov 15, 2023',
    description: 'Sophia Johnson - Premium Plan',
    amount: 25.00,
    status: 'paid'
  }
]);

// Modal states
const showSubscriptionModal = ref(false);
const showBillingModal = ref(false);
const selectedChild = ref<any>(null);

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
const upgradeChild = (child: any) => {
  selectedChild.value = child;
  showSubscriptionModal.value = true;
};

const manageChildPlan = (child: any) => {
  selectedChild.value = child;
  showSubscriptionModal.value = true;
};

const handlePlanSelected = (plan: 'free' | 'premium', _studentName?: string) => {
  if (selectedChild.value) {
    selectedChild.value.plan = plan === 'premium' ? 'Premium' : 'Free';
    selectedChild.value.nextBilling = plan === 'premium' ? 'March 15, 2024' : 'N/A';

    // Add billing history entry for upgrades
    if (plan === 'premium') {
      billingHistory.value.unshift({
        id: billingHistory.value.length + 1,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `${selectedChild.value.name} - Premium Plan`,
        amount: 25.00,
        status: 'paid'
      });
    }
  }
  selectedChild.value = null;
};

const handlePaymentUpdated = (data: { card: any; address: any }) => {
  // Update payment method display with new card info
  paymentMethod.value.lastFour = data.card.number.slice(-4);
  paymentMethod.value.expiry = data.card.expiry;

  // Billing address would also be updated in the backend
  console.log('Updated billing address:', data.address);
};

const cancelChildPlan = (child: any) => {
  if (confirm(`Are you sure you want to cancel ${child.name}'s Premium plan? They will lose access to premium features at the end of the billing period.`)) {
    child.plan = 'Free';
    child.nextBilling = 'N/A';
    child.status = 'Cancelled';

    // Add cancellation entry to billing history
    billingHistory.value.unshift({
      id: billingHistory.value.length + 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `${child.name} - Plan Cancellation`,
      amount: 0,
      status: 'processed'
    });
  }
};
</script>
