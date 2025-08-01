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

    // Get children from groups where user is a creator
    const { data: groupMembers, error: groupError } = await supabase
      .from('group_members')
      .select(`
        groups!inner(
          id,
          created_by,
          group_members!inner(
            user_info_id,
            status,
            user:user_infos(
              id,
              first_name,
              last_name,
              email,
              user_roles(
                role_id,
                roles(role_name)
              )
            )
          )
        )
      `)
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
    const children = [];
    const childrenMap = new Map();

    groupMembers?.forEach(groupMember => {
      const group = groupMember.groups;
      
      // Only process groups created by this user
      if (group.created_by === userInfo.id) {
        group.group_members.forEach(member => {
          // Skip self and inactive members
          if (member.user_info_id === userInfo.id || member.status !== 'active') {
            return;
          }

          // Check if this is a child (not a parent)
          const isParent = member.user.user_roles.some(role => role.roles.role_name === 'PARENT');
          
          if (!isParent && !childrenMap.has(member.user_info_id)) {
            childrenMap.set(member.user_info_id, {
              id: member.user.id,
              userDisplayFullName: `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim(),
              email: member.user.email
            });
          }
        });
      }
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