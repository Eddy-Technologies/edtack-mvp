import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const { limit = 50, offset = 0, status } = query;

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's info and role
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select(`
        id,
        user_roles!inner(
          roles!inner(
            role_name
          )
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Check if user is a parent or student
    const isParent = userInfo.user_roles?.some((userRole) =>
      userRole.roles.role_name === 'PARENT'
    );
    const isStudent = userInfo.user_roles?.some((userRole) =>
      userRole.roles.role_name === 'STUDENT'
    );

    let targetUserIds = [];

    if (isStudent) {
      // For students, show only their own orders
      targetUserIds = [userInfo.id];
    } else if (isParent) {
      // For parents, get child user IDs from groups where parent is the creator
      const { data: groupMembers, error: groupError } = await supabase
        .from('group_members')
        .select(`
          groups!inner(
            id,
            created_by,
            group_members!inner(
              user_info_id,
              status
            )
          )
        `)
        .eq('user_info_id', userInfo.id)
        .eq('status', 'active');

      if (groupError) {
        console.error('Failed to fetch group members:', groupError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch group information'
        });
      }

      // Extract child user IDs from groups created by this parent
      const childUserIds = [];
      groupMembers?.forEach((groupMember) => {
        if (groupMember.groups.created_by === userInfo.id) {
          groupMember.groups.group_members.forEach((member) => {
            if (member.user_info_id !== userInfo.id && member.status === 'active') {
              childUserIds.push(member.user_info_id);
            }
          });
        }
      });

      targetUserIds = childUserIds;
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'User must be either a parent or student to view orders'
      });
    }

    if (targetUserIds.length === 0) {
      return {
        success: true,
        orders: [],
        pagination: {
          total: 0,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasNext: false
        }
      };
    }

    // Build query for orders
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount_cents,
        currency,
        status_code,
        created_at,
        notes,
        child_info:user_infos!orders_user_info_id_fkey(
          id,
          first_name,
          last_name,
          email
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
      .in('user_info_id', targetUserIds)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      ordersQuery = ordersQuery.eq('status_code', status);
    }

    // Get orders with pagination
    const { data: pendingOrders, error: ordersError } = await ordersQuery
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (ordersError) {
      console.error('Failed to fetch pending orders:', ordersError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch pending orders'
      });
    }

    // Format the response
    const formattedOrders = pendingOrders?.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      totalAmountCents: order.total_amount_cents,
      totalAmountSGD: (order.total_amount_cents / 100).toFixed(2),
      currency: order.currency,
      status: order.status_code,
      createdAt: order.created_at,
      notes: order.notes,
      child: {
        userInfoId: order.child_info?.id,
        name: `${order.child_info?.first_name} ${order.child_info?.last_name}`,
        firstName: order.child_info?.first_name,
        lastName: order.child_info?.last_name,
        email: order.child_info?.email
      },
      items: order.order_items?.map((item) => ({
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
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('user_info_id', targetUserIds);

    // Apply same status filter for count
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status_code', status);
    }

    const { count } = await countQuery;

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
