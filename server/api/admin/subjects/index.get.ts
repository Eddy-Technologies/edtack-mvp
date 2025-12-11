import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    await requireAdmin(event);

    const includeInactive = query.includeInactive !== 'false';

    let dbQuery = supabase
      .from('subjects')
      .select('*')
      .order('display_name', { ascending: true });

    if (!includeInactive) {
      dbQuery = dbQuery.eq('is_active', true);
    }

    const { data: subjects, error } = await dbQuery;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch subjects: ${error.message}`
      });
    }

    return {
      success: true,
      data: subjects || [],
      count: subjects?.length || 0
    };
  } catch (err: any) {
    console.error('Admin subjects API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subjects'
    });
  }
});
