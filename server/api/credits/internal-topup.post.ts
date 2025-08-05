import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { amount } = body;

    // Validate input
    if (!amount || amount < 1 || amount > 500) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid amount. Must be between $1 and $500.'
      });
    }

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    if (!userInfo.user_credits) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User credits not found'
      });
    }

    // TODO: needs to be in same transaction by right
    const amountInCents = Math.round(amount * 100); // Convert dollars to cents
    const newUserCredit = (userInfo.user_credits?.credit || 0) + amountInCents;

    // Get operation codes
    const operationCodes = await getCodes(supabase, 'operation_type');

    // Add credits to user's balance (create record if doesn't exist)
    const { error: addError } = await supabase
      .from('user_credits')
      .update({ credit: newUserCredit })
      .eq('user_info_id', userInfo.id);

    if (addError) {
      console.error('Failed to add credits:', addError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to add credits to user balance'
      });
    }

    // Create transaction record for internal top-up
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: userInfo.id,
        transaction_type: operationCodes.credit_topup || 'credit_topup',
        amount: amountInCents,
        currency: 'SGD',
        description: `Internal credit top-up - $${amount.toFixed(2)} SGD`,
        is_internal: true,
        metadata: JSON.stringify({
          topup_type: 'internal_pledge',
          amount_sgd: amount,
          amount_cents: amountInCents,
          user_email: userInfo.email
        })
      });

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError);
      // Don't fail the top-up, but log the error
    }

    // Get updated balance
    const { data: updatedCredits } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', userInfo.id)
      .single();

    return {
      success: true,
      message: `Successfully added $${amount.toFixed(2)} SGD to your account`,
      newBalance: updatedCredits?.credit || amountInCents,
      newBalanceSGD: ((updatedCredits?.credit || amountInCents) / 100).toFixed(2),
      addedAmount: amountInCents,
      addedAmountSGD: amount.toFixed(2),
      transactionDetails: {
        amount: amountInCents,
        currency: 'SGD',
        description: `Internal credit top-up - $${amount.toFixed(2)} SGD`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to process internal top-up:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process top-up'
    });
  }
});
