import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);
    const sessionId = query.session_id as string;

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing session_id parameter'
      });
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'subscription']
    });

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Checkout session not found'
      });
    }

    // Get user info to verify ownership
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

    // Verify the session belongs to the authenticated user
    if (session.customer !== userInfo.payment_customer_id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized access to this transaction'
      });
    }

    // Get operation codes to determine transaction type
    const operationCodes = await getCodes(supabase, 'operation_type');

    // Determine transaction type and format response
    let transactionType = 'unknown';
    const details: any = {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency?.toUpperCase() || 'SGD',
      paymentMethod: session.payment_method_types?.[0] || 'card'
    };

    // Check metadata for operation type
    if (session.metadata?.operation_type === operationCodes.purchase) {
      transactionType = 'purchase';

      // Try to find the associated order
      const { data: order } = await supabase
        .from('orders')
        .select('id, order_number, total_amount_cents, status_code')
        .eq('user_info_id', userInfo.id)
        .eq('total_amount_cents', session.amount_total)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (order) {
        details.orderNumber = order.order_number;
        details.orderId = order.id;
        details.status = order.status_code;
      }

      // Get total items from metadata or line items
      if (session.metadata?.total_items) {
        details.totalItems = parseInt(session.metadata.total_items);
      } else if (session.line_items?.data) {
        details.totalItems = session.line_items.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
      }
    } else if (session.metadata?.operation_type === operationCodes.credit_topup) {
      transactionType = 'credit_topup';
      details.creditsAdded = session.amount_total;
    } else if (session.mode === 'subscription') {
      transactionType = 'subscription';

      if (session.subscription) {
        const subscription = session.subscription;
        details.subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;
        details.planName = session.line_items?.data?.[0]?.description || 'Subscription Plan';
      }
    } else {
      // Try to infer from line items or session mode
      if (session.mode === 'payment') {
        // Check line items for product type
        const lineItems = session.line_items?.data || [];
        const hasProducts = lineItems.some((item) =>
          item.description && !item.description.toLowerCase().includes('credit')
        );

        if (hasProducts) {
          transactionType = 'purchase';
          details.totalItems = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        } else {
          transactionType = 'credit_topup';
          details.creditsAdded = session.amount_total;
        }
      }
    }

    return {
      success: true,
      type: transactionType,
      sessionId: session.id,
      status: session.payment_status,
      details: details
    };
  } catch (error: any) {
    console.error('Success API error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve transaction details'
    });
  }
});
