import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseUser } from '#imports';
import { useUsers } from '~/composables/useUsers'; // Import your custom useUsers composable

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabaseUser = useSupabaseUser(); // Supabase Auth user (email/OAuth)
  const { currentAppUser } = useUsers(); // Your custom app_user

  // Ensure app_user state is hydrated on client-side before checking
  // This is crucial because `currentAppUser` is populated by an `onMounted` hook
  // in `useUsers`, which runs after the initial middleware check on client navigation.
  // For server-side rendering, `currentAppUser` will be null initially,
  // but the /api/app-auth/me call in onMounted will rehydrate it.
  // For client-side navigation, we need to wait for `currentAppUser` to be ready.

  // If on client and appUser is not yet hydrated, wait for it.
  // This is a common pattern for client-side-only session checks.
  if (import.meta.client && !currentAppUser.value) {
    try {
      // Attempt to fetch app user info from server to rehydrate state
      // This will set currentAppUser.value if a valid cookie is present
      const response: { user: any; type: string } = await $fetch('/api/app-auth/me');
      if (response.user && response.type === 'app_user') {
        currentAppUser.value = response.user; // Manually set it for immediate use in middleware
      }
    } catch (error) {
      console.warn(
        'Middleware: No active app user session during client-side rehydration attempt.'
      );
      // Error means no session or invalid, so currentAppUser remains null
    }
  }

  // Check if either type of user is authenticated
  if (!supabaseUser.value && !currentAppUser.value) {
    console.log(
      `[Auth Middleware] Neither Supabase user nor App user authenticated. Redirecting to /login.`
    );
    // Ensure we are not already on the login page to prevent infinite redirects
    if (to.path !== '/login') {
      return navigateTo('/');
    }
  }
  // If either is authenticated, allow access
  console.log(
    `[Auth Middleware] User authenticated. Supabase User: ${!!supabaseUser.value}, App User: ${!!currentAppUser.value}`
  );
});
