<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Change Password</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <div class="flex items-center justify-center w-6 h-6">
            <UIcon name="i-lucide-x" size="24" />
          </div>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <form @submit.prevent="updatePassword">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Enter your current password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-300': errorMessage }"
            >
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-300': errorMessage }"
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-300': errorMessage }"
            >
            <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Logout Warning -->
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700 text-center">
              After password change, you will be logged out for security reasons. You'll need to log back in with your new password.
            </p>
          </div>

          <!-- Password Requirements -->
          <div class="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li class="flex items-center">
                <span :class="passwordValidation.length ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordValidation.length ? '✓' : '○' }}
                </span>
                <span class="ml-2">At least 8 characters</span>
              </li>
              <li class="flex items-center">
                <span :class="passwordValidation.number ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordValidation.number ? '✓' : '○' }}
                </span>
                <span class="ml-2">One number</span>
              </li>
            </ul>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4">
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isProcessing || !isFormValid"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                isProcessing || !isFormValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              <span v-if="isProcessing">Updating...</span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { validatePassword } from '~~/utils';
import { useToast } from '#imports';
import { useAuth } from '~/composables/useAuth';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close' | 'password-updated'): void;
}>();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isProcessing = ref(false);
const errorMessage = ref('');

const toast = useToast();
const { signOut } = useAuth();

const passwordValidation = computed(() => ({
  length: newPassword.value.length >= 8,
  number: /\d/.test(newPassword.value)
}));

const isPasswordValid = computed(() => {
  const validation = validatePassword(newPassword.value);
  return validation.isValid;
});

const isFormValid = computed(() => {
  return currentPassword.value &&
    newPassword.value &&
    confirmPassword.value &&
    isPasswordValid.value &&
    newPassword.value === confirmPassword.value;
});

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  errorMessage.value = '';
  isProcessing.value = false;
};

const updatePassword = async () => {
  if (!isFormValid.value) return;

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New passwords do not match';
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/auth/update-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    });

    // Sign out client-side to sync with server-side logout
    await signOut();

    toast.add({
      title: 'Password Updated',
      description: 'Your password has been successfully updated. Please log in again.',
      color: 'green'
    });

    emit('password-updated');
    closeModal();
  } catch (error: any) {
    const errorMsg = error.data?.message || error.message || 'Failed to update password. Please try again.';
    errorMessage.value = errorMsg;

    toast.add({
      title: 'Password Update Failed',
      description: errorMsg,
      color: 'red'
    });
  } finally {
    isProcessing.value = false;
  }
};
</script>
