import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseClient } from '#imports';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user) {
    console.log(
      `[Auth Middleware] User not authenticated. Redirecting to login from ${to.path}`
    );

    // Prevent redirect loop if already on login page
    if (to.path !== '/login') {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  // If user is authenticated, allow access
  console.log(
    `[Auth Middleware] User authenticated: ${user?.email}. Access to ${to.path} granted.`
  );
});
