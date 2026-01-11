import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { groupId } = body;

    if (!groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group ID is required'
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

    // Get user's user_info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, email, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Check if user has a pending invitation to this group (by user_info_id OR email)
    const { data: invitation, error: inviteError } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        user_info_id,
        invited_email,
        groups(
          name,
          group_type,
          created_by,
          created_by_info:user_infos!groups_created_by_fkey(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('group_id', groupId)
      .or(`user_info_id.eq.${userInfo.id},invited_email.ilike.${userInfo.email}`)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No pending invitation found for this group'
      });
    }

    // Update the invitation status to active and set user_info_id for email-based invites
    const { error: updateError } = await supabase
      .from('group_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString(),
        user_info_id: userInfo.id,  // Set user_info_id for email-based invitations
        invited_email: null         // Clear invited_email after linking
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Failed to accept invitation:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to accept invitation'
      });
    }

    return {
      success: true,
      message: `Successfully joined ${invitation.groups.name || 'the family group'}`,
      groupId,
      groupInfo: {
        id: groupId,
        name: invitation.groups.name,
        type: invitation.groups.group_type,
        parentName: `${invitation.groups.created_by_info.first_name} ${invitation.groups.created_by_info.last_name}`.trim(),
        parentEmail: invitation.groups.created_by_info.email
      }
    };
  } catch (error) {
    console.error('Failed to accept invitation:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to accept invitation'
    });
  }
});
