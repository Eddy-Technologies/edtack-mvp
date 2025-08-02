import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Character ID is required'
      });
    }

    // Convert id to number
    const characterId = parseInt(id);
    if (isNaN(characterId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid character ID'
      });
    }

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    // Get user role
    const { data: userInfo } = await supabase
      .from('user_infos')
      .select('user_roles(role_name)')
      .eq('user_id', user.id)
      .single();

    if (!userInfo?.user_roles?.[0]?.role_name || userInfo.user_roles[0].role_name !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    // For characters, we should generally deactivate instead of delete
    // since they might be referenced in chat history, etc.
    const { data: character, error } = await supabase
      .from('characters')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Character not found'
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to deactivate character: ${error.message}`
      });
    }

    return {
      success: true,
      message: 'Character deactivated successfully',
      data: character
    };
  } catch (err: any) {
    console.error('Delete character API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete character'
    });
  }
});
