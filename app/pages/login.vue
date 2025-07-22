<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <!-- Header -->
          <div class="text-center">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back to Eddy!
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Or
              <NuxtLink
                to="/register"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new account
              </NuxtLink>
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-600 text-sm">{{ successMessage }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- SSO Options -->
          <div class="space-y-3">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-2 text-gray-500">Continue with</span>
              </div>
            </div>

            <!-- Google SSO -->
            <button
              type="button"
              class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              @click="handleGoogleLogin"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>
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

            <!-- Forgot Password Link -->
            <div class="text-right">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-500"
                @click="handleForgotPassword"
              >
                Forgot your password?
              </button>
            </div>

            <!-- Login Button -->
            <Button
              variant="primary"
              class="w-full py-3 rounded-xl font-semibold transition"
              :disabled="!loginInput.trim() || !password.trim()"
              :loading="isLoading"
              :text="isLoading ? 'Logging in...' : 'Sign in'"
              @click="handleLogin"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { validateEmail } from '~~/utils';
import Button from '~/components/common/Button.vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '#imports';

definePageMeta({
  layout: false,
  middleware: ['guest']
});

const toast = useToast();
const router = useRouter();
const route = useRoute();

// Get success message from query params (from registration redirect)
const successMessage = computed(() => route.query.message as string || '');

// Form state
const loginInput = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Auth composable
const { signIn, signInWithGoogle } = useAuth();

const handleLogin = async () => {
  if (!loginInput.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  const emailValidation = validateEmail(loginInput.value.trim());
  if (!emailValidation.isValid) {
    errorMessage.value = emailValidation.error || 'Invalid email';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Only email login is supported
    const response = await signIn(loginInput.value.trim(), password.value);
    console.log('Email login successful:', response);
    toast.add({
      title: 'Login successful',
      description: 'Welcome back!',
      color: 'green'
    });

    // Redirect to intended destination or dashboard
    const redirectTo = route.query.redirect as string || '/dashboard';
    router.push(redirectTo);
  } catch (error: any) {
    console.log('Login failed:', error.message);
    // Use error message from server if available, cannot use error.message directly
    errorMessage.value = error.data.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    await signInWithGoogle();

    // User will be redirected to Google, then back to /auth/callback
    // The auth plugin will handle the rest
  } catch (error: any) {
    console.error('Google login failed:', error);
    errorMessage.value = error.message || 'Google login failed. Please try again.';
    toast.add({
      title: 'Login failed',
      description: 'Please try again',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = () => {
  if (!loginInput.value.trim()) {
    errorMessage.value = 'Please enter your email address first';
    return;
  }

  const emailValidation = validateEmail(loginInput.value.trim());
  if (!emailValidation.isValid) {
    errorMessage.value = 'Please enter a valid email address';
    return;
  }

  toast.add({
    title: 'Password Reset',
    description: 'Password reset functionality will be available soon!',
    color: 'blue'
  });

  // TODO: Implement password reset functionality
  // try {
  //   const { resetPassword } = useAuth();
  //   await resetPassword(loginInput.value.trim());
  //   toast.add({
  //     title: 'Reset email sent',
  //     description: 'Check your email for password reset instructions.',
  //     color: 'green'
  //   });
  // } catch (error) {
  //   errorMessage.value = 'Failed to send reset email. Please try again.';
  // }
};
</script>
