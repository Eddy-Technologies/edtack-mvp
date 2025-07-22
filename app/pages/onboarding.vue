<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <AppIcon class="mx-auto h-12 w-auto" />
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Complete your profile
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Let's set up your account to personalize your experience
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Welcome Message with User Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-blue-800 font-medium">
                  Welcome{{ firstName ? `, ${firstName}` : '' }}!
                </p>
                <p class="text-blue-600 text-sm">
                  Your account has been created successfully.
                </p>
              </div>
            </div>
          </div>

          <form class="space-y-6" @submit.prevent="completeOnboarding">
            <!-- User Type Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Are you a parent or student? <span class="text-red-500">*</span>
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
                  <div class="text-center">
                    <div class="text-lg mb-1">👨‍👩‍👧‍👦</div>
                    <div>Parent</div>
                  </div>
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
                  <div class="text-center">
                    <div class="text-lg mb-1">🎓</div>
                    <div>Student</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Student Level (shown only for students) -->
            <div v-if="userRole === USER_ROLE.STUDENT" class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                What's your current level? <span class="text-red-500">*</span>
              </label>
              <USelect
                v-model="studentLevel"
                :disabled="isLoading"
                placeholder="Select your level"
                :options="levelOptions"
              />
            </div>

            <!-- Additional Info (Optional) -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-900">
                Additional Information (Optional)
              </h3>

              <!-- Name fields if not already filled -->
              <div v-if="!firstName || !lastName" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    v-model="firstNameInput"
                    type="text"
                    :placeholder="firstName || 'First Name'"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    :disabled="isLoading"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    v-model="lastNameInput"
                    type="text"
                    :placeholder="lastName || 'Last Name'"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    :disabled="isLoading"
                  >
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="flex items-start space-x-3">
              <input
                id="terms"
                v-model="acceptTerms"
                type="checkbox"
                class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                :disabled="isLoading"
              >
              <label for="terms" class="text-sm text-gray-700">
                I accept all
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 underline"
                >
                  terms and conditions
                </a>
              </label>
            </div>

            <!-- Complete Onboarding Button -->
            <Button
              type="submit"
              variant="primary"
              class="w-full py-3 rounded-xl font-semibold transition"
              :disabled="!canComplete"
              :loading="isLoading"
              :text="isLoading ? 'Setting up your account...' : 'Complete Setup'"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { USER_ROLE, STUDENT_LEVEL } from '~/constants/User';
import Button from '~/components/common/Button.vue';
import AppIcon from '~/components/AppIcon.vue';
import { useMeStore } from '~/stores/me';
import { useToast } from '#imports';

definePageMeta({
  layout: false,
  middleware: ['auth'] // Ensure user is authenticated
});

const router = useRouter();
const toast = useToast();
const me = useMeStore();

// Form state
const userRole = ref('');
const studentLevel = ref('');
const firstNameInput = ref('');
const lastNameInput = ref('');
const acceptTerms = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// User info from OAuth
const firstName = ref('');
const lastName = ref('');

// Level options for students
const levelOptions = computed(() => Object.entries(STUDENT_LEVEL).map(([key, value]) => ({
  value: key,
  label: value,
})));

// Form validation
const canComplete = computed(() => {
  const basicValid = userRole.value && acceptTerms.value && !isLoading.value;

  // If student, require level selection
  if (userRole.value === USER_ROLE.STUDENT) {
    return basicValid && studentLevel.value;
  }

  return basicValid;
});

// Initialize form with user data
onMounted(async () => {
  try {
    // Check if user already completed onboarding
    if (me && me.onboarding_completed) {
      router.push('/dashboard');
      return;
    }

    // Get fresh user data
    await me.fetchAndSetMe();

    if (me) {
      firstName.value = me.first_name || '';
      lastName.value = me.last_name || '';

      // If user somehow already has role/level, pre-fill
      if (me.user_role) {
        userRole.value = me.user_role;
      }
      if (me.level_type) {
        studentLevel.value = me.level_type;
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    errorMessage.value = 'Failed to load user information. Please refresh the page.';
  }
});

const completeOnboarding = async () => {
  if (!canComplete.value) {
    if (!userRole.value) {
      errorMessage.value = 'Please select whether you are a parent or student';
    } else if (userRole.value === USER_ROLE.STUDENT && !studentLevel.value) {
      errorMessage.value = 'Please select your current level';
    } else if (!acceptTerms.value) {
      errorMessage.value = 'Please accept the terms and conditions';
    }
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/auth/complete-onboarding', {
      method: 'POST',
      body: {
        userRole: userRole.value,
        studentLevel: userRole.value === USER_ROLE.STUDENT ? studentLevel.value : null,
        firstName: firstNameInput.value || firstName.value,
        lastName: lastNameInput.value || lastName.value,
        acceptTerms: acceptTerms.value
      }
    });

    toast.add({
      title: 'Welcome to Eddy!',
      description: 'Your account has been set up successfully.',
      color: 'green'
    });

    // Refresh user data and redirect to dashboard
    await me.fetchAndSetMe();
    router.push('/dashboard');
  } catch (error: any) {
    console.error('Onboarding failed:', error);
    errorMessage.value = error.data?.message || 'Failed to complete setup. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
