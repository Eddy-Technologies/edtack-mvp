<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Standardized Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex items-center justify-center w-11 h-11 bg-amber-100 rounded-xl">
        <UIcon name="i-lucide-history" class="text-amber-600" size="22" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Transaction History</h3>
        <p class="text-sm text-gray-500">View your recent credit activity</p>
      </div>
    </div>

    <!-- Loading State with Skeleton -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="border border-gray-100 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gray-200 rounded-xl animate-pulse" />
            <div class="space-y-2">
              <div class="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div class="h-3 w-40 bg-gray-100 rounded animate-pulse" />
              <div class="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div class="space-y-1 text-right">
            <div class="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            <div class="h-3 w-12 bg-gray-100 rounded animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <UIcon name="i-lucide-alert-circle" class="text-red-500" size="32" />
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button class="bg-amber-600 text-white px-5 py-2.5 rounded-xl hover:bg-amber-700 transition-all duration-200" @click="fetchTransactions">
        Try Again
      </button>
    </div>

    <!-- Transactions List -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="transactions.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <UIcon name="i-lucide-receipt" class="text-gray-400" size="40" />
        </div>
        <h4 class="text-lg font-medium text-gray-700 mb-2">No Transactions Yet</h4>
        <p class="text-gray-500 text-sm max-w-xs mx-auto">
          Your credit transactions will appear here once you start topping up or transferring credits.
        </p>
      </div>

      <div v-else class="space-y-3">
        <!-- Transaction Cards -->
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="group border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Transaction Type Icon -->
              <div
                class="flex items-center justify-center w-11 h-11 rounded-xl transition-transform group-hover:scale-105"
                :class="getTransactionIcon(transaction.transaction_type).bgColor"
              >
                <UIcon :name="getTransactionIcon(transaction.transaction_type).name" :class="getTransactionIcon(transaction.transaction_type).textColor" size="20" />
              </div>

              <div>
                <div class="font-medium text-gray-900">
                  {{ getTransactionLabel(transaction.transaction_type) }}
                </div>
                <div class="text-sm text-gray-500 line-clamp-1">
                  {{ transaction.description || 'No description' }}
                </div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ formatDateWithTime(transaction.created_at) }}
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <div
                :class="[
                  'font-bold text-lg tabular-nums',
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ transaction.amount >= 0 ? '+' : '' }}{{ transaction.amount.toLocaleString() }}
              </div>
              <div class="text-xs text-gray-400">credits</div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-100">
          <div class="text-sm text-gray-500">
            Showing <span class="font-medium text-gray-700">{{ ((pagination.currentPage - 1) * pagination.limit) + 1 }}</span>
            to <span class="font-medium text-gray-700">{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }}</span>
            of <span class="font-medium text-gray-700">{{ pagination.totalCount }}</span> transactions
          </div>

          <div class="flex items-center gap-2">
            <button
              :disabled="!pagination.hasPrevPage || isLoading"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
              @click="goToPage(pagination.currentPage - 1)"
            >
              <UIcon name="i-lucide-chevron-left" size="16" />
              Previous
            </button>

            <div class="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700">
              {{ pagination.currentPage }} / {{ pagination.totalPages }}
            </div>

            <button
              :disabled="!pagination.hasNextPage || isLoading"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
              @click="goToPage(pagination.currentPage + 1)"
            >
              Next
              <UIcon name="i-lucide-chevron-right" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const { formatDateWithTime } = useDateFormat();

// Get transaction version for refresh trigger
const { transactionVersion } = useCredit();

// State
const transactions = ref<any[]>([]);
const pagination = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const isMounted = ref(false);

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
      textColor: 'text-primary',
      bgColor: 'bg-primary-100',
      name: 'i-lucide-circle-plus'
    },
    BALANCE_ADJUSTMENT: {
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-100',
      name: 'i-lucide-wrench'
    },
    TRANSFER_IN: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      name: 'i-lucide-circle-dollar-sign'
    },
    TRANSFER_OUT: {
      textColor: 'text-red-600',
      bgColor: 'bg-red-100',
      name: 'i-lucide-circle-dollar-sign'
    },
    PURCHASE: {
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      name: 'i-lucide-shopping-basket'
    },
  };

  return icons[type] || {
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    name: 'i-lucide-file-text'
  };
};

// Load transactions on component mount
onMounted(() => {
  fetchTransactions();
  isMounted.value = true; // Mark as mounted after first fetch
});

// Watch for transaction version changes (triggered after transfers)
// Skip initial trigger if it happens during mount
watch(transactionVersion, () => {
  if (isMounted.value) {
    fetchTransactions();
  }
});
</script>
