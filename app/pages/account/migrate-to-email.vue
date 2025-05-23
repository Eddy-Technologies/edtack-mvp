<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Migrate to Email Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Secure your account by migrating to an email-based login. You will need to set a new password for your email account.
        </p>
      </div>
      <form v-if="isAppUserAuthenticated" class="mt-8 space-y-6" @submit.prevent="handleMigration">
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md">
          <p>{{ errorMessage }}</p>
        </div>
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 dark:bg-green-900 dark:bg-opacity-50 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-md">
          <p>{{ successMessage }}</p>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="new-email" class="sr-only">New Email address</label>
            <input
              id="new-email"
              v-model="newEmail"
              name="newEmail"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="New Email address"
            >
          </div>
          <div>
            <label for="current-password" class="sr-only">Current Password (for username account)</label>
            <input
              id="current-password"
              v-model="currentPassword"
              name="currentPassword"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Current Password (for username account)"
            >
          </div>
          <div>
            <label for="new-supabase-password" class="sr-only">New Password for Email Account</label>
            <input
              id="new-supabase-password"
              v-model="newSupabasePassword"
              name="newSupabasePassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="New Password for Email Account"
            >
          </div>
          <div>
            <label for="confirm-new-supabase-password" class="sr-only">Confirm New Password</label>
            <input
              id="confirm-new-supabase-password"
              v-model="confirmNewSupabasePassword"
              name="confirmNewSupabasePassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Confirm New Password"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading || !!successMessage"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            {{ isLoading ? 'Migrating...' : 'Migrate Account' }}
          </button>
        </div>
      </form>
      <div v-else class="text-center">
        <p class="text-red-600 dark:text-red-400">You must be logged in with a username account to perform this migration.</p>
        <NuxtLink to="/login" class="font-medium text-primary hover:text-primary-dark">
          Go to Login
        </NuxtLink>
      </div>
      <div class="text-sm text-center mt-4">
        <NuxtLink to="/dashboard" class="font-medium text-primary hover:text-primary-dark">
          Back to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUsers } from '~/composables/useUsers';
import { useRouter } from '#app';
import { useToast } from '#imports';

definePageMeta({
  middleware: 'auth-app-user-only', // Changed 'auth' to 'auth-app-user-only'
});

const { currentAppUser, logoutUsername } = useUsers();
const router = useRouter();
const toast = useToast();

const newEmail = ref('');
const currentPassword = ref('');
const newSupabasePassword = ref('');
const confirmNewSupabasePassword = ref('');

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const isAppUserAuthenticated = computed(() => !!currentAppUser.value);

const handleMigration = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  if (newSupabasePassword.value !== confirmNewSupabasePassword.value) {
    errorMessage.value = 'New passwords do not match.';
    return;
  }
  if (newSupabasePassword.value.length < 6) { // Basic client-side check
    errorMessage.value = 'New password for email account must be at least 6 characters long.';
    return;
  }

  isLoading.value = true;
  try {
    const response: any = await $fetch('/api/app-auth/migrate-to-email', {
      method: 'POST',
      body: {
        newEmail: newEmail.value,
        currentPassword: currentPassword.value,
        newSupabasePassword: newSupabasePassword.value,
      },
    });

    successMessage.value = response.message || 'Account migration initiated successfully. Please check your email.';
    toast.add({ title: 'Migration Success', description: successMessage.value, color: 'green', timeout: 10000 });

    await logoutUsername();

    setTimeout(() => { // Redirect after user has time to see the message
      router.push('/login');
    }, 5000);
  } catch (error: any) {
    console.error('Migration error on client:', error);
    const apiError = error.data || error;
    errorMessage.value = apiError?.statusMessage || apiError?.message || 'An unexpected error occurred during migration.';
    toast.add({ title: 'Migration Failed', description: errorMessage.value, color: 'red' });
  } finally {
    isLoading.value = false;
  }
};
</script>
