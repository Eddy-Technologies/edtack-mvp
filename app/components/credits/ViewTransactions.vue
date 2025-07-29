<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="flex items-center mb-4">
      <div class="bg-green-100 rounded-full p-2 mr-3">
        <svg
          class="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Transaction History</h3>
    </div>

    <p class="text-gray-600 mb-6">View your recent credit transactions</p>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4" />
      <p class="text-gray-500">Loading transactions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <svg
        class="w-12 h-12 mx-auto text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <Button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors" @click="fetchTransactions">
        Try Again
      </Button>
    </div>

    <!-- Transactions List -->
    <div v-else>
      <div v-if="transactions.length === 0" class="text-center py-8">
        <svg
          class="w-12 h-12 mx-auto text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-gray-500">No transactions yet</p>
        <p class="text-gray-400 text-sm mt-1">Your credit transactions will appear here</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Transaction Cards -->
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Transaction Type Icon -->
              <div :class="getTransactionIcon(transaction.transaction_type).class">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getTransactionIcon(transaction.transaction_type).path"
                  />
                </svg>
              </div>

              <div>
                <div class="font-medium text-gray-900">
                  {{ getTransactionLabel(transaction.transaction_type) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ transaction.description || 'No description' }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ formatDate(transaction.created_at) }}
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <div
                :class="[
                  'font-semibold',
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ transaction.amount >= 0 ? '+' : '' }}{{ formatAmount(transaction.amount) }} {{ transaction.currency }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Showing {{ ((pagination.currentPage - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }} of {{ pagination.totalCount }} transactions
          </div>

          <div class="flex space-x-2">
            <button
              :disabled="!pagination.hasPrevPage || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              @click="goToPage(pagination.currentPage - 1)"
            >
              Previous
            </button>

            <span class="px-3 py-1 text-sm font-medium text-gray-700">
              Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
            </span>

            <button
              :disabled="!pagination.hasNextPage || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              @click="goToPage(pagination.currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// State
const transactions = ref<any[]>([]);
const pagination = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);

// Fetch transactions function
const fetchTransactions = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await $fetch('/api/credits/transactions', {
      query: {
        page,
        limit: 5
      }
    });

    transactions.value = data.transactions;
    pagination.value = data.pagination;
    currentPage.value = page;
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    error.value = 'Failed to load transactions. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Navigate to specific page
const goToPage = (page: number) => {
  if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
    fetchTransactions(page);
  }
};

// Format amount from cents to dollars
const formatAmount = (amountInCents: number) => {
  return (amountInCents / 100).toFixed(2);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get transaction type label
const getTransactionLabel = (type: string) => {
  const labels = {
    CREDIT_TOPUP: 'Credit Top-up',
    TRANSFER_IN: 'Credit Received',
    TRANSFER_OUT: 'Credit Sent',
    BALANCE_ADJUSTMENT: 'Balance Adjustment',
    PURCHASE: 'Credit Purchase',
  };
  return labels[type] || type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Get transaction type icon
const getTransactionIcon = (type: string) => {
  const icons = {
    CREDIT_TOPUP: {
      class: 'bg-green-100 rounded-full p-2 text-green-600',
      path: 'M12 6v6l4-2'
    },
    BALANCE_ADJUSTMENT: {
      class: 'bg-yellow-100 rounded-full p-2 text-yellow-600',
      path: 'M12 6v6l4-2'
    },
    TRANSFER_IN: {
      class: 'bg-blue-100 rounded-full p-2 text-blue-600',
      path: 'M7 16l-4-4m0 0l4-4m-4 4h18'
    },
    TRANSFER_OUT: {
      class: 'bg-orange-100 rounded-full p-2 text-orange-600',
      path: 'M17 8l4 4m0 0l-4 4m4-4H3'
    },
    PURCHASE: {
      class: 'bg-red-100 rounded-full p-2 text-red-600',
      path: 'M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8'
    },
  };

  return icons[type] || {
    class: 'bg-gray-100 rounded-full p-2 text-gray-600',
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };
};

// Load transactions on component mount
onMounted(() => {
  fetchTransactions();
});
</script>
