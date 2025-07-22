import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseClient } from '#imports';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already authenticated, redirect them away from auth pages
  if (user) {
    return navigateTo('/dashboard');
  }
});
