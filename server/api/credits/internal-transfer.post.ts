import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getCodes } from '~~/server/services/codeService';
import { getUserInfo } from '~~/server/utils/auth';

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

    // Check sender's balance
    const { data: senderCredits, error: senderCreditsError } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', senderInfo.id)
      .single();

    if (senderCreditsError || !senderCredits || senderCredits.credit < amountInCents) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient credits. You have ${(senderCredits?.credit || 0) / 100} SGD available.`
      });
    }

    // Get operation codes
    const operationCodes = await getCodes(supabase, 'operation_type');

    // Perform the transfer - deduct from sender
    const newSenderCredit = senderCredits.credit - amountInCents;
    const { error: deductError } = await supabase
      .from('user_credits')
      .update({
        credit: newSenderCredit
      })
      .eq('user_info_id', senderInfo.id);

    if (deductError) {
      console.error('Failed to deduct credits from sender:', deductError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to process transfer'
      });
    }

    // Add to recipient (create record if doesn't exist)
    // First get recipient's current balance
    const { data: recipientCredits } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', toUserInfoId)
      .single();

    let addError = null;
    if (!addError && recipientCredits) {
      const newRecipientCredit = recipientCredits.credit + amountInCents;
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credit: newRecipientCredit
        })
        .eq('user_info_id', toUserInfoId);
      addError = updateError;
    }

    if (addError) {
      // Try to create the record if it doesn't exist
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_info_id: toUserInfoId,
          credit: amountInCents
        });

      if (insertError) {
        console.error('Failed to add credits to recipient:', insertError);
        // Rollback sender deduction
        await supabase
          .from('user_credits')
          .update({
            credit: senderCredits.credit
          })
          .eq('user_info_id', senderInfo.id);

        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to complete transfer'
        });
      }
    }

    // Create transaction records
    const description = `Transfer ${(amountInCents / 100).toFixed(2)} SGD to child`;

    // Sender transaction (outgoing)
    const { error: senderTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: senderInfo.id,
        transaction_type: operationCodes.transfer_out || 'transfer_out',
        amount: -amountInCents, // Negative for outgoing
        currency: 'SGD',
        description: description,
        is_internal: true,
        metadata: JSON.stringify({
          transfer_type: 'parent_to_child',
          recipient_user_info_id: toUserInfoId,
          amount_cents: amountInCents
        })
      });

    // Recipient transaction (incoming)
    const { error: recipientTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: toUserInfoId,
        transaction_type: operationCodes.transfer_in || 'transfer_in',
        amount: amountInCents, // Positive for incoming
        currency: 'SGD',
        description: `Received ${(amountInCents / 100).toFixed(2)} SGD from parent`,
        is_internal: true,
        metadata: JSON.stringify({
          transfer_type: 'parent_to_child',
          sender_user_info_id: senderInfo.id,
          amount_cents: amountInCents
        })
      });

    if (senderTransactionError || recipientTransactionError) {
      console.error('Failed to create transaction records:', { senderTransactionError, recipientTransactionError });
      // Don't fail the transfer, but log the error
    }

    // Get updated balances
    const { data: updatedSenderCredits } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', senderInfo.id)
      .single();

    const { data: updatedRecipientCredits } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', toUserInfoId)
      .single();

    return {
      success: true,
      message: `Successfully transferred ${(amountInCents / 100).toFixed(2)} SGD to child`,
      newSenderBalance: updatedSenderCredits?.credit || 0,
      newRecipientBalance: updatedRecipientCredits?.credit || 0,
      transferAmount: amountInCents,
      transferAmountSGD: (amountInCents / 100).toFixed(2)
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
