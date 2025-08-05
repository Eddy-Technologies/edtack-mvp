import { getSupabaseClient } from '#imports';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    // Check if user is admin
    await requireAdmin(event);

    // Get all characters (including inactive ones for admin)
    const includeInactive = query.includeInactive !== 'false';

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
    console.error('Admin characters API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch characters'
    });
  }
});
