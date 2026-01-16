<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Invite Family Member</h3>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="handleClose"
        >
          <UIcon name="i-lucide-x" size="20" />
        </button>
      </div>

      <!-- Success state with invite link (for unregistered users) -->
      <div v-if="inviteLink" class="space-y-4">
        <div class="flex items-center gap-2 text-green-600">
          <UIcon name="i-lucide-check-circle" size="20" />
          <span class="font-medium">Invitation created!</span>
        </div>
        <p class="text-sm text-gray-600">
          Share this link with <span class="font-medium">{{ invitedEmail }}</span> to register:
        </p>
        <div class="flex items-center gap-2">
          <input
            type="text"
            :value="inviteLink"
            readonly
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600"
          >
          <Button
            variant="secondary"
            :text="copied ? 'Copied!' : 'Copy'"
            class="shrink-0"
            @clicked="copyToClipboard"
          />
        </div>
        <div class="pt-2">
          <Button
            variant="primary"
            text="Done"
            class="w-full"
            @clicked="handleClose"
          />
        </div>
      </div>

      <!-- Invite form -->
      <form v-else @submit.prevent="handleInvite">
        <div class="mb-6">
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

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="secondary"
            text="Cancel"
            class="w-full sm:w-auto"
            :disabled="isLoading"
            @clicked="handleClose"
          />
          <Button
            variant="primary"
            text="Send Invitation"
            class="w-full sm:w-auto"
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
  'close': [];
  'member-invited': [];
}>();

// Reactive state
const email = ref('');
const isLoading = ref(false);
const error = ref('');
const inviteLink = ref('');
const invitedEmail = ref('');
const copied = ref(false);

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

const resetForm = () => {
  email.value = '';
  error.value = '';
  inviteLink.value = '';
  invitedEmail.value = '';
  copied.value = false;
};

const handleClose = () => {
  // If we showed an invite link, emit member-invited to refresh the list
  if (inviteLink.value) {
    emit('member-invited');
  }
  resetForm();
  emit('close');
};

const handleInvite = async () => {
  if (!email.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/family/invite-child', {
      method: 'POST',
      body: {
        email: email.value
      }
    });

    if (response.success) {
      // Check if this is an email-based invitation (unregistered user)
      if (response.inviteLink) {
        inviteLink.value = response.inviteLink;
        invitedEmail.value = email.value;
      } else {
        // Registered user - close modal and refresh
        emit('member-invited');
      }
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

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>
