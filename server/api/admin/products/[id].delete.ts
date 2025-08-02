import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
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

    // Check if product exists and has any orders
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      // Don't actually delete if there are orders, just deactivate
      const { data: product, error } = await supabase
        .from('products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
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
          statusMessage: `Failed to deactivate product: ${error.message}`
        });
      }

      return {
        success: true,
        message: 'Product deactivated (has existing orders)',
        data: product
      };
    } else {
      // Safe to delete if no orders exist
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          throw createError({
            statusCode: 404,
            statusMessage: 'Product not found'
          });
        }

        throw createError({
          statusCode: 500,
          statusMessage: `Failed to delete product: ${error.message}`
        });
      }

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    }
  } catch (err: any) {
    console.error('Delete product API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete product'
    });
  }
});
