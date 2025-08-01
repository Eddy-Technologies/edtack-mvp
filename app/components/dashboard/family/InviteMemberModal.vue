<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Invite Family Member</h3>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-x" size="20" />
        </button>
      </div>

      <form @submit.prevent="handleInvite">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            placeholder="member@example.com"
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="isLoading"
            required
          >
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            v-model="message"
            rows="3"
            placeholder="Add a personal message to your invitation..."
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="isLoading"
          />
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
            text="Send Invitation"
            :loading="isLoading"
            :disabled="!email || isLoading"
            @clicked="handleInvite"
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
}>();

const emit = defineEmits<{
  close: [];
  'member-invited': [];
}>();

// Reactive state
const email = ref('');
const message = ref('');
const isLoading = ref(false);
const error = ref('');

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    email.value = '';
    message.value = '';
    error.value = '';
  }
});

const handleInvite = async () => {
  if (!email.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/family/invite-child', {
      method: 'POST',
      body: {
        email: email.value,
        message: message.value
      }
    });

    if (response.success) {
      emit('member-invited');
    } else {
      throw new Error('Failed to send invitation');
    }
  } catch (err: any) {
    console.error('Failed to send invitation:', err);
    error.value = err.data?.message || 'Failed to send invitation. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>