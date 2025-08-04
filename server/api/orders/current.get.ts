import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const { limit = 50, offset = 0 } = query;

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Current orders are those not in final states (completed, cancelled, refunded, delivered)
    const currentStatuses = ['pending', 'pending_parent_approval', 'paid', 'confirmed', 'processing', 'shipped'];

    // Get current orders for this user
    const { data: currentOrders, error: ordersError } = await supabase
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
      .in('status_code', currentStatuses)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (ordersError) {
      console.error('Failed to fetch current orders:', ordersError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch current orders'
      });
    }

    // Format the response
    const formattedOrders = currentOrders?.map((order) => ({
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
      hasTracking: order.order_items?.some((item) => item.tracking_number) || false
    })) || [];

    // Get count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_info_id', userInfo.id)
      .in('status_code', currentStatuses);

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
    console.error('Failed to list current orders:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list current orders'
    });
  }
});
