<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
      <div v-if="!error" class="space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
        <h2 class="text-xl font-semibold text-gray-900">Completing authentication...</h2>
        <p class="text-gray-600">Please wait while we sign you in.</p>
      </div>

      <div v-else class="space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            class="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Authentication Failed</h2>
        <p class="text-red-600">{{ error }}</p>
        <button
          class="mt-4 w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          @click="router.push('/login')"
        >
          Return to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSupabaseUser } from '#imports';
import { useMeStore } from '~/stores/me';

definePageMeta({
  layout: false
});

const router = useRouter();
const route = useRoute();
const user = useSupabaseUser();
const { fetchAndSetMe } = useMeStore();

const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // Check for error in URL params (common OAuth error pattern)
    if (route.query.error) {
      error.value = route.query.error_description as string || 'Authentication failed';
      return;
    }

    // Wait a moment for Supabase to process the auth state
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (user.value) {
      try {
        // For OAuth users, ensure user profile exists in our database
        const setupResponse = await $fetch('/api/auth/oauth-setup', { method: 'POST' });

        // User is authenticated and profile is set up, fetch their profile
        await fetchAndSetMe();

        const onboardingRequired = (setupResponse as any)?.onboarding_required ?? false;
        // Check if user needs onboarding (new OAuth user)
        if (onboardingRequired) {
          // New OAuth user needs to complete onboarding
          router.push('/onboarding');
        } else {
          // Existing user or onboarding already completed
          const redirectTo = (route.query.redirect as string) || '/dashboard';
          router.push(redirectTo);
        }
      } catch (setupError: any) {
        console.error('OAuth setup error:', setupError);
        error.value = setupError.data?.message || 'Failed to set up user profile. Please try again.';
      }
    } else {
      // No user found after waiting, might be an error
      error.value = 'Authentication was not completed. Please try again.';
    }
  } catch (err: any) {
    console.error('Auth callback error:', err);
    error.value = err.message || 'An unexpected error occurred during authentication.';
  }
});
</script>
