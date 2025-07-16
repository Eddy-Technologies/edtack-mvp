<template>
  <div class="min-h-[300px] flex items-center justify-center">
    <div class="w-[360px] space-y-6 text-center">
      <!-- Login Type Header -->
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900">Sign in with Email</h3>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Login Form -->
      <div class="space-y-4">
        <!-- Email Input -->
        <input
          v-model="loginInput"
          type="email"
          placeholder="Email"
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
          @keyup.enter="handleLogin"
        >

        <!-- Login Button -->
        <Button
          variant="primary"
          class="w-full py-3 rounded-xl font-semibold transition"
          :disabled="!loginInput.trim() || !password.trim()"
          :loading="isLoading"
          :text="isLoading ? 'Logging in...' : 'Login'"
          @click="handleLogin"
        />
      </div>

      <!-- TODO: Add "Forgot Password" link -->
      <!-- TODO: Add "Remember Me" checkbox -->
      <!-- TODO: Add social login options if needed -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '~/components/common/Button.vue';
import { useAuth } from '~/composables/useAuth';

// Form state
const loginInput = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Auth composable
const { signIn } = useAuth();

const emit = defineEmits(['success']);

const handleLogin = async () => {
  if (!loginInput.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Only email login is supported
    const response = await signIn(loginInput.value.trim(), password.value);
    console.log('Email login successful:', response);
    emit('success');
  } catch (error: any) {
    console.error('Login failed:', error);

    // TODO: Improve error message handling based on error type
    if (error.status === 401) {
      errorMessage.value = 'Invalid credentials. Please try again.';
    } else if (error.status === 429) {
      errorMessage.value = 'Too many attempts. Please try again later.';
    } else {
      errorMessage.value = error.message || 'Login failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// TODO: Add form validation for username/email format
// TODO: Add password strength indicator for better UX
// TODO: Add "Remember Me" functionality
// TODO: Add social login integration
// TODO: Add rate limiting feedback
</script>
