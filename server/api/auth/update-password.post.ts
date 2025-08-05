import { serverSupabaseUser } from '#supabase/server';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { validatePassword } from '~~/shared/utils';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const { currentPassword, newPassword, confirmPassword } = await readBody(event);

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Current password, new password, and confirm password are required.',
    });
  }

  if (newPassword !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New passwords do not match.',
    });
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: passwordValidation.error,
    });
  }

  try {
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      });
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Current password is incorrect.',
      });
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message || 'Failed to update password.',
      });
    }

    // Sign out user for security after successful password change
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('[update-password.post.ts] SignOut error after password update:', signOutError);
      // Don't throw error here - password was updated successfully, just log the signout issue
    }

    return {
      success: true,
      message: 'Password updated successfully. Please log in again.',
      requiresReauth: true
    };
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }

    console.error('[update-password.post.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while updating password.',
    });
  }
});
