import { getSupabaseClient } from '~~/server/utils/authConfig';
import { serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const body = await readBody(event);

  try {
    // Get the authenticated user
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    // Validate required fields
    if (!body.userRole) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User role is required'
      });
    }

    if (body.userRole === 'STUDENT' && !body.studentLevel) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Student level is required for student accounts'
      });
    }

    if (!body.acceptTerms) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Terms and conditions must be accepted'
      });
    }

    // Get user's current user_infos record
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('id, onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (userInfoError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User profile not found'
      });
    }

    // Check if onboarding already completed
    if (userInfo.onboarding_completed) {
      return {
        message: 'Onboarding already completed',
        user_info_id: userInfo.id
      };
    }

    // Prepare update data
    const updateData: any = {
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

    // Update name fields if provided
    if (body.firstName) {
      updateData.first_name = body.firstName.trim();
    }
    if (body.lastName) {
      updateData.last_name = body.lastName.trim();
    }

    // Add student level if user is a student
    if (body.userRole === 'STUDENT' && body.studentLevel) {
      updateData.level_type = body.studentLevel;
    }

    // Update user_infos record
    const { error: updateError } = await supabase
      .from('user_infos')
      .update(updateData)
      .eq('id', userInfo.id);

    if (updateError) {
      console.error('Error updating user_infos:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user profile'
      });
    }

    // Get the role ID for the selected user role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', body.userRole)
      .single();

    if (roleError || !role) {
      console.error('Error finding role:', roleError);
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user role'
      });
    }

    // Check if user_roles record already exists
    const { data: existingUserRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_info_id', userInfo.id)
      .single();

    if (existingUserRole) {
      // Update existing role
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({
          role_id: role.id,
          updated_at: new Date().toISOString()
        })
        .eq('user_info_id', userInfo.id);

      if (roleUpdateError) {
        console.error('Error updating user role:', roleUpdateError);
        // Don't throw error here as main profile was updated successfully
      }
    } else {
      // Create new user_roles record
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert({
          user_info_id: userInfo.id,
          role_id: role.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (roleInsertError) {
        console.error('Error creating user role:', roleInsertError);
        // Don't throw error here as main profile was updated successfully
      }
    }

    return {
      message: 'Onboarding completed successfully',
      user_info_id: userInfo.id,
      user_role: body.userRole,
      student_level: body.studentLevel || null,
      onboarding_completed: true
    };
  } catch (err: any) {
    // If the error is already a H3Error (from createError), re-throw it
    if (err.statusCode) {
      throw err;
    }
    console.error('[complete-onboarding.post.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred during onboarding completion.',
    });
  }
});
