import { defineNuxtRouteMiddleware, navigateTo } from '#app';

export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();

  // If user is already authenticated, redirect them away from auth pages
  if (user.value) {
    return navigateTo('/chat/eddy/new');
  }
});
