<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">
          {{ enabled ? 'Disable' : 'Enable' }} Two-Factor Authentication
        </h2>
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
        <!-- Disable 2FA -->
        <div v-if="enabled">
          <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <svg
                class="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 class="font-medium text-red-800">Warning</h4>
                <p class="text-sm text-red-700 mt-1">
                  Disabling two-factor authentication will make your account less secure.
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="disable2FA">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter your password to confirm</label>
              <input
                v-model="password"
                type="password"
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-300': errorMessage }"
              >
              <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
            </div>

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
                :disabled="isProcessing || !password"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span v-if="isProcessing">Disabling...</span>
                <span v-else>Disable 2FA</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Enable 2FA -->
        <div v-else>
          <div v-if="step === 1">
            <p class="text-gray-600 mb-6">
              Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password).
            </p>

            <!-- QR Code -->
            <div class="bg-white border-2 border-gray-200 rounded-lg p-8 text-center mb-6">
              <div class="w-48 h-48 bg-gray-100 mx-auto rounded-lg flex items-center justify-center">
                <svg
                  class="w-24 h-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 14h5v5h-5v-5zM4 15h5v5H4v-5z"
                  />
                </svg>
              </div>
              <p class="text-sm text-gray-500 mt-2">QR Code placeholder</p>
            </div>

            <!-- Manual entry -->
            <div class="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-sm font-medium text-gray-900 mb-2">Can't scan the code?</p>
              <p class="text-sm text-gray-600 mb-2">Enter this code manually:</p>
              <code class="text-sm bg-white px-2 py-1 rounded border font-mono">ABCD-EFGH-IJKL-MNOP</code>
            </div>

            <button
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="step = 2"
            >
              I've added the account
            </button>
          </div>

          <div v-if="step === 2">
            <p class="text-gray-600 mb-6">
              Enter the 6-digit verification code from your authenticator app to complete setup.
            </p>

            <form @submit.prevent="enable2FA">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  v-model="verificationCode"
                  type="text"
                  placeholder="123456"
                  maxlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                  :class="{ 'border-red-300': errorMessage }"
                >
                <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
              </div>

              <div class="flex space-x-4">
                <button
                  type="button"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  @click="step = 1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  :disabled="isProcessing || verificationCode.length !== 6"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <span v-if="isProcessing">Enabling...</span>
                  <span v-else>Enable 2FA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isOpen: boolean;
  enabled: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status-updated', enabled: boolean): void;
}>();

const step = ref(1);
const password = ref('');
const verificationCode = ref('');
const isProcessing = ref(false);
const errorMessage = ref('');

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  step.value = 1;
  password.value = '';
  verificationCode.value = '';
  errorMessage.value = '';
  isProcessing.value = false;
};

const enable2FA = async () => {
  if (verificationCode.value.length !== 6) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    emit('status-updated', true);
    closeModal();
  } catch (error: any) {
    errorMessage.value = error.message || 'Invalid verification code. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};

const disable2FA = async () => {
  if (!password.value) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    emit('status-updated', false);
    closeModal();
  } catch (error: any) {
    errorMessage.value = error.message || 'Incorrect password. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};
</script>
