import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useMeStore } from '~/stores/me';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const user = useSupabaseUser();
  const meStore = useMeStore();

  // Not authenticated
  if (!user.value) {
    if (to.path !== '/login') {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

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
      return navigateTo('/chat/eddy/new');
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
