import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { invitationId } = body;

    if (!invitationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invitation ID is required'
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

    // Get user's user_info_id and verify they are a parent
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

    const isParent = userInfo.user_roles.some((role) => role.roles.role_name === 'PARENT');
    if (!isParent) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only parents can cancel invitations'
      });
    }

    // Verify the invitation exists and was sent by this parent
    const { data: invitation, error: inviteError } = await supabase
      .from('group_members')
      .select(`
        id,
        status,
        invited_by,
        groups(created_by)
      `)
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invitation not found or already processed'
      });
    }

    // Check if the user is authorized to cancel (either invited by them or created the group)
    if (invitation.invited_by !== userInfo.id && invitation.groups.created_by !== userInfo.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not authorized to cancel this invitation'
      });
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('group_members')
      .delete()
      .eq('id', invitationId);

    if (deleteError) {
      console.error('Failed to cancel invitation:', deleteError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to cancel invitation'
      });
    }

    return {
      success: true,
      message: 'Invitation cancelled successfully'
    };
  } catch (error) {
    console.error('Failed to cancel invitation:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cancel invitation'
    });
  }
});
