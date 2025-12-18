import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const supabase = useSupabaseClient<Database>();
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

  // If already on onboarding page, allow access
  if (to.path === '/onboarding') {
    console.log(
      `[Auth Middleware] User on onboarding page. Access granted.`
    );
    return;
  }

  // Check if user has completed onboarding
  const { data: userInfo } = await supabase
    .from('user_infos')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  // If user doesn't exist or hasn't completed onboarding, redirect to onboarding
  if (!userInfo || !userInfo.onboarding_completed) {
    console.log(
      `[Auth Middleware] User not onboarded. Redirecting to onboarding from ${to.path}`
    );
    return navigateTo('/onboarding');
  }

  // If user is authenticated and onboarded, allow access
  console.log(
    `[Auth Middleware] User authenticated and onboarded: ${user?.email}. Access to ${to.path} granted.`
  );
});
