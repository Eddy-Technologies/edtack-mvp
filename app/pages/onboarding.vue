<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Logo in top left -->
    <div class="absolute top-4 left-4 z-10">
      <NuxtLink to="/" class="text-primary-600 hover:text-primary-500">
        <AppIcon class="w-12 h-12 mr-3" />
      </NuxtLink>
    </div>

    <!-- Two-column layout: Hero on left (1/3), Form on right (2/3) -->
    <div class="min-h-screen grid lg:grid-cols-3">
      <!-- Left Column: Marketing Hero (hidden on mobile) -->
      <div class="hidden lg:block lg:col-span-1">
        <LoginHero />
      </div>

      <!-- Right Column: Onboarding Form -->
      <div class="lg:col-span-2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          <div class="space-y-6">
            <!-- Header -->
            <div class="text-center">
              <h2 class="text-3xl font-bold tracking-tight text-gray-900">
                Complete your profile
              </h2>
              <p class="mt-2 text-sm text-gray-600">
                Let's set up your account to personalize your experience
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm">{{ errorMessage }}</p>
            </div>

            <!-- Onboarding Form -->
            <form class="space-y-4" @submit.prevent="completeOnboarding">
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
              <USelect
                v-if="userRole === USER_ROLE.STUDENT"
                v-model="studentLevel"
                :disabled="isLoading"
                placeholder="Select your level"
                :options="levelOptions"
                size="xl"
                :ui="{ rounded: 'rounded-xl' }"
              />

              <USelect
                v-if="userRole === USER_ROLE.STUDENT"
                v-model="syllabusType"
                :disabled="isLoading"
                placeholder="Select your syllabus"
                :options="syllabusOptions"
                size="xl"
                :ui="{ rounded: 'rounded-xl' }"
              />

              <!-- Optional student fields -->
              <input
                v-if="userRole === USER_ROLE.STUDENT"
                v-model="school"
                type="text"
                placeholder="School (optional)"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                :disabled="isLoading"
              >

              <input
                v-if="userRole === USER_ROLE.STUDENT"
                v-model="dateOfBirth"
                type="date"
                placeholder="Birthday (optional)"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                :disabled="isLoading"
                min="1900-01-01"
                @blur="enforceDobMin"
              >

              <!-- Name fields if not already filled (from OAuth) -->
              <div v-if="!firstName || !lastName" class="flex flex-row gap-4">
                <input
                  v-model="firstNameInput"
                  type="text"
                  placeholder="First Name"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  :disabled="isLoading"
                >
                <input
                  v-model="lastNameInput"
                  type="text"
                  placeholder="Last Name"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  :disabled="isLoading"
                >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { USER_ROLE } from '~/constants/User';
import Button from '~/components/common/Button.vue';
import AppIcon from '~/components/AppIcon.vue';
import LoginHero from '~/components/login/LoginHero.vue';
import { useMeStore } from '~/stores/me';
import { useToast } from '#imports';

definePageMeta({
  layout: false,
  middleware: ['auth']
});

const toast = useToast();
const me = useMeStore();

// Form state
const userRole = ref('');
const studentLevel = ref('');
const syllabusType = ref('');
const dateOfBirth = ref('');
const school = ref('');
const firstNameInput = ref('');
const lastNameInput = ref('');
const acceptTerms = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// User info from OAuth
const firstName = ref('');
const lastName = ref('');

// Options fetched from API
const levelOptions = ref([]);
const syllabusOptions = ref([]);
const optionsLoading = ref(false);

// Enforce DOB minimum (1900-01-01) on blur
const enforceDobMin = () => {
  if (dateOfBirth.value && dateOfBirth.value < '1900-01-01') {
    dateOfBirth.value = '1900-01-01';
  }
};

// Form validation
const canComplete = computed(() => {
  const basicValid = userRole.value && acceptTerms.value && !isLoading.value;

  if (userRole.value === USER_ROLE.STUDENT) {
    return basicValid && studentLevel.value && syllabusType.value;
  }

  return basicValid;
});

// Initialize form with user data
onMounted(async () => {
  try {
    optionsLoading.value = true;

    // Fetch profile and options in parallel
    const [levelsResponse, syllabusResponse] = await Promise.all([
      $fetch('/api/options/levels'),
      $fetch('/api/options/syllabus'),
      me.refreshMe()
    ]);

    // Check AFTER refreshMe - redirect if already onboarded
    if (me.onboarding_completed) {
      await navigateTo('/dashboard');
      return;
    }

    levelOptions.value = levelsResponse.levels || [];
    syllabusOptions.value = syllabusResponse.syllabus || [];
    optionsLoading.value = false;

    if (me) {
      firstName.value = me.first_name || '';
      lastName.value = me.last_name || '';

      if (me.user_role) {
        userRole.value = me.user_role;
      }
      if (me.level_type) {
        studentLevel.value = me.level_type;
      }
      if (me.syllabus_type) {
        syllabusType.value = me.syllabus_type;
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
    errorMessage.value = 'Failed to load user information. Please refresh the page.';
    optionsLoading.value = false;
  }
});

const completeOnboarding = async () => {
  if (!canComplete.value) {
    if (!userRole.value) {
      errorMessage.value = 'Please select whether you are a parent or student';
    } else if (userRole.value === USER_ROLE.STUDENT && !studentLevel.value) {
      errorMessage.value = 'Please select your current level';
    } else if (userRole.value === USER_ROLE.STUDENT && !syllabusType.value) {
      errorMessage.value = 'Please select your syllabus';
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
        syllabusType: userRole.value === USER_ROLE.STUDENT ? syllabusType.value : null,
        dateOfBirth: userRole.value === USER_ROLE.STUDENT && dateOfBirth.value ? dateOfBirth.value : null,
        school: userRole.value === USER_ROLE.STUDENT && school.value ? school.value.trim() : null,
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

    await me.refreshMe();
    await navigateTo('/dashboard');
  } catch (error: any) {
    console.error('Onboarding failed:', error);
    errorMessage.value = error.data?.message || 'Failed to complete setup. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
