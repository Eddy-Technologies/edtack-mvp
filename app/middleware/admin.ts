import { useSupabaseClient, useSupabaseUser } from '#imports';
import type { Database } from '~~/types/supabase';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Check if user is authenticated first
  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();

  if (!user.value) {
    // User not authenticated, redirect to login
    return navigateTo('/login');
  }
  // Check admin status via API call to be safe
  try {
    const { data } = await supabase
      .from('user_infos')
      .select('user_roles(role_name)')
      .eq('user_id', user.value.id)
      .single();
    console.log('Admin check data:', data);

    if (!data || data.user_roles[0]?.role_name !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied: Admin privileges required'
      });
    }
  } catch (error) {
    // If API call fails or user is not admin
    if (error.statusCode === 403) {
      throw error;
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Unable to verify admin privileges'
    });
  }
});
