<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Change Username</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <form @submit.prevent="updateUsername">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Username</label>
            <input
              :value="currentUsername"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">New Username</label>
            <input
              v-model="newUsername"
              type="text"
              placeholder="Enter new username"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-300': errorMessage }"
            >
            <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
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
              :disabled="isProcessing || !newUsername"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                isProcessing || !newUsername
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              <span v-if="isProcessing">Updating...</span>
              <span v-else>Update Username</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isOpen: boolean;
  currentUsername: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'username-updated', username: string): void;
}>();

const newUsername = ref('');
const isProcessing = ref(false);
const errorMessage = ref('');

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  newUsername.value = '';
  errorMessage.value = '';
  isProcessing.value = false;
};

const updateUsername = async () => {
  if (!newUsername.value) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate validation
    if (newUsername.value.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    emit('username-updated', newUsername.value);
    closeModal();
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update username. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};
</script>
