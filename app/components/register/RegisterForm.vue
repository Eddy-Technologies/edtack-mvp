<template>
  <div class="min-h-[300px] flex items-center justify-center">
    <div class=" space-y-6 text-center">
      <!-- Registration Header -->
      <div class="text-center" />

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
          v-model="registerInput"
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
              :class="userType === USER_TYPE.PARENT
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
              :disabled="isLoading"
              @click="userType = USER_TYPE.PARENT"
            >
              Parent
            </button>
            <button
              type="button"
              class="px-4 py-3 rounded-xl border font-medium transition-colors"
              :class="userType === USER_TYPE.STUDENT
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
              :disabled="isLoading"
              @click="userType = USER_TYPE.STUDENT"
            >
              Student
            </button>
          </div>
        </div>

        <!-- Student-specific fields -->
        <div v-if="userType === USER_TYPE.STUDENT" class="space-y-4">
          <!-- Student Level (Required) -->
          <div>
            <select
              v-model="studentLevel"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              :disabled="isLoading"
            >
              <option value="">Select your current level *</option>
              <option value="primary-1">Primary 1</option>
              <option value="primary-2">Primary 2</option>
              <option value="primary-3">Primary 3</option>
              <option value="primary-4">Primary 4</option>
              <option value="primary-5">Primary 5</option>
              <option value="primary-6">Primary 6</option>
              <option value="secondary-1">Secondary 1</option>
              <option value="secondary-2">Secondary 2</option>
              <option value="secondary-3">Secondary 3</option>
              <option value="secondary-4">Secondary 4</option>
              <option value="secondary-5">Secondary 5</option>
              <option value="jc-1">Junior College 1</option>
              <option value="jc-2">Junior College 2</option>
            </select>
          </div>
        </div>

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

      <!-- TODO: Add password strength indicator -->
      <!-- TODO: Add terms of service checkbox -->
      <!-- TODO: Add password confirmation field -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '~/components/common/Button.vue';
import { useAuth } from '~/composables/useAuth';
import { USER_TYPE } from '~/constants/User.ts';

// Form state
const firstName = ref('');
const lastName = ref('');
const registerInput = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Onboarding fields
const userType = ref(''); // 'parent' or 'student'
const studentLevel = ref(''); // Required for students
const acceptTerms = ref(false);

// Auth composable
const { signUp } = useAuth();

const emit = defineEmits(['success']);

// Form validation
const canSubmit = computed(() => {
  const basicFieldsValid = !isLoading.value &&
    firstName.value.trim() &&
    lastName.value.trim() &&
    registerInput.value.trim() &&
    password.value.trim() &&
    userType.value &&
    acceptTerms.value;

  // Additional validation for students (student level is required)
  if (userType.value === USER_TYPE.STUDENT) {
    return basicFieldsValid && studentLevel.value;
  }

  return basicFieldsValid;
});

const handleRegister = async () => {
  if (!canSubmit.value) {
    if (!userType.value) {
      errorMessage.value = 'Please select whether you are a parent or student';
    } else if (!acceptTerms.value) {
      errorMessage.value = 'Please accept the terms and conditions';
    } else if (userType.value === USER_TYPE.STUDENT && !studentLevel.value) {
      errorMessage.value = 'Please select your current level';
    } else {
      errorMessage.value = 'Please fill in all required fields';
    }
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
    // Prepare onboarding data
    const onboardingData = {
      userType: userType.value,
      studentLevel: studentLevel.value || undefined,
    };

    // Only email registration is supported
    const response = await signUp(
      registerInput.value.trim(),
      password.value,
      firstName.value.trim(),
      lastName.value.trim(),
      onboardingData
    );
    console.log('Email registration successful:', response);

    if (response.user && !response.session) {
      successMessage.value = 'Account created! Please check your email for verification.';
    } else {
      successMessage.value = 'Account created successfully!';
      emit('success');
    }
  } catch (error: any) {
    console.error('Registration failed:', error);

    // TODO: Improve error message handling based on error type
    if (error.status === 409) {
      errorMessage.value = 'An account with this email already exists.';
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
