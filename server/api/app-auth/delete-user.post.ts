// This route handles deleting a user, whether they are an auth.users user or an app_user.
// It requires privileged access to perform deletions on auth.users or app_users.
import { getSupabaseClient, getPrivilegedSupabaseClient } from '../../utils/authConfig'; // Adjust the import path as needed

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event); // RLS-aware client for app_users and user_infos
  const { user_info_id } = await readBody(event);

  if (!user_info_id) {
    throw createError({ statusCode: 400, statusMessage: 'User Info ID is required for deletion.' });
  }

  try {
    // Initialize privileged client (runtime-safe)
    const privilegedSupabaseClient = getPrivilegedSupabaseClient(event);

    // 1. Fetch the user_infos record to determine the authentication type
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('user_id, app_user_id')
      .eq('id', user_info_id)
      .single();

    if (userInfoError || !userInfo) {
      console.error('Error fetching user_infos for deletion:', userInfoError);
      throw createError({ statusCode: 404, statusMessage: 'User profile not found.' });
    }

    // 2. Perform deletion based on authentication type
    if (userInfo.user_id) {
      // Supabase Auth user (email/phone)
      console.log(`Deleting auth.users user with ID: ${userInfo.user_id}`);
      const { error } = await privilegedSupabaseClient.auth.admin.deleteUser(userInfo.user_id);
      if (error) {
        console.error('Error deleting auth.users user:', error);
        throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to delete Supabase Auth user.' });
      }
    } else if (userInfo.app_user_id) {
      // Custom app_user (username/password)
      console.log(`Deleting app_users user with ID: ${userInfo.app_user_id}`);
      const { error } = await privilegedSupabaseClient
        .from('app_users')
        .delete()
        .eq('id', userInfo.app_user_id);
      if (error) {
        console.error('Error deleting app_users user:', error);
        throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to delete app user.' });
      }
    } else {
      // Fallback (should not happen)
      throw createError({ statusCode: 400, statusMessage: 'User profile not linked to any authentication type.' });
    }

    // ON DELETE CASCADE in DB handles cleanup
    return {
      message: `User with user_info_id ${user_info_id} and associated authentication record successfully deleted.`,
    };
  } catch (err: any) {
    console.error('Server-side user deletion error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal server error during user deletion.',
    });
  }
});
