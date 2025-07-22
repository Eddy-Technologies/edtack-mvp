import { getSupabaseClient } from '#imports';

/**
 * Get user info with customer details from Supabase
 */
export async function getUserWithCustomer(event: any, userId: string) {
  const supabase = await getSupabaseClient(event);

  const { data: userInfo, error: userError } = await supabase
    .from('user_infos')
    .eq('user_id', userId)
    .single();

  if (userError || !userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    });
  }

  return userInfo;
}
