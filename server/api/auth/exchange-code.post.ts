import { getSupabaseClient } from '#imports';

interface exchangeCodeForSessionRes {
  success: boolean;
  onboardingCompleted: boolean;
}

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  try {
    const body = await readBody(event);
    if (!body.code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Authorization code is required'
      });
    }

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(body.code);

    if (!user || error?.message) {
      throw createError({
        statusCode: 400,
        statusMessage: error?.message
      });
    }

    // Get userInfo from user_infos table
    const { data: userInfo } = await supabase
      .from('user_infos')
      .select('*')
      .eq('userId', user.id)
      .single();

    return {
      success: true,
      onboardingCompleted: userInfo?.onboarding_completed ?? false,
    } as exchangeCodeForSessionRes;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to exchange code for session'
    });
  }
});
