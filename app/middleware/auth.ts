import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';
import type { Database } from '~~/types/supabase';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient<Database>();
  const meStore = useMeStore();

  // CLIENT SIDE - use store to avoid duplicate getUser() calls
  if (import.meta.client) {
    // Always wait for store initialization first
    if (!meStore.isInitialized) {
      await meStore.waitForInitialization();
    }

    // Check auth status from store
    if (!meStore.id) {
      // Not authenticated - redirect to login
      if (to.path !== '/login') {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      }
      return;
    }

    // Authenticated - check onboarding status
    if (to.path === '/onboarding') return;
    if (!meStore.onboarding_completed) return navigateTo('/onboarding');
    return;
  }

  // SERVER SIDE - must call getUser() and query DB
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (to.path !== '/login') {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  if (to.path === '/onboarding') return;

  const { data: userInfo } = await supabase
    .from('user_infos')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!userInfo?.onboarding_completed) {
    return navigateTo('/onboarding');
  }
});
