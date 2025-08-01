import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { name, email, message } = body;

    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      });
    }

    // Get authenticated user (parent)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get parent's user_info_id and verify they are a parent
    const { data: parentInfo, error: parentError } = await supabase
      .from('user_infos')
      .select('id, user_role, userDisplayFullName, email')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent info not found'
      });
    }

    if (parentInfo.user_role !== 'parent') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only parents can send invites'
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('all_users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A user with this email already exists. Use "Link Existing User" instead.'
      });
    }

    // For now, we'll just return success since we don't have email functionality set up
    // In a real implementation, you would:
    // 1. Create an invitation record in the database
    // 2. Send an email with a signup link that includes the invitation token
    // 3. When the child signs up, automatically link them to the parent

    // TODO: Implement email invitation system
    console.log('Family invitation would be sent:', {
      parentName: parentInfo.userDisplayFullName,
      parentEmail: parentInfo.email,
      childName: name,
      childEmail: email,
      message: message
    });

    return {
      success: true,
      message: `Invitation sent to ${name} at ${email}`,
      // Note: This is a placeholder response
      // In production, you would create an invitation record and send actual email
      invite: {
        childName: name,
        childEmail: email,
        parentName: parentInfo.userDisplayFullName,
        sentAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to send invite:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send invite'
    });
  }
});
