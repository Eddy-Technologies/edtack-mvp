<template>
  <div class="min-h-[300px] flex items-center justify-center">
    <div class="w-[360px] space-y-6 text-center">
      <!-- Registration Type Toggle -->
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            registerType === 'username' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="registerType = 'username'"
        >
          Username
        </button>
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            registerType === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="registerType = 'email'"
        >
          Email
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
        <p class="text-green-600 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Registration Form -->
      <div class="space-y-4">
        <!-- First Name -->
        <input
          v-model="firstName"
          type="text"
          placeholder="First Name"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="isLoading"
        >

        <!-- Last Name -->
        <input
          v-model="lastName"
          type="text"
          placeholder="Last Name"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="isLoading"
        >

        <!-- Email/Username Input -->
        <input
          v-model="registerInput"
          :type="registerType === 'email' ? 'email' : 'text'"
          :placeholder="registerType === 'email' ? 'Email' : 'Username'"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="isLoading"
        >

        <!-- Password Input -->
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="isLoading"
          @keyup.enter="handleRegister"
        >

        <!-- Register Button -->
        <Button
          variant="primary"
          class="w-full py-3 rounded-xl font-semibold transition"
          :disabled="!canSubmit"
          :loading="isLoading"
          :text="isLoading ? 'Creating Account...' : 'Register'"
          @click="handleRegister"
        />
      </div>

      <!-- TODO: Add password strength indicator -->
      <!-- TODO: Add terms of service checkbox -->
      <!-- TODO: Add password confirmation field -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '~/components/common/Button.vue';
import { useUsers } from '~/composables/useUsers';

// Form state
const registerType = ref<'username' | 'email'>('email');
const firstName = ref('');
const lastName = ref('');
const registerInput = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Auth composable
const { signupUsername, signupEmail } = useUsers();

const emit = defineEmits(['success']);

// Form validation
const canSubmit = computed(() => {
  return !isLoading.value &&
    firstName.value.trim() &&
    lastName.value.trim() &&
    registerInput.value.trim() &&
    password.value.trim();
});

const handleRegister = async () => {
  if (!canSubmit.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    if (registerType.value === 'username') {
      // TODO: Validate username format (no spaces, special chars, etc.)
      const response = await signupUsername({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        username: registerInput.value.trim(),
        password: password.value,
      });
      console.log('Username registration successful:', response);
      successMessage.value = 'Account created successfully!';
      emit('success');
    } else {
      // TODO: Validate email format more thoroughly
      const response = await signupEmail(
        registerInput.value.trim(),
        password.value,
        firstName.value.trim(),
        lastName.value.trim()
      );
      console.log('Email registration successful:', response);

      if (response.needsVerification) {
        successMessage.value = 'Account created! Please check your email for verification.';
      } else {
        successMessage.value = 'Account created successfully!';
        emit('success');
      }
    }
  } catch (error: any) {
    console.error('Registration failed:', error);

    // TODO: Improve error message handling based on error type
    if (error.status === 409) {
      errorMessage.value = 'An account with this email/username already exists.';
    } else if (error.status === 429) {
      errorMessage.value = 'Too many attempts. Please try again later.';
    } else {
      errorMessage.value = error.message || 'Registration failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// TODO: Add email/username validation
// TODO: Add password strength validation
// TODO: Add terms of service acceptance
// TODO: Add password confirmation field
</script>
