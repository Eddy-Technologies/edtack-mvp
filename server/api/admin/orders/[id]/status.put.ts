import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
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

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!body.status || !validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: body.status,
        tracking_number: body.tracking_number || null,
        notes: body.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update order: ${error.message}`
      });
    }

    return {
      success: true,
      data: order,
      message: 'Order status updated successfully'
    };
  } catch (err: any) {
    console.error('Update order status API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update order status'
    });
  }
});
