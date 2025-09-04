import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    // Check if user is admin
    await requireAdmin(event);

    // Get all products (including inactive ones for admin)
    const includeInactive = query.includeInactive !== 'false';

    let dbQuery = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      dbQuery = dbQuery.eq('is_active', true);
    }

    const { data: products, error } = await dbQuery;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch products: ${error.message}`
      });
    }

    return {
      success: true,
      data: products || [],
      count: products?.length || 0
    };
  } catch (err: any) {
    console.error('Admin products API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    });
  }
});
