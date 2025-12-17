import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

export default defineNuxtRouteMiddleware(async () => {
  const meStore = useMeStore();

  // CLIENT SIDE - use store to avoid duplicate getUser() calls
  if (import.meta.client) {
    if (!meStore.isInitialized) {
      await meStore.waitForInitialization();
    }
    // If user is authenticated, redirect away from auth pages
    if (meStore.id) {
      return navigateTo('/eddy/new');
    }
    return;
  }

  // SERVER SIDE - must call getUser()
  const supabase = useSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return navigateTo('/eddy/new');
  }
});
