import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    // Get only active characters or all characters based on query parameter
    const includeInactive = query.includeInactive === 'true';

    let dbQuery = supabase
      .from('characters')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      dbQuery = dbQuery.eq('is_active', true);
    }

    const { data: characters, error } = await dbQuery;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch characters: ${error.message}`
      });
    }

    return {
      success: true,
      data: characters || [],
      count: characters?.length || 0
    };
  } catch (err: any) {
    console.error('Characters API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch characters'
    });
  }
});
