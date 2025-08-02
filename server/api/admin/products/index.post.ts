import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

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

    // Validate required fields
    const requiredFields = ['name', 'product_type', 'price_cents'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing required field: ${field}`
        });
      }
    }

    // Validate price
    if (!Number.isInteger(body.price_cents) || body.price_cents < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Price must be a positive integer (in cents)'
      });
    }

    // Prepare product data
    const productData = {
      name: body.name,
      description: body.description || null,
      product_type: body.product_type,
      price_cents: body.price_cents,
      currency: body.currency || 'SGD',
      image_url: body.image_url || null,
      category: body.category || null,
      stock_count: body.stock_count || 0,
      sku: body.sku || null,
      discount_percentage: body.discount_percentage || null,
      discount_amount_cents: body.discount_amount_cents || null,
      discount_start_date: body.discount_start_date || null,
      discount_end_date: body.discount_end_date || null,
      is_active: body.is_active !== false,
      metadata: body.metadata || {}
    };

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create product: ${error.message}`
      });
    }

    return {
      success: true,
      data: product
    };
  } catch (err: any) {
    console.error('Create product API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create product'
    });
  }
});
