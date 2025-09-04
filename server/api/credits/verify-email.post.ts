import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const { email } = body;

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      });
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    const { data: allUser } = await supabase
      .from('all_users')
      .select('email, user_info_id, level_type')
      .eq('email', email)
      .single();

    if (!allUser || !allUser.user_info_id || !allUser.level_type || allUser.email === user.email) {
      return;
    }
    return email;

    // Check if this user is already a child of the current parent
    // Commenting this out for now as it child can have multiple parent or guardians
    // const { data: parentUserInfo } = await supabase
    //   .from('user_infos')
    //   .select('id')
    //   .eq('user_id', user.id)
    //   .single();

    // if (!parentUserInfo) {
    //   throw createError({
    //     statusCode: 404,
    //     statusMessage: 'Parent user info not found'
    //   });
    // }
  } catch (error) {
    console.error('Failed to verify email:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify email'
    });
  }
});
