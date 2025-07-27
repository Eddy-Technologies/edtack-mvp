import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { toUserId, amount } = body;
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();

    // Validate input
    if (!toUserId || !amount || amount < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid transfer data. User ID and amount (minimum 1) are required.'
      });
    }
    const { data: { user } } = await supabase.auth.getUser();
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
        id, 
        parent_child!parent_child_parent_user_info_id_fkey(
          child_user_info_id,
          all_users!parent_child_child_user_info_id_fkey(email, first_name, last_name)
        )
      `)
      .eq('user_id', user.id)
      .eq('parent_child.child_user_info_id', toUserId)
      .single();

    if (!parentWithChildren?.parent_child || parentWithChildren.parent_child.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only transfer credits to your children'
      });
    }

    // Check parent's current balance
    const parentCustomer = await stripe.customers.retrieve(parentStripeCustomerId, {
      expand: ['cash_balance']
    });

    const parentBalanceInCents = parentCustomer.cash_balance?.available?.usd || 0;
    const parentBalanceInCredits = Math.floor(parentBalanceInCents / 10);

    if (parentBalanceInCredits < amount) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient balance. You have ${parentBalanceInCredits} credits, but need ${amount} credits.`
      });
    }

    // Convert credits to cents (1 credit = 10 cents)
    const amountInCents = amount * 10;

    try {
      // Perform the transfer using Stripe Balance Transactions
      // Step 1: Deduct from parent's balance
      await stripe.customers.createBalanceTransaction(parentStripeCustomerId, {
        amount: -amountInCents,
        currency: 'usd',
        description: `Transfer ${amount} credits to child`
      });

      // Step 2: Add to child's balance
      await stripe.customers.createBalanceTransaction(childStripeCustomerId, {
        amount: amountInCents,
        currency: 'usd',
        description: `Received ${amount} credits from parent`
      });
    } catch (transferError) {
      console.error('Transfer failed:', transferError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to process credit transfer'
      });
    }

    // Get updated balances
    const updatedParentCustomer = await stripe.customers.retrieve(parentStripeCustomerId, {
      expand: ['cash_balance']
    });
    const updatedChildCustomer = await stripe.customers.retrieve(childStripeCustomerId, {
      expand: ['cash_balance']
    });

    const newParentBalance = Math.floor((updatedParentCustomer.cash_balance?.available?.usd || 0) / 10);
    const newChildBalance = Math.floor((updatedChildCustomer.cash_balance?.available?.usd || 0) / 10);

    // Record transaction in database for audit trail
    let transactionId = `transfer_${Date.now()}`;

    try {
      const { data: transactionData, error: insertError } = await supabase
        .from('credit_transactions')
        .insert({
          from_user_id: mockParentUserId,
          to_user_id: toUserId,
          transaction_type: 'transfer',
          amount: amount,
          balance_before: parentBalanceInCredits,
          balance_after: newParentBalance,
          description: `Transfer ${amount} credits to child`,
          status: 'completed',
          metadata: {
            parent_stripe_customer_id: parentStripeCustomerId,
            child_stripe_customer_id: childStripeCustomerId,
            parent_balance_before: parentBalanceInCredits,
            parent_balance_after: newParentBalance,
            child_balance_after: newChildBalance
          }
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Failed to record transaction:', insertError);
      } else if (transactionData) {
        transactionId = transactionData.id;
      }
    } catch (dbError) {
      console.warn('Could not record transaction in database:', dbError);
    }

    return {
      success: true,
      newParentBalance,
      newChildBalance,
      transactionId
    };
  } catch (error) {
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
