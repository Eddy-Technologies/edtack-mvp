<template>
  <!-- Loading State -->
  <div v-if="isLoadingData" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Skeleton Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-11 h-11 bg-purple-100 rounded-xl animate-pulse" />
      <div class="space-y-2">
        <div class="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    <!-- Skeleton Form -->
    <div class="space-y-4">
      <div class="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div class="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div class="h-12 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="text-center py-8">
      <div class="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <UIcon name="i-lucide-alert-circle" class="text-red-500" size="32" />
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button class="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all duration-200" @click="loadFamilyData">
        Try Again
      </button>
    </div>
  </div>

  <!-- Non-parent access denied -->
  <div v-else-if="!isParent" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Standardized Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex items-center justify-center w-11 h-11 bg-purple-100 rounded-xl">
        <UIcon name="i-lucide-send" class="text-purple-600" size="22" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Transfer Credits</h3>
        <p class="text-sm text-gray-500">Send credits to family members</p>
      </div>
    </div>

    <div class="text-center py-10">
      <div class="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <UIcon name="i-lucide-lock" class="text-gray-400" size="32" />
      </div>
      <h4 class="text-lg font-medium text-gray-700 mb-2">Parent Access Only</h4>
      <p class="text-gray-500 text-sm max-w-xs mx-auto">
        Only parents can transfer credits. Ask your parent to send you credits if needed.
      </p>
    </div>
  </div>

  <!-- Main Transfer Form -->
  <TransferCreditsForm
    v-else
    :available-members="formattedChildren"
    :parent-balance="parentBalance"
    :is-loading="isLoading"
    @transfer="handleTransfer"
  />
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import TransferCreditsForm from './TransferCreditsForm.vue';
import { useToast } from '#imports';

const toast = useToast(); // Use unified credit management - consume shared state
const {
  children,
  balance: parentBalance,
  isLoading: isLoadingData,
  error,
  handleTransfer: handleCreditTransfer,
  fetchCredits,
  incrementTransactionVersion
} = useCredit();

// Use me store for user role
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);

// Local loading state for transfer operation
const isLoading = ref(false);

// Format children data for the transfer form
const formattedChildren = computed(() => {
  return children.value.map((child) => ({
    userInfoId: child.userInfoId,
    name: child.name,
    email: child.email,
    balance: child.balance
  }));
});

const handleTransfer = async (transferData: {
  toUserInfoId: string;
  amount: number;
  recipientName: string;
}) => {
  isLoading.value = true;

  // Optimistic update - update credit balances immediately
  handleCreditTransfer('parent', transferData.toUserInfoId, transferData.amount, `Transfer to ${transferData.recipientName}`);

  try {
    const transferResponse = await $fetch('/api/credits/internal-transfer', {
      method: 'POST',
      body: {
        toUserInfoId: transferData.toUserInfoId,
        amountInCents: transferData.amount
      },
    });

    if (transferResponse.success) {
      incrementTransactionVersion(); // Trigger transaction history refresh
      toast.add({
        title: 'Transfer Complete',
        description: `Successfully transferred ${transferData.amount.toLocaleString()} credits to ${transferData.recipientName}`,
        color: 'green',
        timeout: 5000,
      });
    }
  } catch (error) {
    console.error('Transfer failed:', error);

    // Revert optimistic updates on error
    handleCreditTransfer(transferData.toUserInfoId, 'parent', transferData.amount, 'Reverting failed transfer');

    // Show error toast
    toast.add({
      title: 'Error',
      description: 'Failed to process transfer. Please try again.',
      color: 'red',
      timeout: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

// Fetch family data on mount to ensure children list is populated
onMounted(async () => {
  if (isParent.value) {
    await fetchCredits();
  }
});

const loadFamilyData = async () => {
  await fetchCredits(true); // Force refresh
};
</script>
