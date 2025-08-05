import { getSupabaseClient } from '#imports';
import { requireAdmin } from '~~/server/utils/auth';

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
    await requireAdmin(event);

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
