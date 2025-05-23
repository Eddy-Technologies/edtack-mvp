import { useUsers } from '~/composables/useUsers';
import { useSupabaseUser } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
  const { currentAppUser } = useUsers();
  const supabaseUser = useSupabaseUser();

  // If a Supabase Auth user is logged in, they shouldn't be migrating an app_user account
  if (supabaseUser.value) {
    return navigateTo('/dashboard'); // Or their appropriate dashboard
  }

  if (!currentAppUser.value) {
    return navigateTo('/login'); // Redirect to login if not an app_user
  }
});
