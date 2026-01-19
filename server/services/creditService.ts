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
 * Adjust reserved_credit by a delta (positive = add, negative = subtract)
 * @returns The new reserved_credit value
 */
async function adjustReservedCredit(
  supabase: SupabaseClient,
  userInfoId: string,
  delta: number
): Promise<number> {
  const { data, error: fetchError } = await supabase
    .from('user_credits')
    .select('reserved_credit')
    .eq('user_info_id', userInfoId)
    .single();

  if (fetchError) {
    console.error('[creditService] Failed to fetch reserved credit:', fetchError);
    throw fetchError;
  }

  const newReserved = Math.max(0, (data?.reserved_credit || 0) + delta);

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({ reserved_credit: newReserved })
    .eq('user_info_id', userInfoId);

  if (updateError) {
    console.error('[creditService] Failed to update reserved credit:', updateError);
    throw updateError;
  }

  return newReserved;
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
  scoreData: { bestScore: number; bestTotalScore: number; bestPercentage: number },
  chapterDisplayName?: string,
  subjectDisplayName?: string
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

    return await disburseTaskRewardCredits(
      supabase,
      parentUserInfoId,
      userInfoId,
      taskId,
      creditReward,
      metadata,
      chapterDisplayName,
      subjectDisplayName
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

/**
 * Reserve credits for a task (called during task creation)
 */
export async function reserveTaskCredits(
  supabase: SupabaseClient,
  userInfoId: string,
  taskId: string,
  amount: number
): Promise<{ reserved: number }> {
  if (amount <= 0) {
    return { reserved: 0 };
  }

  await adjustReservedCredit(supabase, userInfoId, amount);
  console.log(`[creditService] Reserved ${amount} credits for task ${taskId}`);
  return { reserved: amount };
}

/**
 * Release unreleased task credits back to parent (called during task closure)
 */
export async function releaseTaskCredits(
  supabase: SupabaseClient,
  taskId: string,
  userInfoId: string
): Promise<{ released: number }> {
  // Get task with chapter count to calculate total reserved (credit * chapter_count)
  const { data: task, error: taskError } = await supabase
    .from('user_tasks')
    .select('credit, credits_disbursed, user_tasks_chapters(id)')
    .eq('id', taskId)
    .eq('creator_user_info_id', userInfoId)
    .single();

  if (taskError || !task) {
    console.error('[creditService] Failed to fetch task for release:', taskError);
    throw taskError || new Error('Task not found');
  }

  const chapterCount = task.user_tasks_chapters?.length || 0;
  const totalReserved = (task.credit || 0) * chapterCount;
  const unreleased = totalReserved - (task.credits_disbursed || 0);

  if (unreleased <= 0) {
    return { released: 0 };
  }

  await adjustReservedCredit(supabase, userInfoId, -unreleased);
  console.log(`[creditService] Released ${unreleased} credits for task ${taskId}`);
  return { released: unreleased };
}

/**
 * Disburse credits from task reservation to student (called on quiz completion)
 * Uses existing transfer_credits_atomic + updates task tracking
 */
export async function disburseTaskRewardCredits(
  supabase: SupabaseClient,
  fromUserInfoId: string,
  toUserInfoId: string,
  taskId: string,
  amount: number,
  metadata: CreditMetadata,
  chapterDisplayName?: string,
  subjectDisplayName?: string
): Promise<CreditDisbursementResult> {
  // First check if already disbursed (idempotency)
  const existing = await checkExistingDisbursement(
    supabase,
    toUserInfoId,
    fromUserInfoId,
    metadata.userTasksChapterId
  );

  if (existing.exists) {
    console.log('[creditService] Task credits already disbursed:', existing.amount);
    return {
      creditEarned: existing.amount,
      creditDisbursed: true,
    };
  }

  const quizIdentifier = chapterDisplayName && subjectDisplayName ?
    `${subjectDisplayName} - ${chapterDisplayName}` :
    taskId;

  // Use existing transfer_credits_atomic for the actual transfer
  const { data: result, error } = await supabase.rpc('transfer_credits_atomic', {
    p_from_user_info_id: fromUserInfoId,
    p_to_user_info_id: toUserInfoId,
    p_amount: amount,
    p_description_from: `Quiz reward transfer to student for ${quizIdentifier}`,
    p_description_to: `Quiz reward for completing ${quizIdentifier}`,
    p_metadata_from: metadata,
    p_metadata_to: metadata,
  });

  if (error) {
    console.error('[creditService] Task credit transfer failed:', error);
    throw error;
  }

  // Update task's credits_disbursed counter
  const { data: task } = await supabase
    .from('user_tasks')
    .select('credits_disbursed')
    .eq('id', taskId)
    .single();

  const currentDisbursed = task?.credits_disbursed || 0;

  await supabase
    .from('user_tasks')
    .update({ credits_disbursed: currentDisbursed + amount })
    .eq('id', taskId);

  // Decrease parent's reserved_credit (credit was transferred, reservation is fulfilled)
  await adjustReservedCredit(supabase, fromUserInfoId, -amount);

  console.log('[creditService] Task credits disbursed:', {
    creditEarned: amount,
    recipientBalance: result.recipientBalance,
    senderBalance: result.senderBalance,
  });

  return {
    creditEarned: amount,
    creditDisbursed: true,
    senderBalance: result.senderBalance,
    recipientBalance: result.recipientBalance,
  };
}
