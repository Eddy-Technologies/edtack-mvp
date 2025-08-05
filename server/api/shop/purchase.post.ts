import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';
import { ORDER_STATUS, OPERATION_TYPE } from '~~/shared/constants';

// Generate order number function
function generateOrderNumber(): string {
  const now = new Date();
  const yearMonth = now.getFullYear().toString() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6); // Use last 6 digits of timestamp for uniqueness
  return `ORD-${yearMonth}-${timestamp}`;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const body = await readBody(event);
    const { items, use_credits = true } = body;

    // Validate input - items should be an array from cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid items array. Expected array of cart items.'
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity < 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Each item must have id and quantity >= 1'
        });
      }
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get status and operation codes from database early
    const statusCodes = await getCodes(supabase, 'order_status');
    const operationCodes = await getCodes(supabase, 'operation_type');

    // Get user info
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, payment_customer_id, email')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Get all products from database for the items in cart
    const productIds = items.map((item) => item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true);

    if (productsError || !products) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products from database'
      });
    }

    // Verify all cart items have corresponding products
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw createError({
        statusCode: 404,
        statusMessage: `Products not found or inactive: ${missingIds.join(', ')}`
      });
    }

    // Calculate total cost and prepare order items
    let totalCostCents = 0;
    const orderItems = items.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      const itemCostCents = product.price_cents * cartItem.quantity;
      totalCostCents += itemCostCents;

      return {
        product_id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        quantity: cartItem.quantity,
        subtotal_cents: itemCostCents
      };
    });

    // Handle payment flow based on use_credits parameter
    let orderStatus;
    let paymentMethod;
    const paidAt = null;
    let stripeCheckoutUrl = null;

    if (use_credits) {
      // Check if user is a parent or child
      const { data: groupCheck, error: groupError } = await supabase
        .from('group_members')
        .select(`
          groups!inner(
            created_by,
            creator:user_infos!groups_created_by_fkey(
              id,
              email,
              first_name,
              last_name
            )
          )
        `)
        .eq('user_info_id', userInfo.id)
        .eq('status', 'active');

      // Determine if user is a parent (no parents found) or child (has parents)
      const hasParents = groupCheck?.some((groupMember) =>
        groupMember.groups.creator && groupMember.groups.creator.id !== userInfo.id
      );
      const isParent = !hasParents;

      // Get user's internal credit balance (including reserved credits)
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credit, reserved_credit')
        .eq('user_info_id', userInfo.id)
        .single();

      if (creditsError || !userCredits) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User credit balance not found. Please contact support.'
        });
      }

      const availableCredits = userCredits.credit - (userCredits.reserved_credit || 0);

      if (availableCredits < totalCostCents) {
        throw createError({
          statusCode: 400,
          statusMessage: `Insufficient available credits. Required: ${totalCostCents} credits, Available: ${availableCredits} credits`
        });
      }

      if (isParent) {
        // Parents should not be able to use credits directly - they should pay with credit card
        throw createError({
          statusCode: 400,
          statusMessage: 'Parents cannot purchase with credits. Please use credit card payment.'
        });
      } else {
        // FLOW 1: Child Credit Purchase → Parent Approval Required
        const newReservedCredit = (userCredits.reserved_credit || 0) + totalCostCents;
        // Reserve credits for parent approval (don't deduct yet)
        const { error: reserveError } = await supabase
          .from('user_credits')
          .update({ reserved_credit: newReservedCredit })
          .eq('user_info_id', userInfo.id);

        if (reserveError) {
          console.error('Failed to reserve credits:', reserveError);
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reserve credits for approval'
          });
        }

        orderStatus = ORDER_STATUS.PENDING_PARENT_APPROVAL;
        paymentMethod = 'credits_pending_approval';
      }
    } else {
      // FLOW 2: Direct Credit Card Purchase

      // Create Stripe checkout session
      const baseUrl = useRuntimeConfig().public.baseUrl;

      const session = await stripe.checkout.sessions.create({
        line_items: orderItems.map((item) => ({
          price_data: {
            currency: 'sgd',
            unit_amount: item.price_cents,
            product_data: {
              name: item.name,
              metadata: {
                product_id: item.product_id
              }
            }
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        customer_email: userInfo.email || user.email,
        success_url: `${baseUrl}/shop/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard?tab=cart&cancelled=true`,
        metadata: {
          user_info_id: userInfo.id,
          operation_type: OPERATION_TYPE.PURCHASE,
          total_items: orderItems.length.toString(),
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0).toString()
        }
      });

      orderStatus = ORDER_STATUS.PENDING_PAYMENT;
      paymentMethod = 'stripe_checkout';
      stripeCheckoutUrl = session.url;
    }

    // Create order record with appropriate status
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_info_id: userInfo.id,
        status_code: orderStatus,
        total_amount_cents: totalCostCents,
        currency: 'SGD',
        payment_method: paymentMethod,
        stripe_balance_transaction_id: stripeCheckoutUrl ? null : null, // Will be updated by webhook
        paid_at: paidAt,
        notes: use_credits ?
          `Credit purchase pending parent approval - ${orderItems.length} item${orderItems.length > 1 ? 's' : ''}` :
          `Direct purchase - ${orderItems.length} item${orderItems.length > 1 ? 's' : ''} - External fulfillment`
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order record'
      });
    }

    // Create order items with appropriate status
    const orderItemsData = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.price_cents,
      total_price_cents: item.subtotal_cents,
      status_code: orderStatus // Match order status
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order items'
      });
    }

    // Find all parents for notification (only for child credit purchases)
    let parentNotifications = null;
    if (use_credits && orderStatus === 'pending_parent_approval') {
      // Get parents from groups where user is a member
      const { data: groupParents, error: parentError } = await supabase
        .from('group_members')
        .select(`
          groups!inner(
            created_by,
            creator:user_infos!groups_created_by_fkey(
              id,
              email,
              first_name,
              last_name
            )
          )
        `)
        .eq('user_info_id', userInfo.id)
        .eq('status', 'active');

      if (parentError) {
        console.error('Failed to fetch parent notifications:', parentError);
      }

      // Extract unique parents (group creators)
      const parentMap = new Map();
      groupParents?.forEach((groupMember) => {
        const parent = groupMember.groups.creator;
        if (parent && parent.id !== userInfo.id) {
          parentMap.set(parent.id, {
            userInfoId: parent.id,
            email: parent.email,
            name: `${parent.first_name} ${parent.last_name}`.trim()
          });
        }
      });

      parentNotifications = Array.from(parentMap.values());
      console.log(`[Purchase] Notifying ${parentNotifications.length} parents about credit purchase approval needed for order ${order.order_number}`);
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      status: orderStatus,
      requiresParentApproval: use_credits, // Only children can use credits, so this is always for parent approval
      stripeCheckoutUrl: stripeCheckoutUrl,
      message: use_credits ?
        `Order created! Waiting for parent approval.` :
        stripeCheckoutUrl ?
          `Redirecting to payment...` :
          `Successfully purchased ${orderItems.length} item${orderItems.length > 1 ? 's' : ''}`,
      details: {
        orderNumber: order.order_number,
        items: orderItems,
        totalItems: orderItems.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalCostCents,
        totalCostSGD: (totalCostCents / 100).toFixed(2),
        paymentMethod: paymentMethod,
        status: orderStatus,
        parentsToNotify: parentNotifications
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Purchase failed'
    });
  }
});
