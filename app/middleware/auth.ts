import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseUser } from '#imports';

export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();

  // Check if user is authenticated
  if (!user.value) {
    console.log(
      `[Auth Middleware] User not authenticated. Redirecting to home from ${to.path}`
    );

    // Prevent redirect loop if already on home page
    if (to.path !== '/') {
      return navigateTo('/');
    }
  }

  // If user is authenticated, allow access
  console.log(
    `[Auth Middleware] User authenticated: ${user.value?.email}. Access to ${to.path} granted.`
  );
});
