import { getSupabaseClient } from '#imports';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
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
    await requireAdmin(event);

    if (!userInfo?.user_roles?.[0]?.role_name || userInfo.user_roles[0].role_name !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    // Validate display_order if provided
    if (body.display_order !== undefined && (!Number.isInteger(body.display_order) || body.display_order < 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Display order must be a non-negative integer'
      });
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.voice_config !== undefined) updateData.voice_config = body.voice_config;
    if (body.animation_config !== undefined) updateData.animation_config = body.animation_config;
    if (body.personality_prompt !== undefined) updateData.personality_prompt = body.personality_prompt;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;

    // Update character
    const { data: character, error } = await supabase
      .from('characters')
      .update(updateData)
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
        statusMessage: `Failed to update character: ${error.message}`
      });
    }

    return {
      success: true,
      data: character
    };
  } catch (err: any) {
    console.error('Update character API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update character'
    });
  }
});
