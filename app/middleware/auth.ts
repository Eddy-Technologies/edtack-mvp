import type { User } from '@supabase/supabase-js'; // Good for type hinting
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseUser } from '#imports';

export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    console.log(`[Auth Middleware] User not authenticated. Redirecting to /login.`);
    return navigateTo('/login');
  }
});
