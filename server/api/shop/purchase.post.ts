import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';

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
      .select('id, payment_customer_id')
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

    // Check if user has Stripe customer and sufficient balance
    if (use_credits && userInfo.payment_customer_id) {
      const customer = await stripe.customers.retrieve(userInfo.payment_customer_id);
      console.log(customer);

      if (customer.balance < totalCostCents) {
        throw createError({
          statusCode: 400,
          statusMessage: `Insufficient funds. Required: $${(totalCostCents / 100).toFixed(2)} SGD, Available: $${(customer.balance / 100).toFixed(2)} SGD`
        });
      }

      // Deduct amount from customer balance
      const itemsDescription = orderItems.length === 1 ?
        `${orderItems[0].name} (x${orderItems[0].quantity})` :
        `${orderItems.length} items (${items.reduce((sum, item) => sum + item.quantity, 0)} total)`;

      await stripe.customers.createBalanceTransaction(userInfo.payment_customer_id, {
        amount: -totalCostCents, // Negative amount deducts from balance
        currency: 'sgd',
        description: `Purchase: ${itemsDescription}`,
        metadata: {
          operation_type: operationCodes.purchase,
          total_items: orderItems.length.toString(),
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
          order_summary: JSON.stringify(orderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price_cents
          })))
        }
      });
    }

    // Create order record (replaces user_purchases)
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_info_id: userInfo.id,
        status_code: statusCodes.paid, // Start as paid since payment already processed
        total_amount_cents: totalCostCents,
        currency: 'SGD', // Now explicitly set instead of using default
        payment_method: use_credits ? 'customer_balance' : 'other', // Now explicitly set
        stripe_balance_transaction_id: null, // Will be updated after Stripe transaction
        paid_at: new Date().toISOString(),
        notes: `Purchase of ${orderItems.length} item${orderItems.length > 1 ? 's' : ''} - External fulfillment`
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

    // Create order items
    const orderItemsData = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.price_cents,
      total_price_cents: item.subtotal_cents,
      status_code: statusCodes.paid // Order items start as paid since payment processed
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

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: `Successfully purchased ${orderItems.length} item${orderItems.length > 1 ? 's' : ''}`,
      details: {
        orderNumber: order.order_number,
        items: orderItems,
        totalItems: orderItems.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalCostCents,
        totalCostSGD: (totalCostCents / 100).toFixed(2),
        paymentMethod: use_credits ? 'customer_balance' : 'other',
        status: statusCodes.paid
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
