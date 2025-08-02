import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      });
    }

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

    // Validate price if provided
    if (body.price_cents !== undefined) {
      if (!Number.isInteger(body.price_cents) || body.price_cents < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Price must be a positive integer (in cents)'
        });
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.product_type !== undefined) updateData.product_type = body.product_type;
    if (body.price_cents !== undefined) updateData.price_cents = body.price_cents;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stock_count !== undefined) updateData.stock_count = body.stock_count;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.discount_percentage !== undefined) updateData.discount_percentage = body.discount_percentage;
    if (body.discount_amount_cents !== undefined) updateData.discount_amount_cents = body.discount_amount_cents;
    if (body.discount_start_date !== undefined) updateData.discount_start_date = body.discount_start_date;
    if (body.discount_end_date !== undefined) updateData.discount_end_date = body.discount_end_date;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update product: ${error.message}`
      });
    }

    return {
      success: true,
      data: product
    };
  } catch (err: any) {
    console.error('Update product API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product'
    });
  }
});
