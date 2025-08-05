import { getSupabaseClient } from '#imports';
import { TASK_STATUS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { task_id, completion_notes } = body;

    if (!task_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'task_id is required'
      });
    }

    // Get authenticated user (child)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get assignee's user_info_id
    const { data: assigneeInfo, error: assigneeError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (assigneeError || !assigneeInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Assignee user info not found'
      });
    }

    // Get the task and verify assignee owns it
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('id', task_id)
      .eq('assignee_user_info_id', assigneeInfo.id)
      .single();

    if (taskError || !task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found or you do not have permission to complete it'
      });
    }

    // Check if task can be completed
    if (task.status !== TASK_STATUS.PENDING && task.status !== TASK_STATUS.IN_PROGRESS) {
      throw createError({
        statusCode: 400,
        statusMessage: `Task cannot be completed. Current status: ${task.status}`
      });
    }

    // Check if task should be auto-approved
    const shouldAutoApprove = task.auto_approve;
    const newStatus = shouldAutoApprove ? TASK_STATUS.APPROVED : TASK_STATUS.COMPLETED;

    let updatedTask;

    if (shouldAutoApprove) {
      // Auto-approve: update task status and award credits immediately
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

      // Update credits
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
          statusMessage: 'Failed to award credits'
        });
      }

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
            completion_date: new Date().toISOString(),
            auto_approved: true
          })
        });

      if (transactionError) {
        console.error('Failed to create credit transaction:', transactionError);
        // Don't fail the completion, but log the error
      }

      // Update task to approved status
      const { data: autoApprovedTask, error: updateError } = await supabase
        .from('user_tasks')
        .update({
          status: TASK_STATUS.APPROVED,
          completion_notes: completion_notes || null,
          completed_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          approval_notes: 'Auto-approved'
        })
        .eq('id', task_id)
        .eq('assignee_user_info_id', assigneeInfo.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to auto-approve task:', updateError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to complete and auto-approve task'
        });
      }

      updatedTask = autoApprovedTask;
    } else {
      // Regular completion - requires parent approval
      const { data: completedTask, error: updateError } = await supabase
        .from('user_tasks')
        .update({
          status: TASK_STATUS.COMPLETED,
          completion_notes: completion_notes || null,
          completed_at: new Date().toISOString()
        })
        .eq('id', task_id)
        .eq('assignee_user_info_id', assigneeInfo.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to complete task:', updateError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to complete task'
        });
      }

      updatedTask = completedTask;
    }

    return {
      success: true,
      message: shouldAutoApprove ?
        `Task completed and auto-approved! ${(task.credit / 100).toFixed(0)} credits awarded.` :
        'Task completed successfully. Waiting for parent approval.',
      task: {
        id: updatedTask.id,
        name: updatedTask.name,
        status: updatedTask.status,
        completedAt: updatedTask.completed_at,
        completionNotes: updatedTask.completion_notes,
        approvedAt: updatedTask.approved_at,
        autoApproved: shouldAutoApprove
      }
    };
  } catch (error) {
    console.error('Failed to complete task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to complete task'
    });
  }
});
