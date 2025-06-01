import { defineNuxtRouteMiddleware, navigateTo } from '#app'; // Added defineNuxtRouteMiddleware and navigateTo
import { useSupabaseUser } from '#imports';
import { useUsers } from '~/composables/useUsers';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // Changed to async
  const { currentAppUser } = useUsers();
  const supabaseUser = useSupabaseUser();

  // Client-side rehydration for currentAppUser
  if (import.meta.client && !currentAppUser.value) {
    try {
      const response: { user: any; type: string } = await $fetch('/api/app-auth/me');
      if (response.user && response.type === 'app_user') {
        currentAppUser.value = response.user;
        console.log('[AuthAppUserOnly Middleware] App user session re-hydrated:', response.user.id);
      }
    } catch (error) {
      console.warn(
        '[AuthAppUserOnly Middleware] No active app user session during client-side rehydration attempt or error fetching /me:',
        error
      );
      // currentAppUser remains null or undefined
    }
  }

  // If a Supabase Auth user is logged in, they shouldn't be on an app_user only page
  if (supabaseUser.value) {
    // Allow navigation away from login if a supabase user is somehow on the login page
    // and tries to go to a page that hits this middleware (e.g. /account/migrate-to-email)
    // otherwise they might get stuck in a redirect loop if /dashboard also uses this middleware.
    // For now, assume /dashboard is safe or uses a different middleware.
    if (to.path !== '/dashboard') {
      return navigateTo('/dashboard');
    }
  }

  // After rehydration attempt, if still no currentAppUser, redirect to login
  if (!currentAppUser.value) {
    // Prevent redirect loop if already on login page
    if (to.path !== '/login') {
      return navigateTo('/login');
    }
  }
  // If currentAppUser.value exists (and not a supabaseUser), allow access
  console.log(
    `[AuthAppUserOnly Middleware] App User: ${!!currentAppUser.value}, Supabase User: ${!!supabaseUser.value}. Access to ${to.path} determined.`
  );
});
