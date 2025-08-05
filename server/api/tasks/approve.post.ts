import { getSupabaseClient } from '#imports';
import { getCodes } from '~~/server/services/codeService';
import { TASK_STATUS, OPERATION_TYPE } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { task_id, approved, approval_notes } = body;

    if (!task_id || approved === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'task_id and approved (boolean) are required'
      });
    }

    // Get authenticated user (parent)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get creator's user_info_id
    const { data: creatorInfo, error: creatorError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (creatorError || !creatorInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Creator user info not found'
      });
    }

    // Get the task and verify creator owns it
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', task_id)
      .eq('creator_user_info_id', creatorInfo.id)
      .single();

    if (taskError || !task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found or you do not have permission to approve it'
      });
    }

    // Check if task can be approved/rejected
    if (task.status !== TASK_STATUS.COMPLETED) {
      throw createError({
        statusCode: 400,
        statusMessage: `Task cannot be approved/rejected. Current status: ${task.status}`
      });
    }

    const newStatus = approved ? TASK_STATUS.APPROVED : TASK_STATUS.REJECTED;

    // Start transaction
    if (approved) {
      // Award credits to child if approved
      // First get current credit balance
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('credit')
        .eq('user_info_id', task.assignee_user_info_id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch current credits:', fetchError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch current credit balance'
        });
      }

      const newCreditAmount = (currentCredits.credit || 0) + task.credit;

      const { error: creditError } = await supabase
        .from('user_credits')
        .update({
          credit: newCreditAmount
        })
        .eq('user_info_id', task.assignee_user_info_id);

      if (creditError) {
        console.error('Failed to award credits:', creditError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to award credits to child'
        });
      }

      // Get operation codes for credit transaction
      const operationCodes = await getCodes(supabase, 'operation_type');

      // Create credit transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_info_id: task.assignee_user_info_id,
          transaction_type: 'TASK_REWARD',
          amount: task.credit,
          currency: 'SGD',
          description: `Task completed: ${task.name}`,
          is_internal: true,
          user_task_id: task.id,
          metadata: JSON.stringify({
            task_name: task.name,
            creator_user_info_id: task.creator_user_info_id,
            completion_date: task.completed_at
          })
        });

      if (transactionError) {
        console.error('Failed to create credit transaction:', transactionError);
        // Don't fail the approval, but log the error
      }
    }

    // Update task status
    const { data: updatedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update({
        status: newStatus,
        approval_notes: approval_notes || null,
        approved_at: new Date().toISOString()
      })
      .eq('id', task_id)
      .eq('creator_user_info_id', creatorInfo.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update task status:', updateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update task status'
      });
    }

    return {
      success: true,
      message: approved ?
        `Task approved! ${task.credit / 100} SGD credited to child.` :
        'Task rejected.',
      task: {
        id: updatedTask.id,
        name: updatedTask.name,
        status: updatedTask.status,
        credit: updatedTask.credit,
        creditInDollars: (updatedTask.credit / 100).toFixed(2),
        approvedAt: updatedTask.approved_at,
        approvalNotes: updatedTask.approval_notes
      }
    };
  } catch (error) {
    console.error('Failed to approve/reject task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to approve/reject task'
    });
  }
});
