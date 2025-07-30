<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Logo in top right -->
    <div class="absolute top-4 left-4">
      <NuxtLink to="/" class="text-primary-600 hover:text-primary-500">
        <AppIcon class="w-12 h-12 mr-3" />
      </NuxtLink>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <!-- Header -->
          <div class="text-center">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Or
              <NuxtLink
                to="/login"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                sign in to your existing account
              </NuxtLink>
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- SSO Options -->
          <div class="space-y-3">
            <!-- Google SSO -->
            <button
              type="button"
              class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              @click="handleGoogleRegister"
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

          <!-- Registration Form -->
          <div class="space-y-4">
            <div class="flex flex-row gap-4">
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
            </div>

            <!-- Email Input -->
            <input
              v-model="email"
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
              @keyup.enter="handleRegister"
            >

            <!-- User Type Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700 text-left">
                Are you a parent or student?
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="px-4 py-3 rounded-xl border font-medium transition-colors"
                  :class="userRole === USER_ROLE.PARENT
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
                  :disabled="isLoading"
                  @click="userRole = USER_ROLE.PARENT"
                >
                  Parent
                </button>
                <button
                  type="button"
                  class="px-4 py-3 rounded-xl border font-medium transition-colors"
                  :class="userRole === USER_ROLE.STUDENT
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
                  :disabled="isLoading"
                  @click="userRole = USER_ROLE.STUDENT"
                >
                  Student
                </button>
              </div>
            </div>

            <!-- Student-specific fields -->
            <!-- Student Level (Required) -->
            <USelect
              v-if="userRole === USER_ROLE.STUDENT"
              v-model="studentLevel"
              :disabled="isLoading"
              placeholder="Select your level"
              :options="levelOptions"
            />

            <!-- Terms and Conditions -->
            <div class="flex items-start space-x-3 text-left">
              <input
                id="terms"
                v-model="acceptTerms"
                type="checkbox"
                class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                :disabled="isLoading"
              >
              <label for="terms" class="text-sm text-gray-700">
                I accept all <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 underline"
                >terms and conditions</a>
              </label>
            </div>

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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { validateEmail, validatePassword } from '~~/utils';
import { USER_ROLE, STUDENT_LEVEL } from '~/constants/User';
import Button from '~/components/common/Button.vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '#imports';

definePageMeta({
  layout: false,
  middleware: ['guest']
});

// Create level options for students using constant STUDENT_LEVEL with label as the value
const levelOptions = computed(() => Object.entries(STUDENT_LEVEL).map(([key, value]) => ({
  value: key,
  label: value,
})));

// Form state
const firstName = ref('');
const lastName = ref('');
const password = ref('');
const email = ref('');
const userRole = ref(''); // 'parent' or 'student'
const studentLevel = ref(''); // Required for students
const acceptTerms = ref(false);

const isLoading = ref(false);
const errorMessage = ref('');

const toast = useToast();
const router = useRouter();

// Auth composable
const { signUp, signInWithGoogle } = useAuth();

// Form validation
const canSubmit = computed(() => {
  const basicFieldsValid = !isLoading.value &&
    firstName.value.trim() &&
    lastName.value.trim() &&
    email.value.trim() &&
    password.value.trim() &&
    userRole.value &&
    acceptTerms.value === true;

  // Additional validation for students (student level is required)
  if (userRole.value === USER_ROLE.STUDENT) {
    return basicFieldsValid && studentLevel.value;
  }

  return basicFieldsValid;
});

const handleRegister = async () => {
  if (!canSubmit.value) {
    if (!userRole.value) {
      errorMessage.value = 'Please select whether you are a parent or student';
    } else if (!acceptTerms.value) {
      errorMessage.value = 'Please accept the terms and conditions';
    } else if (userRole.value === USER_ROLE.STUDENT && !studentLevel.value) {
      errorMessage.value = 'Please select your current level';
    } else {
      errorMessage.value = 'Please fill in all required fields';
    }
    return;
  }

  const emailValidation = validateEmail(email.value.trim());
  if (!emailValidation.isValid) {
    errorMessage.value = emailValidation.error || 'Invalid email';
    return;
  }

  const passwordValidation = validatePassword(password.value);
  if (!passwordValidation.isValid) {
    errorMessage.value = passwordValidation.error || 'Invalid password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Only email registration is supported
    const response = await signUp({
      email: email.value.trim(),
      password: password.value,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      userRole: userRole.value,
      studentLevel: studentLevel.value,
      acceptTerms: acceptTerms.value,
    });
    console.log('Email registration successful:', response);
    const successMessage = 'Registration successful! Please check your email to confirm your account.';
    toast.add({
      title: 'Registration Successful',
      description: 'You can now log in with your new account after you have confirmed your email.',
      color: 'green'
    });

    // Redirect to login with success message
    router.push({
      path: '/login',
      query: { message: successMessage }
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    // Use error message from server if available, error.message does not display correctly
    errorMessage.value = error.data.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleRegister = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    await signInWithGoogle();

    // User will be redirected to Google, then back to /auth/callback
    // The auth plugin will handle the rest
  } catch (error: any) {
    console.error('Google registration failed:', error);
    errorMessage.value = error.message || 'Google registration failed. Please try again.';
    toast.add({
      title: 'Registration failed',
      description: 'Please try again',
      color: 'red'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
