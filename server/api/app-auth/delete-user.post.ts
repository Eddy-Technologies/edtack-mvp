// This route handles deleting a user, whether they are an auth.users user or an app_user.
// It requires privileged access to perform deletions on auth.users or app_users.

import { privilegedSupabaseClient, privilegedSupabaseClientStub } from '../../utils/authConfig'; // Original import
import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event); // RLS-aware client (for fetching app_users and user_infos)
  const { user_info_id } = await readBody(event);

  if (!user_info_id) {
    throw createError({ statusCode: 400, statusMessage: 'User Info ID is required for deletion.' });
  }

  try {
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

    let deletionResult: any;
    let deletionError: any;

    // 2. Perform deletion based on authentication type
    if (userInfo.user_id) {
      // This is a Supabase Auth user (email/phone)
      console.log(`Attempting to delete auth.users user with ID: ${userInfo.user_id}`);
      const { data, error } = await privilegedSupabaseClient.auth.admin.deleteUser(userInfo.user_id);
      deletionResult = data;
      deletionError = error;
      if (deletionError) {
        console.error('Error deleting auth.users user:', deletionError);
        throw createError({ statusCode: 500, statusMessage: deletionError.message || 'Failed to delete Supabase Auth user.' });
      }
      console.log('Successfully deleted auth.users user:', userInfo.user_id);
    } else if (userInfo.app_user_id) {
      // This is a custom app_user (username/password)
      console.log(`Attempting to delete app_users user with ID: ${userInfo.app_user_id}`);
      const { error } = await privilegedSupabaseClient
        .from('app_users')
        .delete()
        .eq('id', userInfo.app_user_id);

      deletionError = error;
      if (deletionError) {
        console.error('Error deleting app_users user:', deletionError);
        throw createError({ statusCode: 500, statusMessage: deletionError.message || 'Failed to delete app user.' });
      }
      console.log('Successfully deleted app_users user:', userInfo.app_user_id);
    } else {
      // Should not happen due to user_infos CHECK constraint, but as a fallback
      throw createError({ statusCode: 400, statusMessage: 'User profile not linked to any authentication type.' });
    }

    // Due to ON DELETE CASCADE, deleting the auth.users or app_users record
    // will automatically delete the corresponding user_infos record and all its related data.
    return { message: `User with user_info_id ${user_info_id} and associated authentication record successfully deleted.` };
  } catch (err: any) {
    console.error('Server-side user deletion error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Internal server error during user deletion.',
    });
  }
});
