import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { validateCreditBalance } from '~~/server/services/creditService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { toUserInfoId, amountInCents } = body;

    // Validate input
    if (!toUserInfoId || !amountInCents || amountInCents < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'to_user_info_id and amount (minimum 1 cent) are required'
      });
    }

    // Get authenticated user info (sender)
    const senderInfo = await getUserInfo(event);

    // Verify group relationship
    const { data: groupRelation, error: relationError } = await supabase
      .from('group_members')
      .select('*')
      .in('user_info_id', [toUserInfoId, senderInfo.id])
      .eq('status', 'active');

    if (relationError) {
      console.error('Failed to fetch group relationships:', relationError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify relationship'
      });
    }

    // Check if recipient is in any of the sender's groups
    let canTransfer = false;

    const senderGroupMap = groupRelation.map((member) => member.user_info_id === senderInfo.id ? member.group_id : null);
    const receiverGroupMap = groupRelation.map((member) => member.user_info_id === toUserInfoId ? member.group_id : null);
    // check if any group id matches
    if (senderGroupMap.some((groupId) => receiverGroupMap.includes(groupId))) {
      canTransfer = true;
    }

    if (!canTransfer) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only transfer credits to members in your family group'
      });
    }

    // Check sender's balance (accounting for reserved credits)
    const balance = await validateCreditBalance(supabase, senderInfo.id, amountInCents);
    if (!balance.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient credits. You have ${balance.available / 100} credits available.`
      });
    }

    // Perform atomic transfer using database function
    const { data: transferResult, error: transferError } = await supabase
      .rpc('transfer_credits_atomic', {
        p_from_user_info_id: senderInfo.id,
        p_to_user_info_id: toUserInfoId,
        p_amount: amountInCents,
        p_description_from: `Transfer ${amountInCents} credits to child`,
        p_description_to: `Received ${amountInCents} credits from parent`,
        p_metadata_from: {
          transfer_type: 'parent_to_child',
          recipient_user_info_id: toUserInfoId,
          amount_cents: amountInCents
        },
        p_metadata_to: {
          transfer_type: 'parent_to_child',
          sender_user_info_id: senderInfo.id,
          amount_cents: amountInCents
        }
      });

    if (transferError) {
      console.error('Failed to transfer credits:', transferError);

      // Check if it's an insufficient balance error
      if (transferError.message && transferError.message.includes('Insufficient credits')) {
        throw createError({
          statusCode: 400,
          statusMessage: transferError.message
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to complete transfer'
      });
    }

    return {
      success: true,
      message: transferResult.message,
      newSenderBalance: transferResult.senderBalance,
      newRecipientBalance: transferResult.recipientBalance,
      transferAmount: transferResult.transferAmount,
      transferAmountSGD: (transferResult.transferAmount / 100).toFixed(2)
    };
  } catch (error) {
    console.error('Failed to transfer internal credits:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to transfer credits'
    });
  }
});
