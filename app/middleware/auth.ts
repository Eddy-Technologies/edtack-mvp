import { useSupabaseUser } from '@supabase/auth-helpers-nuxt';

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo('/login'); // Redirect to login page
  }
});
