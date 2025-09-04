import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    // Check if user is admin
    await requireAdmin(event);

    // Build query
    let ordersQuery = supabase
      .from('orders')
      .select(`
        *,
        user_infos(first_name, last_name, email),
        order_items(
          id,
          product_id,
          quantity,
          unit_price_cents,
          total_price_cents,
          products(name, image_url)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (query.status) {
      ordersQuery = ordersQuery.eq('status', query.status);
    }

    if (query.limit) {
      ordersQuery = ordersQuery.limit(parseInt(query.limit));
    } else {
      ordersQuery = ordersQuery.limit(50); // Default limit
    }

    if (query.offset) {
      ordersQuery = ordersQuery.range(
        parseInt(query.offset),
        parseInt(query.offset) + (parseInt(query.limit) || 50) - 1
      );
    }

    const { data: orders, error } = await ordersQuery;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch orders: ${error.message}`
      });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    return {
      success: true,
      data: orders || [],
      count: orders?.length || 0,
      total: count || 0
    };
  } catch (err: any) {
    console.error('Admin orders API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders'
    });
  }
});
