import { getSupabaseClient } from '#imports';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    // Check if user is admin
    await requireAdmin(event);

    // Validate required fields
    const requiredFields = ['name', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing required field: ${field}`
        });
      }
    }

    // Validate display_order
    if (body.display_order !== undefined && (!Number.isInteger(body.display_order) || body.display_order < 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Display order must be a non-negative integer'
      });
    }

    // Prepare character data
    const characterData = {
      name: body.name,
      type: body.type,
      description: body.description || null,
      image_url: body.image_url || null,
      voice_config: body.voice_config || {},
      animation_config: body.animation_config || {},
      personality_prompt: body.personality_prompt || null,
      is_active: body.is_active !== false,
      display_order: body.display_order || 0
    };

    // Create character
    const { data: character, error } = await supabase
      .from('characters')
      .insert(characterData)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create character: ${error.message}`
      });
    }

    return {
      success: true,
      data: character
    };
  } catch (err: any) {
    console.error('Create character API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create character'
    });
  }
});
