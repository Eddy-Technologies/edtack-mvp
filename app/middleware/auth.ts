import type { User } from '@supabase/supabase-js'; // Good for type hinting
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseUser } from '#imports';

export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();

  // --- GOOD FOR DEBUGGING, BUT REMOVE ALERTS FOR PRODUCTION ---
  console.log(`[Auth Middleware] Path: ${to.path}`);
  console.log(`[Auth Middleware] user.value:`, user.value ? user.value.email : 'null');
  // --- END DEBUG ALERTS ---

  if (!user.value) {
    // If user is NOT authenticated, redirect to login
    console.log(`[Auth Middleware] User not authenticated. Redirecting to /login.`);
    // alert(`User not authenticated, redirecting to login`); // Consider removing this alert for production
    return navigateTo('/login');
  }

  // If user IS authenticated, allow access
  const authenticatedUser: User = user.value; // Correct type assertion
  console.log(`[Auth Middleware] User authenticated: ${authenticatedUser.email}. Allowing access.`);
  // alert(`Welcome back! You are logged in as: ${authenticatedUser.email}`); // Consider removing this alert for production
});
