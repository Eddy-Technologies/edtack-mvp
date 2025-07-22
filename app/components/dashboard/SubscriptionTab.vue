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
                @click="openCustomerPortal"
              />
              <Button
                variant="secondary-danger"
                text="Cancel Plan"
                :loading="loading"
                @click="cancelPlan"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Section -->
    <!-- <div v-if="currentPlan.name === 'Free'" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6" /> -->

    <!-- Payment Method (only show if not free plan) -->
    <div v-if="currentPlan.name !== 'Free'" class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Payment Method</h3>
      </div>
      <div class="p-6">
        <div v-if="paymentMethod.lastFour" class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
              <span class="text-white text-xs font-bold">{{ paymentMethod.brand || 'CARD' }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-900">•••• •••• •••• {{ paymentMethod.lastFour }}</p>
              <p class="text-sm text-gray-600">Expires {{ paymentMethod.expiry }}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            text="Update via Stripe"
            :loading="loading"
            @click="openCustomerPortal"
          />
        </div>
        <div v-else class="text-center py-4">
          <p class="text-gray-500">No payment method on file</p>
        </div>
      </div>
    </div>

    <!-- Billing History -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing History</h3>
      </div>
      <div v-if="loading" class="p-6 text-center">
        <p class="text-gray-500">Loading billing history...</p>
      </div>
      <div v-else-if="billingHistory.length === 0" class="p-6 text-center">
        <p class="text-gray-500">No billing history available</p>
      </div>
      <div v-else class="overflow-x-auto">
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
                <button
                  v-if="bill.invoiceUrl"
                  class="text-blue-600 hover:text-blue-700"
                  @click="downloadInvoice(bill.invoiceUrl)"
                >
                  Download
                </button>
                <span v-else class="text-gray-400">N/A</span>
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

const paymentMethod = ref({
  lastFour: null,
  expiry: null,
  brand: null
});

const billingHistory = ref([]);
const loading = ref(false);
const error = ref(null);

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

// Stripe API functions
const fetchSubscription = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/stripe/subscription', {
      method: 'GET'
    });

    if (response.subscription) {
      const sub = response.subscription;
      currentPlan.value = {
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

      // Get payment method info
      if (sub.default_payment_method) {
        const pm = response.paymentMethod;
        if (pm && pm.card) {
          paymentMethod.value = {
            lastFour: pm.card.last4,
            expiry: `${pm.card.exp_month}/${pm.card.exp_year.toString().slice(-2)}`,
            brand: pm.card.brand.toUpperCase()
          };
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch subscription:', err);
    error.value = 'Failed to load subscription data';
  } finally {
    loading.value = false;
  }
};

const fetchBillingHistory = async () => {
  try {
    const response = await $fetch('/api/stripe/billing-history', {
      method: 'GET'
    });

    if (response.invoices) {
      billingHistory.value = response.invoices.map((invoice: any) => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toLocaleDateString(),
        description: invoice.lines.data[0]?.description || 'Premium Plan',
        amount: (invoice.amount_paid / 100).toFixed(2),
        status: invoice.status === 'paid' ? 'paid' : invoice.status,
        invoiceUrl: invoice.hosted_invoice_url
      }));
    }
  } catch (err) {
    console.error('Failed to fetch billing history:', err);
  }
};

const cancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your Premium plan? You will lose access to premium features at the end of your billing period.')) {
    return;
  }

  try {
    loading.value = true;
    const response = await $fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      body: {
        subscriptionId: currentPlan.value.stripeSubscriptionId
      }
    });

    if (response.success) {
      // Update UI to reflect cancellation
      currentPlan.value.status = 'Cancelled';
      // Refresh subscription data
      await fetchSubscription();
    }
  } catch (err) {
    console.error('Failed to cancel subscription:', err);
    error.value = 'Failed to cancel subscription';
  } finally {
    loading.value = false;
  }
};

const openCustomerPortal = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/stripe/customer-portal', {
      method: 'POST'
    });

    if (response.url) {
      window.open(response.url, '_blank');
    }
  } catch (err) {
    console.error('Failed to open customer portal:', err);
    error.value = 'Failed to open customer portal';
  } finally {
    loading.value = false;
  }
};

const downloadInvoice = (invoiceUrl: string) => {
  if (invoiceUrl) {
    window.open(invoiceUrl, '_blank');
  }
};

// Methods
const upgradeAccount = () => {
  showSubscriptionModal.value = true;
};

const handlePaymentUpdated = async () => {
  // Refresh subscription data after payment update
  await fetchSubscription();
  showBillingModal.value = false;
};

const cancelPlan = () => {
  cancelSubscription();
};

onMounted(async () => {
  await fetchSubscription();
  await fetchBillingHistory();
});
</script>
