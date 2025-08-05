import { serverSupabaseUser } from '#supabase/server';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { validateEmail } from '~~/shared/utils';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const { newEmail, confirmEmail, password } = await readBody(event);

  if (!newEmail || !confirmEmail || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'New email, confirm email, and current password are required.',
    });
  }

  if (newEmail !== confirmEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email addresses do not match.',
    });
  }

  const emailValidation = validateEmail(newEmail);
  if (!emailValidation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: emailValidation.error,
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

    // Check if new email is the same as current email
    if (newEmail === user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New email must be different from current email'
      });
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (verifyError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Current password is incorrect.',
      });
    }

    // Update email
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message || 'Failed to update email.',
      });
    }

    // Sign out user for security after successful email change request
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('[update-email.post.ts] SignOut error after email update:', signOutError);
      // Don't throw error here - email update was successful, just log the signout issue
    }

    return {
      success: true,
      message: 'A verification email has been sent to your new email address. Please check your inbox and verify to complete the change. You have been logged out for security.',
      requiresReauth: true
    };
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }

    console.error('[update-email.post.ts] Unexpected error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while updating email.',
    });
  }
});
