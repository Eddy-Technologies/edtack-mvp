<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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

    <!-- Error State -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-circle" class="text-red-500 flex-shrink-0" size="18" />
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>
    </div>

    <form @submit.prevent="handleTransfer">
      <!-- Recipient Selection (only show dropdown if not pre-selected) -->
      <div v-if="!preSelectedMember" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Send To</label>
        <div class="relative">
          <select
            v-model="selectedMemberId"
            class="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 appearance-none bg-gray-50 focus:bg-white transition-all duration-200"
            :disabled="isLoading"
            required
          >
            <option value="">Select a family member</option>
            <option v-for="member in availableMembers" :key="member.userInfoId" :value="member.userInfoId">
              {{ member.name }} ({{ member.balance.toLocaleString() }} credits)
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <UIcon name="i-lucide-chevron-down" class="text-gray-400" size="20" />
          </div>
        </div>
      </div>

      <!-- Pre-selected Member Display -->
      <div v-else class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Sending To</label>
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-user" class="text-purple-600" size="24" />
          </div>
          <div>
            <p class="font-semibold text-gray-900">{{ preSelectedMember.name }}</p>
            <p class="text-sm text-gray-600">{{ preSelectedMember.email }}</p>
          </div>
        </div>
      </div>

      <!-- Amount Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <div class="relative">
          <input
            v-model.number="transferAmount"
            type="number"
            min="1"
            :max="parentBalance"
            placeholder="Enter amount"
            class="block w-full pl-4 pr-20 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-gray-50 focus:bg-white transition-all duration-200"
            :disabled="isLoading"
            required
          >
          <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span class="text-gray-400 text-sm font-medium">credits</span>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          Available: <span class="font-medium text-gray-700">{{ (parentBalance || 0).toLocaleString() }}</span> credits
        </p>
      </div>

      <!-- Quick Amount Buttons -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Quick Amounts</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="amount in quickTransferAmounts"
            :key="amount"
            type="button"
            :disabled="amount > parentBalance || isLoading"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              transferAmount === amount
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700',
              (amount > parentBalance || isLoading) && 'opacity-50 cursor-not-allowed'
            ]"
            @click="transferAmount = amount"
          >
            {{ amount.toLocaleString() }}
          </button>
        </div>
      </div>

      <!-- Note (Optional) -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Note (Optional)
        </label>
        <input
          v-model="note"
          type="text"
          placeholder="Add a note..."
          class="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-gray-50 focus:bg-white transition-all duration-200"
          :disabled="isLoading"
        >
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          v-if="showCancel"
          type="button"
          class="flex-1 bg-gray-100 text-gray-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200"
          :disabled="isLoading"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!canTransfer || isLoading"
          class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3.5 px-4 rounded-xl font-semibold shadow-sm hover:shadow-md hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <UIcon v-else name="i-lucide-send" size="18" />
          <span>{{ isLoading ? 'Transferring...' : `Transfer ${(transferAmount || 0).toLocaleString()} credits` }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface FamilyMember {
  userInfoId: string;
  name: string;
  email: string;
  balance: number;
}

interface PreSelectedMember {
  userInfoId?: string;
  user_info_id?: string;
  id?: string;
  name?: string;
  userDisplayFullName?: string;
  email: string;
}

const props = defineProps<{
  // Available family members for dropdown selection
  availableMembers?: FamilyMember[];
  // Pre-selected member (for family tab usage)
  preSelectedMember?: PreSelectedMember;
  // Parent's available balance
  parentBalance: number;
  // Show cancel button
  showCancel?: boolean;
  // Loading state
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  transfer: [{
    toUserInfoId: string;
    amount: number;
    note?: string;
    recipientName: string;
  }];
  cancel: [];
}>();

// Reactive state
const selectedMemberId = ref('');
const transferAmount = ref<number>();
const note = ref('');
const error = ref('');

const quickTransferAmounts = [50, 100, 250, 500];

// Computed properties
const selectedMember = computed(() => {
  if (props.preSelectedMember) {
    return {
      userInfoId: props.preSelectedMember.userInfoId || props.preSelectedMember.user_info_id || props.preSelectedMember.id,
      name: props.preSelectedMember.name || props.preSelectedMember.userDisplayFullName || props.preSelectedMember.email,
      email: props.preSelectedMember.email
    };
  }

  if (selectedMemberId.value && props.availableMembers) {
    return props.availableMembers.find((m) => m.userInfoId === selectedMemberId.value);
  }

  return null;
});

const canTransfer = computed(() => {
  return selectedMember.value &&
    transferAmount.value &&
    transferAmount.value > 0 &&
    transferAmount.value <= props.parentBalance &&
    !props.isLoading;
});

// Reset form when pre-selected member changes
watch(() => props.preSelectedMember, () => {
  transferAmount.value = undefined;
  note.value = '';
  error.value = '';
  selectedMemberId.value = '';
});

// Clear error when user starts typing
watch([selectedMemberId, transferAmount], () => {
  if (error.value) {
    error.value = '';
  }
});

const handleTransfer = () => {
  if (!canTransfer.value || !selectedMember.value) {
    error.value = 'Please select a recipient and enter a valid amount';
    return;
  }

  if (transferAmount.value! > props.parentBalance) {
    error.value = 'Transfer amount exceeds available balance';
    return;
  }

  const transferData = {
    toUserInfoId: selectedMember.value.userInfoId!,
    amount: transferAmount.value!,
    note: note.value || `Transfer to ${selectedMember.value.name}`,
    recipientName: selectedMember.value.name
  };

  emit('transfer', transferData);

  // Reset form after successful transfer initiation
  if (!props.preSelectedMember) {
    selectedMemberId.value = '';
  }
  transferAmount.value = undefined;
  note.value = '';
  error.value = '';
};
</script>
