import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Character slug is required'
      });
    }

    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: `Character with slug "${slug}" not found`
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
    console.error('Character by slug API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch character'
    });
  }
});
