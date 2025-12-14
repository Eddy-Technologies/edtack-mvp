/**
 * Credit Service
 *
 * Handles credit operations:
 * - Quiz completion credit disbursement
 * - Credit reservation for pending approvals
 * - Credit balance management
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export interface CreditDisbursementResult {
  creditEarned: number;
  creditDisbursed: boolean;
  senderBalance?: number;
  recipientBalance?: number;
}

export interface CreditMetadata {
  source: string;
  userTasksChapterId: string;
  score: number;
  totalScore: number;
  percentage: number;
  transfer_type: string;
}

/**
 * Check if credits have already been disbursed for a quiz completion
 * (Idempotency check)
 */
export async function checkExistingDisbursement(
  supabase: SupabaseClient,
  userInfoId: string,
  parentUserInfoId: string,
  userTasksChapterId: string
): Promise<{ exists: boolean; amount: number }> {
  const { data: existingTransaction } = await supabase
    .from('credit_transactions')
    .select('id, amount')
    .eq('user_info_id', userInfoId)
    .eq('transaction_type', 'TRANSFER_IN')
    .eq('from_user_info_id', parentUserInfoId)
    .eq('metadata->>source', 'quiz_completion')
    .eq('metadata->>userTasksChapterId', userTasksChapterId)
    .maybeSingle();

  if (existingTransaction) {
    return { exists: true, amount: existingTransaction.amount };
  }

  return { exists: false, amount: 0 };
}

/**
 * Disburse credits for quiz completion
 * Transfers credits atomically from parent to student
 */
export async function disburseQuizCredits(
  supabase: SupabaseClient,
  fromUserInfoId: string,
  toUserInfoId: string,
  amount: number,
  taskId: string,
  metadata: CreditMetadata
): Promise<CreditDisbursementResult> {
  // First check if already disbursed
  const existing = await checkExistingDisbursement(
    supabase,
    toUserInfoId,
    fromUserInfoId,
    metadata.userTasksChapterId
  );

  if (existing.exists) {
    console.log('[creditService] Credits already disbursed:', existing.amount);
    return {
      creditEarned: existing.amount,
      creditDisbursed: true,
    };
  }

  // Transfer credits atomically
  const { data: transferResult, error: transferError } = await supabase
    .rpc('transfer_credits_atomic', {
      p_from_user_info_id: fromUserInfoId,
      p_to_user_info_id: toUserInfoId,
      p_amount: amount,
      p_description_from: `Quiz reward transfer to student for task ${taskId}`,
      p_description_to: `Quiz reward for completing ${taskId}`,
      p_metadata_from: metadata,
      p_metadata_to: metadata,
    });

  if (transferError) {
    console.error('[creditService] Credit transfer failed:', transferError);
    throw transferError;
  }

  console.log('[creditService] Credits disbursed:', {
    creditEarned: amount,
    recipientBalance: transferResult.recipientBalance,
    senderBalance: transferResult.senderBalance,
  });

  return {
    creditEarned: amount,
    creditDisbursed: true,
    senderBalance: transferResult.senderBalance,
    recipientBalance: transferResult.recipientBalance,
  };
}

/**
 * Handle credit disbursement for a completed quiz
 * Returns credit info for API response
 */
export async function handleQuizCreditDisbursement(
  supabase: SupabaseClient,
  userInfoId: string,
  parentUserInfoId: string,
  taskId: string,
  userTasksChapterId: string,
  creditReward: number,
  passedThreshold: boolean,
  scoreData: { bestScore: number; bestTotalScore: number; bestPercentage: number }
): Promise<CreditDisbursementResult> {
  // No credits to disburse
  if (!passedThreshold || creditReward <= 0) {
    return {
      creditEarned: 0,
      creditDisbursed: false,
    };
  }

  try {
    const metadata: CreditMetadata = {
      source: 'quiz_completion',
      userTasksChapterId,
      score: scoreData.bestScore,
      totalScore: scoreData.bestTotalScore,
      percentage: scoreData.bestPercentage,
      transfer_type: 'quiz_reward',
    };

    return await disburseQuizCredits(
      supabase,
      parentUserInfoId,
      userInfoId,
      creditReward,
      taskId,
      metadata
    );
  } catch (error) {
    console.error('[creditService] Credit disbursement failed:', error);
    // Don't fail the quiz submission if credit disbursement fails
    return {
      creditEarned: 0,
      creditDisbursed: false,
    };
  }
}

/**
 * Check credit transaction for quiz results display
 */
export async function getQuizCreditTransaction(
  supabase: SupabaseClient,
  userTasksChapterId: string
): Promise<number> {
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('metadata->>userTasksChapterId', userTasksChapterId)
    .eq('metadata->>source', 'quiz_completion')
    .limit(1);

  if (error || !transactions || transactions.length === 0) {
    return 0;
  }

  return transactions[0].amount;
}

/**
 * Reserve credits for a pending purchase (child purchase pending parent approval)
 */
export async function reserveCredits(
  supabase: SupabaseClient,
  userInfoId: string,
  amount: number
): Promise<void> {
  // Get current reserved credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('reserved_credit')
    .eq('user_info_id', userInfoId)
    .single();

  if (fetchError) {
    console.error('[creditService] Error fetching current credits:', fetchError);
    throw fetchError;
  }

  const newReservedCredit = (currentCredits?.reserved_credit || 0) + amount;

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({ reserved_credit: newReservedCredit })
    .eq('user_info_id', userInfoId);

  if (updateError) {
    console.error('[creditService] Error reserving credits:', updateError);
    throw updateError;
  }
}

/**
 * Deduct reserved credits after purchase approval
 */
export async function deductReservedCredits(
  supabase: SupabaseClient,
  userInfoId: string,
  amount: number
): Promise<void> {
  // Get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('credit, reserved_credit')
    .eq('user_info_id', userInfoId)
    .single();

  if (fetchError) {
    console.error('[creditService] Error fetching current credits:', fetchError);
    throw fetchError;
  }

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      credit: (currentCredits?.credit || 0) - amount,
      reserved_credit: (currentCredits?.reserved_credit || 0) - amount,
    })
    .eq('user_info_id', userInfoId);

  if (updateError) {
    console.error('[creditService] Error deducting credits:', updateError);
    throw updateError;
  }
}

/**
 * Validate user has sufficient available credits
 */
export async function validateCreditBalance(
  supabase: SupabaseClient,
  userInfoId: string,
  requiredAmount: number
): Promise<{ valid: boolean; available: number; total: number; reserved: number }> {
  const { data: userCredits, error } = await supabase
    .from('user_credits')
    .select('credit, reserved_credit')
    .eq('user_info_id', userInfoId)
    .single();

  if (error || !userCredits) {
    return { valid: false, available: 0, total: 0, reserved: 0 };
  }

  const total = userCredits.credit || 0;
  const reserved = userCredits.reserved_credit || 0;
  const available = total - reserved;

  return {
    valid: available >= requiredAmount,
    available,
    total,
    reserved,
  };
}
