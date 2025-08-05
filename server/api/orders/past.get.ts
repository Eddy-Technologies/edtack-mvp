import { getSupabaseClient } from '#imports';
import { getUserInfo } from '~~/server/utils/auth';
import { ORDER_STATUS, ORDER_FULFILLMENT } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const { limit = 50, offset = 0 } = query;

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Past orders are those in final states (completed, cancelled, refunded, delivered)
    const pastStatuses = [ORDER_FULFILLMENT.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED];

    // Get past orders for this user
    const { data: pastOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status_code,
        total_amount_cents,
        currency,
        payment_method,
        created_at,
        updated_at,
        pending_at,
        paid_at,
        confirmed_at,
        notes,
        order_items(
          id,
          quantity,
          unit_price_cents,
          total_price_cents,
          status_code,
          tracking_number,
          external_status,
          shipped_at,
          delivered_at,
          product:products(
            id,
            name,
            description,
            image_url,
            category
          )
        )
      `)
      .eq('user_info_id', userInfo.id)
      .in('status_code', pastStatuses)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (ordersError) {
      console.error('Failed to fetch past orders:', ordersError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch past orders'
      });
    }

    // Format the response
    const formattedOrders = pastOrders?.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status_code,
      totalAmountCents: order.total_amount_cents,
      totalAmountSGD: (order.total_amount_cents / 100).toFixed(2),
      currency: order.currency || 'SGD',
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      pendingAt: order.pending_at,
      paidAt: order.paid_at,
      confirmedAt: order.confirmed_at,
      notes: order.notes,
      items: order.order_items?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        unitPriceSGD: (item.unit_price_cents / 100).toFixed(2),
        totalPriceCents: item.total_price_cents,
        totalPriceSGD: (item.total_price_cents / 100).toFixed(2),
        status: item.status_code,
        trackingNumber: item.tracking_number,
        externalStatus: item.external_status,
        shippedAt: item.shipped_at,
        deliveredAt: item.delivered_at,
        product: {
          id: item.product?.id,
          name: item.product?.name,
          description: item.product?.description,
          imageUrl: item.product?.image_url,
          category: item.product?.category
        }
      })) || [],
      itemCount: order.order_items?.length || 0,
      totalQuantity: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      wasDelivered: order.order_items?.some((item) => item.delivered_at) || false,
      completedAt: order.order_items?.reduce((latest, item) => {
        if (!item.delivered_at) return latest;
        return !latest || new Date(item.delivered_at) > new Date(latest) ? item.delivered_at : latest;
      }, null)
    })) || [];

    // Get count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_info_id', userInfo.id)
      .in('status_code', pastStatuses);

    return {
      success: true,
      orders: formattedOrders,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNext: (parseInt(offset as string) + parseInt(limit as string)) < (count || 0)
      }
    };
  } catch (error) {
    console.error('Failed to list past orders:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list past orders'
    });
  }
});
