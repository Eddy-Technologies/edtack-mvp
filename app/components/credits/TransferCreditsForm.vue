<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="flex items-center mb-4">
      <div class="bg-purple-100 rounded-full p-2 mr-3">
        <UIcon name="i-lucide-arrow-left-right" class="w-6 h-6 text-purple-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Transfer Credits</h3>
    </div>

    <p class="text-gray-600 mb-6">Send credits to family members instantly</p>

    <!-- Error State -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-400 mr-2" />
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>
    </div>

    <form @submit.prevent="handleTransfer">
      <!-- Recipient Selection (only show dropdown if not pre-selected) -->
      <div v-if="!preSelectedMember" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Send To</label>
        <select
          v-model="selectedMemberId"
          class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          :disabled="isLoading"
          required
        >
          <option value="">Select a child</option>
          <option v-for="member in availableMembers" :key="member.userInfoId" :value="member.userInfoId">
            {{ member.name }} ({{ member.balance }} credits)
          </option>
        </select>
      </div>

      <!-- Pre-selected Member Display -->
      <div v-else class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Send To</label>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p class="font-medium text-gray-900">{{ preSelectedMember.name }}</p>
          <p class="text-sm text-gray-600">{{ preSelectedMember.email }}</p>
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
            placeholder="0"
            class="block w-full pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            :disabled="isLoading"
            required
          >
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">credits</span>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          Available: {{ parentBalance || 0 }} credits
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
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            @click="transferAmount = amount"
          >
            {{ amount }}
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
          class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          :disabled="isLoading"
        >
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <button
          v-if="showCancel"
          type="button"
          class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          :disabled="isLoading"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!canTransfer || isLoading"
          class="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          {{ isLoading ? 'Transferring...' : `Transfer ${transferAmount || 0} credits` }}
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
