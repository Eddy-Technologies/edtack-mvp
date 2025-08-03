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

    // Get children from groups where user is inside
    const { data: groupMembers, error: groupError } = await supabase
      .from('group_members')
      .select('*, groups(*, group_members(*, user:user_infos!group_members_user_info_id_fkey(*, user_roles(*, roles(role_name)))))')
      .eq('user_info_id', userInfo.id)
      .eq('status', 'active');

    if (groupError) {
      console.error('Failed to fetch group members:', groupError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch children'
      });
    }

    // Extract children from groups where the current user is the creator
    const childrenMap = new Map<string, { id: string; name: string; email: string }>();

    // TODO: create a map of all children to avoid duplicates
    groupMembers.forEach((member) => {
      member.groups.group_members.forEach((member) => {
        if (member.user && member.user.user_roles.some((role) => role.roles?.role_name === 'STUDENT')) {
          if (!childrenMap.has(member.user_info_id)) {
            childrenMap.set(member.user_info_id, {
              id: member.user_info_id,
              name: `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || member.user.email,
              email: member.user.email
            });
          }
        }
      });
    });

    return {
      success: true,
      children: Array.from(childrenMap.values())
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
