import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { TASK_STATUS, RECURRENCE_FREQUENCY } from '~~/shared/constants';
import type { Database } from '~~/types/supabase';

export default defineNitroPlugin(async (nitroApp) => {
  // Schedule to run every hour
  setInterval(async () => {
    console.log('Running recurring tasks check at', new Date().toISOString());

    try {
      // Use service role key for server-side operations
      const config = useRuntimeConfig();
      const supabase: SupabaseClient<Database> = createClient(
        config.private.supabaseUrl,
        config.private.supabaseServiceRoleKey
      );

      const now = new Date();

      // Find overdue incomplete recurring task instances
      const { data: overdueInstances, error: fetchError } = await supabase
        .from('user_tasks')
        .select(`
        id,
        due_date,
        status,
        parent_task_id,
        creator_user_info_id,
        assignee_user_info_id,
        name,
        subtitle,
        description,
        credit,
        priority,
        category,
        auto_approve,
        parent_task:parent_task_id (
          recurrence_frequency,
          recurrence_interval,
          recurrence_end_date
        )
      `)
        .not('parent_task_id', 'is', null)
        .in('status', [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS])
        .lt('due_date', now.toISOString());

      if (fetchError) {
        console.error('Failed to fetch overdue instances:', fetchError);
        return;
      }

      let expiredCount = 0;
      let createdCount = 0;
      const errors = [];

      for (const instance of overdueInstances || []) {
        try {
        // Mark instance as expired
          const { error: expireError } = await supabase
            .from('user_tasks')
            .update({ status: TASK_STATUS.EXPIRED })
            .eq('id', instance.id);

          if (expireError) {
            throw new Error(`Failed to expire task: ${expireError.message}`);
          }

          expiredCount++;
          if (!instance.due_date || !instance.parent_task?.recurrence_frequency || !instance.parent_task?.recurrence_interval) {
            console.warn(`Skipping non-recurring task instance ${instance.id}`);
            continue;
          }

          // Calculate next due date
          const nextDueDate = calculateNextDueDate(
            new Date(instance.due_date),
            instance.parent_task?.recurrence_frequency,
            instance.parent_task?.recurrence_interval
          );

          // Check if we've exceeded the end date
          if (instance.parent_task?.recurrence_end_date &&
            nextDueDate > new Date(instance.parent_task?.recurrence_end_date)) {
            console.log(`Recurring task ${instance.id} has ended`);
            continue;
          }

          // Create next instance
          const { error: createError } = await supabase
            .from('user_tasks')
            .insert({
              creator_user_info_id: instance.creator_user_info_id,
              assignee_user_info_id: instance.assignee_user_info_id,
              name: instance.name,
              subtitle: instance.subtitle,
              description: instance.description,
              credit: instance.credit,
              status: TASK_STATUS.PENDING,
              due_date: nextDueDate.toISOString(),
              priority: instance.priority,
              category: instance.category,
              auto_approve: instance.auto_approve,
              is_recurring: false, // Instances are not recurring themselves
              parent_task_id: instance.parent_task_id
            });

          if (createError) {
            throw new Error(`Failed to create next instance: ${createError.message}`);
          }

          createdCount++;
          console.log(`Created next instance for task "${instance.name}" due ${nextDueDate.toISOString()}`);
        } catch (error) {
          console.error(`Failed to process recurring task ${instance.id}:`, error);
          errors.push({ taskId: instance.id, error: error.message });
        }
      }

      console.log(`Recurring tasks processed: ${expiredCount} expired, ${createdCount} created`);

      if (errors.length > 0) {
        console.error('Errors during recurring task processing:', errors);
      }
    } catch (error) {
      console.error('Failed to process recurring tasks:', error);
    }
  }, 60 * 60 * 1000); // Run every hour (60 minutes * 60 seconds * 1000ms)
});

function calculateNextDueDate(currentDueDate: Date, frequency: string, interval: number): Date {
  const nextDate = new Date(currentDueDate);

  switch (frequency) {
    case RECURRENCE_FREQUENCY.DAILY:
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case RECURRENCE_FREQUENCY.WEEKLY:
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;

    case RECURRENCE_FREQUENCY.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;

    default:
      throw new Error(`Invalid recurrence frequency: ${frequency}`);
  }

  return nextDate;
}
