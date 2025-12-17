import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

export default defineNuxtRouteMiddleware(async () => {
  const meStore = useMeStore();

  // CLIENT SIDE - use store to avoid duplicate getUser() calls
  if (import.meta.client) {
    if (!meStore.isInitialized) {
      await meStore.waitForInitialization();
    }

    if (!meStore.id) {
      return navigateTo('/login');
    }

    if (meStore.user_role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied: Admin privileges required'
      });
    }
    return;
  }

  // SERVER SIDE - must call getUser() and query DB
  const supabase = useSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return navigateTo('/login');
  }

  const { data: userInfo } = await supabase
    .from('user_infos')
    .select('user_roles(role_name)')
    .eq('user_id', user.id)
    .single();

  if (!userInfo || userInfo.user_roles[0]?.role_name !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin privileges required'
    });
  }
});
