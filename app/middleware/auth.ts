import { useSupabaseClient } from '~/composables/supabase/useUsers';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return navigateTo('/login');
  }

  if (!user) {
    return navigateTo('/login');
  }
});
