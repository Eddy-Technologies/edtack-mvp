import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);
    
    const { limit = 50, offset = 0 } = query;

    // Get authenticated user (parent)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get parent's user_info_id
    const { data: parentInfo, error: parentError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent user info not found'
      });
    }

    // Get all pending approval orders for this parent's children
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount_cents,
        currency,
        created_at,
        notes,
        child_info:user_infos!orders_user_info_id_fkey(
          id,
          all_users!user_infos_user_id_fkey(first_name, last_name, email)
        ),
        order_items(
          id,
          quantity,
          unit_price_cents,
          total_price_cents,
          product:products(
            id,
            name,
            description,
            image_url
          )
        )
      `)
      .eq('status_code', 'pending_parent_approval')
      .in('user_info_id', 
        supabase
          .from('parent_child')
          .select('child_user_info_id')
          .eq('parent_user_info_id', parentInfo.id)
      )
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (ordersError) {
      console.error('Failed to fetch pending orders:', ordersError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch pending orders'
      });
    }

    // Format the response
    const formattedOrders = pendingOrders?.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      totalAmountCents: order.total_amount_cents,
      totalAmountSGD: (order.total_amount_cents / 100).toFixed(2),
      currency: order.currency,
      createdAt: order.created_at,
      notes: order.notes,
      child: {
        userInfoId: order.child_info?.id,
        name: `${order.child_info?.all_users?.first_name} ${order.child_info?.all_users?.last_name}`,
        firstName: order.child_info?.all_users?.first_name,
        lastName: order.child_info?.all_users?.last_name,
        email: order.child_info?.all_users?.email
      },
      items: order.order_items?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        unitPriceSGD: (item.unit_price_cents / 100).toFixed(2),
        totalPriceCents: item.total_price_cents,
        totalPriceSGD: (item.total_price_cents / 100).toFixed(2),
        product: {
          id: item.product?.id,
          name: item.product?.name,
          description: item.product?.description,
          imageUrl: item.product?.image_url
        }
      })) || [],
      itemCount: order.order_items?.length || 0,
      totalQuantity: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    })) || [];

    // Get count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status_code', 'pending_parent_approval')
      .in('user_info_id', 
        supabase
          .from('parent_child')
          .select('child_user_info_id')
          .eq('parent_user_info_id', parentInfo.id)
      );

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
    console.error('Failed to list pending approval orders:', error);
    
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list pending approval orders'
    });
  }
});