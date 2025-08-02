import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

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
