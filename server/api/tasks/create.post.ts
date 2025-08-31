import { getSupabaseClient } from '#imports';
import { RECURRENCE_FREQUENCY, TASK_STATUS, TASK_PRIORITY } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const {
      assignee_user_info_id,
      subject,
      lessonGenerationType,
      name,
      credit,
      due_date,
      priority,
      auto_approve,
      is_recurring,
      recurrence_frequency,
      recurrence_interval,
      recurrence_end_date
    } = body;

    // Validate required fields
    if (!assignee_user_info_id || !subject || !lessonGenerationType || !name || credit === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'assignee_user_info_id, subject, lessonGenerationType, name, and credit are required'
      });
    }

    // Get creator's user_info_id
    const creatorInfo = await getUserInfo(event);

    // Verify that the assignee is in the same group as the creator
    const { data: groupRelation, error: relationError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups!inner(
          created_by,
          group_members!inner(
            user_info_id,
            status
          )
        )
      `)
      .eq('user_info_id', creatorInfo.id)
      .eq('status', 'active');

    if (relationError) {
      console.error('Failed to fetch group relationships:', relationError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify relationship'
      });
    }

    // Check if assignee is in any of the creator's groups
    let canAssignTask = false;

    groupRelation?.forEach((creatorGroup) => {
      if (creatorGroup.groups.created_by === creatorInfo.id) {
        const hasAssignee = creatorGroup.groups.group_members.some(
          (member) => member.user_info_id === assignee_user_info_id && member.status === 'active'
        );
        if (hasAssignee) {
          canAssignTask = true;
        }
      }
    });

    if (!canAssignTask) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create tasks for members in your family group'
      });
    }

    // Validate recurring task fields
    if (is_recurring) {
      if (!recurrence_frequency || !Object.values(RECURRENCE_FREQUENCY).includes(recurrence_frequency)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Valid recurrence_frequency is required for recurring tasks (${Object.values(RECURRENCE_FREQUENCY).join(', ')})`
        });
      }
      if (recurrence_interval && (recurrence_interval < 1 || recurrence_interval > 365)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'recurrence_interval must be between 1 and 365'
        });
      }
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .insert({
        creator_user_info_id: creatorInfo.id,
        assignee_user_info_id,
        name,
        subject,
        lesson_generation_type: lessonGenerationType,
        credit: parseInt(credit),
        status: TASK_STATUS.PENDING,
        due_date: due_date ? new Date(due_date).toISOString() : null,
        priority: priority || TASK_PRIORITY.MEDIUM,
        auto_approve: auto_approve || false,
        is_recurring: is_recurring || false,
        recurrence_frequency: is_recurring ? recurrence_frequency : null,
        recurrence_interval: is_recurring ? (recurrence_interval || 1) : null,
        recurrence_end_date: is_recurring && recurrence_end_date ? new Date(recurrence_end_date).toISOString() : null
      })
      .select(`
        id,
        name,
        subject,
        lesson_generation_type,
        credit,
        status,
        due_date,
        priority,
        created_at,
        updated_at
      `)
      .single();

    if (taskError) {
      console.error('Failed to create task:', taskError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task'
      });
    }

    return {
      success: true,
      task: {
        ...task,
        creditInDollars: (task.credit / 100).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Failed to create task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create task'
    });
  }
});
