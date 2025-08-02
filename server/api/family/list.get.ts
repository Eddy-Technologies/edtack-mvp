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

    // For non-parent users (students), first check if they have pending invitations
    if (!isParent) {
      const { data: pendingMemberships, error: pendingError } = await supabase
        .from('group_members')
        .select(`*, 
          groups(*)`)
        .eq('user_info_id', userInfo.id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Failed to fetch pending invitations:', pendingError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch pending invitations'
        });
      }

      // If student has pending invitations, return only those
      if (pendingMemberships && pendingMemberships.length > 0) {
        const pendingInvites = pendingMemberships
          .filter(membership => membership.groups.group_type === 'family')
          .map(membership => ({
            id: membership.id,
            group_id: membership.group_id,
            group_name: membership.groups.group_name,
            status: 'pending',
            invited_at: membership.invited_at,
            type: 'invitation'
          }));

        return {
          success: true,
          hasPendingInvitations: true,
          pendingInvitations: pendingInvites,
          familyMembers: [],
          isParent: false
        };
      }
    }

    // Get user's groups (both active memberships and groups they created)
    const { data: userGroups, error: groupsError } = await supabase
      .from('group_members')
      .select(`*, 
        groups(*, 
        members:group_members!group_id(*,
          user_infos!group_members_user_info_id_fkey(*, user_roles(*, roles(role_name)), user_credits(*))))`)
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

    userGroups?.forEach((userGroup) => {
      // Only process family groups
      if (userGroup.groups.group_type !== 'family') return;

      userGroup.groups.members.forEach((member) => {
        // Skip self
        if (member.user_info_id === userInfo.id) return;

        // Skip if already added (user might be in multiple groups)
        if (membersMap.has(member.user_info_id)) return;

        const memberUserInfo = member.user_infos;

        membersMap.set(member.user_info_id, {
          id: member.id, // Use group_member id for invitations
          user_info_id: member.user_info_id,
          userDisplayFullName: `${memberUserInfo.first_name || ''} ${memberUserInfo.last_name || ''}`.trim(),
          email: memberUserInfo.email,
          user_role: memberUserInfo.user_roles[0]?.roles.role_name, // Currently, we don't fetch member's role info, so default to student
          status: member.status, // 'active' or 'pending'
          credits: memberUserInfo.user_credits?.credit || 0,
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
