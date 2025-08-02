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

    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
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
        statusMessage: `Failed to fetch character: ${error.message}`
      });
    }

    return {
      success: true,
      data: character
    };
  } catch (err: any) {
    console.error('Character API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch character'
    });
  }
});
