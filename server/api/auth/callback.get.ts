import { getSupabaseClient } from '~~/server/utils/authConfig';

// This file handles the OAuth callback from an external authentication provider
export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  try {
    const query = getQuery(event);
    const code = query.code;
    console.log('Authorization code received:', code);

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No authorization code provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code as string);

    if (!user || error) {
      throw createError({
        statusCode: 400,
        statusMessage: error?.message
      });
    }

    // get user_infos from user_id
    const { data: userInfo } = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Set session cookies (this happens automatically with serverSupabaseClient)
    // Redirect to protected page or dashboard
    if (userInfo?.onboarding_completed) {
      await sendRedirect(event, '/dashboard', 302);
    } else {
      await sendRedirect(event, '/onboarding', 302);
    }
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
