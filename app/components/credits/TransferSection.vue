<template>
  <!-- Loading State -->
  <div v-if="isLoadingData" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
      <p class="text-gray-500">Loading family data...</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="text-center py-8">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 mx-auto text-red-400 mb-4" />
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors" @click="loadFamilyData">
        Try Again
      </button>
    </div>
  </div>

  <!-- Non-parent access denied -->
  <div v-else-if="!isParent" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="flex items-center mb-4">
      <div class="bg-purple-100 rounded-full p-2 mr-3">
        <UIcon name="i-lucide-arrow-left-right" class="w-6 h-6 text-purple-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Transfer Credits</h3>
    </div>

    <div class="text-center py-8">
      <UIcon name="i-lucide-lock" class="w-12 h-12 mx-auto text-gray-300 mb-3" />
      <p class="text-gray-500 text-sm">Only parents can transfer credits</p>
      <p class="text-gray-400 text-xs mt-1">Ask your parent to send you credits</p>
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
  fetchCredits
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
  note?: string;
  recipientName: string;
}) => {
  isLoading.value = true;

  // Optimistic update - update credit balances immediately
  handleCreditTransfer('parent', transferData.toUserInfoId, transferData.amount, transferData.note || `Transfer to ${transferData.recipientName}`);

  try {
    const transferResponse = await $fetch('/api/credits/internal-transfer', {
      method: 'POST',
      body: {
        toUserInfoId: transferData.toUserInfoId,
        amountInCents: transferData.amount,
        note: transferData.note
      },
    });

    if (transferResponse.success) {
      toast.add({
        title: 'Success',
        description: transferResponse.message,
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
