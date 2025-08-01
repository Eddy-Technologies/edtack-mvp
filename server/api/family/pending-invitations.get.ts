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
      .select('id, first_name, last_name, email')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Get pending invitations for this user
    const { data: invitations, error: invitationsError } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        invited_at,
        groups(
          name,
          description,
          group_type,
          created_by,
          created_by_info:user_infos!groups_created_by_fkey(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('user_info_id', userInfo.id)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (invitationsError) {
      console.error('Failed to fetch invitations:', invitationsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch invitations'
      });
    }

    const formattedInvitations = invitations?.map(invitation => ({
      id: invitation.id,
      groupId: invitation.group_id,
      groupName: invitation.groups.name,
      groupType: invitation.groups.group_type,
      description: invitation.groups.description,
      parentName: `${invitation.groups.created_by_info.first_name} ${invitation.groups.created_by_info.last_name}`.trim(),
      parentEmail: invitation.groups.created_by_info.email,
      invitedAt: invitation.invited_at
    })) || [];

    return {
      success: true,
      invitations: formattedInvitations
    };
  } catch (error) {
    console.error('Failed to fetch pending invitations:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch pending invitations'
    });
  }
});