import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);
    
    const { order_id, approved } = body;

    if (!order_id || approved === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'order_id and approved (boolean) are required'
      });
    }

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
      .select('id, payment_customer_id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent user info not found'
      });
    }

    // Get the order and verify parent has permission
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        child_info:user_infos!orders_user_info_id_fkey(
          id,
          all_users!user_infos_user_id_fkey(first_name, last_name, email)
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      });
    }

    // Verify this parent has permission to approve this child's order
    const { data: parentChildRelation, error: relationError } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentInfo.id)
      .eq('child_user_info_id', order.user_info_id)
      .single();

    if (relationError || !parentChildRelation) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to approve this order'
      });
    }

    // Check if order can be approved/rejected
    if (order.status_code !== 'pending_parent_approval') {
      throw createError({
        statusCode: 400,
        statusMessage: `Order cannot be approved/rejected. Current status: ${order.status_code}`
      });
    }

    if (!approved) {
      // REJECTION: Release reserved credits and update order
      const { error: releaseError } = await supabase
        .from('user_credits')
        .update({
          reserved_credit: supabase.raw(`reserved_credit - ${order.total_amount_cents}`)
        })
        .eq('user_info_id', order.user_info_id);

      if (releaseError) {
        console.error('Failed to release reserved credits:', releaseError);
      }

      // Update order status to rejected
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status_code: 'rejected',
          notes: `${order.notes} - Rejected by parent`
        })
        .eq('id', order_id);

      if (updateError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to reject order'
        });
      }

      return {
        success: true,
        approved: false,
        message: 'Order rejected successfully. Credits have been released.',
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: 'rejected'
        }
      };
    }

    // APPROVAL: Create Stripe checkout session for parent to pay
    const baseUrl = useRuntimeConfig().public.baseUrl;

    // Get order items for Stripe checkout
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(name, description)
      `)
      .eq('order_id', order_id);

    const session = await stripe.checkout.sessions.create({
      customer: parentInfo.payment_customer_id || undefined,
      line_items: orderItems?.map(item => ({
        price_data: {
          currency: 'sgd',
          unit_amount: item.unit_price_cents,
          product_data: {
            name: item.product?.name || `Product ${item.product_id}`,
            description: `Purchase approved for ${order.child_info?.all_users?.first_name}`
          }
        },
        quantity: item.quantity
      })) || [],
      mode: 'payment',
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/orders/pending`,
      metadata: {
        order_id: order.id,
        parent_user_info_id: parentInfo.id,
        child_user_info_id: order.user_info_id,
        operation_type: 'parent_approved_purchase',
        order_number: order.order_number
      }
    });

    // Update order with Stripe session info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_balance_transaction_id: session.id,
        notes: `${order.notes} - Parent approved, payment in progress`
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order with session info:', updateError);
    }

    return {
      success: true,
      approved: true,
      checkoutUrl: session.url,
      message: 'Order approved! Please complete payment to finalize the purchase.',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status_code,
        childName: `${order.child_info?.all_users?.first_name} ${order.child_info?.all_users?.last_name}`,
        totalAmount: (order.total_amount_cents / 100).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Failed to approve/reject order:', error);
    
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process order approval'
    });
  }
});