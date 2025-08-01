import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    
    const { to_user_info_id, amount } = body;

    // Validate input
    if (!to_user_info_id || !amount || amount < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'to_user_info_id and amount (minimum 1 cent) are required'
      });
    }

    // Get authenticated user (sender)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get sender's user_info_id
    const { data: senderInfo, error: senderError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (senderError || !senderInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sender user info not found'
      });
    }

    // Verify parent-child relationship
    const { data: parentChildRelation, error: relationError } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', senderInfo.id)
      .eq('child_user_info_id', to_user_info_id)
      .single();

    if (relationError || !parentChildRelation) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only transfer credits to your children'
      });
    }

    const amountInCents = parseInt(amount);

    // Check sender's balance
    const { data: senderCredits, error: senderCreditsError } = await supabase
      .from('user_credits')
      .select('credit')
      .eq('user_info_id', senderInfo.id)
      .single();

    if (senderCreditsError || !senderCredits) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sender credit balance not found'
      });
    }

    if (senderCredits.credit < amountInCents) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient balance. You have ${(senderCredits.credit / 100).toFixed(2)} SGD, but need ${(amountInCents / 100).toFixed(2)} SGD`
      });
    }

    // Get operation codes
    const operationCodes = await getCodes(supabase, 'operation_type');

    // Perform the transfer - deduct from sender
    const { error: deductError } = await supabase
      .from('user_credits')
      .update({
        credit: supabase.raw(`credit - ${amountInCents}`)
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
    const { error: addError } = await supabase
      .from('user_credits')
      .update({
        credit: supabase.raw(`credit + ${amountInCents}`)
      })
      .eq('user_info_id', to_user_info_id);

    if (addError) {
      // Try to create the record if it doesn't exist
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_info_id: to_user_info_id,
          credit: amountInCents
        });

      if (insertError) {
        console.error('Failed to add credits to recipient:', insertError);
        // Rollback sender deduction
        await supabase
          .from('user_credits')
          .update({
            credit: supabase.raw(`credit + ${amountInCents}`)
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
          recipient_user_info_id: to_user_info_id,
          amount_cents: amountInCents
        })
      });

    // Recipient transaction (incoming)
    const { error: recipientTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_info_id: to_user_info_id,
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
      .eq('user_info_id', to_user_info_id)
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