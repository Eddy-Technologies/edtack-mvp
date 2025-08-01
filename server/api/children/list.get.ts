import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Get children linked to this parent
    const { data: children, error: childrenError } = await supabase
      .from('parent_child')
      .select(`
        child_user_info_id,
        child:user_infos!parent_child_child_user_info_id_fkey(
          id,
          userDisplayFullName,
          email
        )
      `)
      .eq('parent_user_info_id', userInfo.id);

    if (childrenError) {
      console.error('Failed to fetch children:', childrenError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch children'
      });
    }

    // Format the response
    const formattedChildren = children?.map((item) => ({
      id: item.child.id,
      userDisplayFullName: item.child.userDisplayFullName,
      email: item.child.email
    })) || [];

    return {
      success: true,
      children: formattedChildren
    };
  } catch (error) {
    console.error('Failed to fetch children:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch children'
    });
  }
});
