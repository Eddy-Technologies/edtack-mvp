<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
            <UIcon name="i-lucide-coins" class="text-green-600" size="20" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Transfer Credits</h3>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-x" size="20" />
        </button>
      </div>

      <div class="mb-4">
        <p class="text-gray-700">
          Transfer credits to
          <strong>{{ member?.userDisplayFullName || member?.email }}</strong>
        </p>
      </div>

      <form @submit.prevent="handleTransfer">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Amount (credits)</label>
          <input
            v-model.number="amount"
            type="number"
            min="1"
            placeholder="Enter amount..."
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            :disabled="isLoading"
            required
          >
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Note (Optional)
          </label>
          <input
            v-model="note"
            type="text"
            placeholder="Add a note..."
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            :disabled="isLoading"
          >
        </div>

        <div class="flex space-x-3">
          <Button
            variant="secondary"
            text="Cancel"
            :disabled="isLoading"
            @clicked="$emit('close')"
          />
          <Button
            variant="primary"
            text="Transfer Credits"
            :loading="isLoading"
            :disabled="!amount || amount <= 0 || isLoading"
            @clicked="handleTransfer"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '../../common/Button.vue';

const props = defineProps<{
  isOpen: boolean;
  member: any;
}>();

const emit = defineEmits<{
  'close': [];
  'transfer-completed': [];
}>();

// Reactive state
const amount = ref<number>(0);
const note = ref('');
const isLoading = ref(false);
const error = ref('');

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    amount.value = 0;
    note.value = '';
    error.value = '';
  }
});

const handleTransfer = async () => {
  if (!amount.value || amount.value <= 0 || !props.member) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/credits/internal-transfer', {
      method: 'POST',
      body: {
        toUserInfoId: props.member.user_info_id || props.member.id,
        amountInCents: amount.value * 100, // Convert to cents
        note: note.value || `Transfer to ${props.member.userDisplayFullName || props.member.email}`
      }
    });

    if (response.success) {
      emit('transfer-completed');
    } else {
      throw new Error('Failed to transfer credits');
    }
  } catch (err: any) {
    console.error('Failed to transfer credits:', err);
    error.value = err.data?.message || 'Failed to transfer credits. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
