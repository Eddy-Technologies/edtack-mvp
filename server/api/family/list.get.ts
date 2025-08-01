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

    // Get user's user_info_id from all_users view
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, user_roles(role_id, roles(role_name))')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    let familyMembers = [];
    const isParent = userInfo.user_roles.some((role) => role.roles.role_name === 'PARENT');

    // Get user's groups (both active memberships and groups they created)
    const { data: userGroups, error: groupsError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        status,
        invited_at,
        joined_at,
        groups(
          id,
          name,
          group_type,
          created_by,
          group_members(
            id,
            user_info_id,
            status,
            is_creator,
            invited_at,
            joined_at,
            user_infos!group_members_user_info_id_fkey(
              id,
              first_name,
              last_name,
              email,
              is_active,
              user_credits(credit),
              user_roles(role_id, roles(role_name))
            )
          )
        )
      `)
      .eq('user_info_id', userInfo.id)
      .in('status', ['active', 'pending']);

    if (groupsError) {
      console.error('Failed to fetch groups:', groupsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch family members'
      });
    }

    // Extract family members from groups (both active and pending)
    const membersMap = new Map();
    
    userGroups?.forEach(userGroup => {
      // Only process family groups
      if (userGroup.groups.group_type !== 'family') return;
      
      userGroup.groups.group_members.forEach(member => {
        // Skip self
        if (member.user_info_id === userInfo.id) return;
        
        // Skip if already added (user might be in multiple groups)
        if (membersMap.has(member.user_info_id)) return;
        
        const userInfo = member.user_infos;
        const isParentMember = userInfo.user_roles.some(role => role.roles.role_name === 'PARENT');
        
        membersMap.set(member.user_info_id, {
          id: member.id, // Use group_member id for invitations
          user_info_id: member.user_info_id,
          userDisplayFullName: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
          email: userInfo.email,
          user_role: isParentMember ? 'parent' : 'student',
          status: member.status, // 'active' or 'pending'
          isActive: userInfo.is_active && member.status === 'active',
          credits: userInfo.user_credits?.credit || 0,
          invited_at: member.invited_at,
          joined_at: member.joined_at,
          created_at: member.joined_at || member.invited_at
        });
      });
    });
    
    familyMembers = Array.from(membersMap.values());

    return {
      success: true,
      familyMembers: familyMembers,
      isParent: isParent,
    };
  } catch (error) {
    console.error('Failed to fetch family members:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch family members'
    });
  }
});
