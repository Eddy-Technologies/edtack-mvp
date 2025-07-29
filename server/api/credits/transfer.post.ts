import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';
import { serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { toUserInfoId, amount } = body;
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    const user = await serverSupabaseUser(event);

    // Validate input
    if (!toUserInfoId || !amount || amount < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid transfer data. User ID and amount (minimum 1) are required.'
      });
    }
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Please log in.'
      });
    }
    // Get user info with parent-child relationship and verify specific child
    const { data: parentWithChildren } = await supabase
      .from('user_infos')
      .select(`
        id, payment_customer_id, 
        parent_child!parent_child_parent_user_info_id_fkey(
          child_user_info_id,
          all_users!parent_child_child_user_info_id_fkey(email, first_name, last_name, payment_customer_id)
        )
      `)
      .eq('user_id', user.id)
      .eq('parent_child.child_user_info_id', toUserInfoId)
      .single();

    if (!parentWithChildren?.payment_customer_id || !parentWithChildren?.parent_child || parentWithChildren.parent_child.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only transfer credits to your children'
      });
    }
    const childData = parentWithChildren.parent_child[0].all_users;

    if (!childData || !childData.payment_customer_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child customer not found or has no payment customer ID'
      });
    }

    // Check parent's current balance using payment_customer_id
    const parentCustomer = await stripe.customers.retrieve(parentWithChildren.payment_customer_id);
    if (parentCustomer.deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent customer not found or has no cash balance'
      });
    }

    // Convert credits to cents (1 credit = 10 cents)
    const parentBalanceInCents = parentCustomer.balance;
    const amountInCents = amount * 100;
    if (parentBalanceInCents < amountInCents) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient balance. You have ${Math.floor(parentBalanceInCents / 100)} credits, but need ${amount} credits.`
      });
    }

    // Perform the transfer using Stripe Balance Transactions
    // Step 1: Deduct from parent's balance
    const updatedParentCustomer = await stripe.customers.createBalanceTransaction(parentWithChildren.payment_customer_id, {
      amount: -amountInCents,
      currency: 'sgd',
      description: `Transfer ${amount} credits to child`
    });

    // Step 2: Add to child's balance
    const updatedChildCustomer = await stripe.customers.createBalanceTransaction(childData.payment_customer_id, {
      amount: amountInCents,
      currency: 'sgd',
      description: `Received ${amount} credits from parent`
    });

    const newParentBalance = Math.floor((updatedParentCustomer.ending_balance) / 100);
    const newChildBalance = Math.floor((updatedChildCustomer.ending_balance) / 100);

    // Transaction recording will be handled by webhook when Stripe fires customer.cash_balance_transaction.created
    return {
      success: true,
      newParentBalance,
      newChildBalance,
      parentTransactionId: updatedParentCustomer.id,
      childTransactionId: updatedChildCustomer.id
    };
  } catch (error: any) {
    console.error('Failed to transfer credits:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to transfer credits'
    });
  }
});
