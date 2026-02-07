import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useMeStore } from '~/stores/me';

/**
 * Check if a path is a public chat route (accessible without authentication)
 */
function isPublicChatRoute(path: string): boolean {
  return path.startsWith('/chat');
}

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const user = useSupabaseUser();
  const meStore = useMeStore();

  // Check if this is a public chat route
  const isPublicRoute = isPublicChatRoute(to.path);

  // Not authenticated
  if (!user.value) {
    // Allow access to public chat routes for anonymous users
    if (isPublicRoute) {
      return; // Allow anonymous access to chat
    }

    if (to.path !== '/login') {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  // User is authenticated - proceed with normal auth flow

  // Only fetch profile on client (SSR doesn't have auth cookies for API calls)
  if (import.meta.client && !meStore.user_role) {
    await meStore.refreshMe();
  }

  // On SSR, allow page to render - client will handle redirect
  if (import.meta.server) {
    return;
  }

  // Client-side checks below
  if (to.path === '/onboarding') {
    if (meStore.onboarding_completed) {
      return navigateTo('/chat/new');
    }
    return;
  }

  if (!meStore.user_role) {
    return navigateTo('/onboarding');
  }

  if (!meStore.onboarding_completed) {
    return navigateTo('/onboarding');
  }
});
