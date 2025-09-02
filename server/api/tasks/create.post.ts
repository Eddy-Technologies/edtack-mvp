import { getSupabaseClient } from '#imports';
import { RECURRENCE_FREQUENCY, TASK_STATUS, TASK_THREAD_STATUS } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';
import { codeService, getCodes } from '~~/server/services/codeService';
import { CODE_CATEGORIES } from '~/stores/codes';

export interface CreateTaskReq {
  assigneeUserInfoId: string;
  subject: string;
  lessonGenerationType: string;
  credit: number;
  questionsPerQuiz: number;
  requiredScore: number;
  dueDate: string | null;
  recurrenceFrequency: RECURRENCE_FREQUENCY;
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body: CreateTaskReq = await readBody(event);

    const { assigneeUserInfoId, subject, lessonGenerationType, credit, questionsPerQuiz, requiredScore, dueDate, recurrenceFrequency } = body;

    // Validate required fields
    if (!assigneeUserInfoId || !subject || !lessonGenerationType || credit === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'assigneeUserInfoId, subject, lessonGenerationType, name, and credit are required'
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
          (member) => member.user_info_id === assigneeUserInfoId && member.status === 'active'
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

    // Validate quiz fields
    if (questionsPerQuiz && (questionsPerQuiz < 1 || questionsPerQuiz > 50)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'questionsPerQuiz must be between 1 and 50'
      });
    }

    if (requiredScore !== undefined && (requiredScore < 0 || requiredScore > 100)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'requiredScore must be between 0 and 100'
      });
    }

    // Generate task name from subject and lesson generation type
    const subjectLabel = await codeService.getCode(supabase, CODE_CATEGORIES.SUBJECT, subject);
    const typeLabel = await codeService.getCode(supabase, CODE_CATEGORIES.LESSON_GENERATION_TYPE, lessonGenerationType);
    const name = `${subjectLabel?.name} ${typeLabel?.name}`;

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .insert({
        creator_user_info_id: creatorInfo.id,
        assignee_user_info_id: assigneeUserInfoId,
        name,
        subject,
        lesson_generation_type: lessonGenerationType,
        credit,
        questions_per_quiz: questionsPerQuiz || 10,
        required_score: requiredScore || 0,
        recurrence_frequency: recurrenceFrequency || RECURRENCE_FREQUENCY.ONE_OFF,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: TASK_STATUS.OPEN,
      })
      .select('*')
      .single();

    if (taskError) {
      console.error('Failed to create task:', taskError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task'
      });
    }

    // Step 2: Create initial task_thread for this task
    // According to the architecture, every task gets an immediate thread instance
    let taskThread = null;
    let chatThread = null;

    try {
      // Calculate due date for the initial thread based on task configuration
      const initialDueDate = calculateInitialDueDate(dueDate, recurrenceFrequency);

      // Create chat thread for this task thread
      const { data: newChatThread, error: chatThreadError } = await supabase
        .from('threads')
        .insert({
          subject: subject,
          user_infos_id: assigneeUserInfoId,
          title: name
        })
        .select('id')
        .single();

      if (chatThreadError) {
        console.error('Failed to create chat thread:', chatThreadError);
        throw new Error('Chat thread creation failed');
      }

      chatThread = newChatThread;

      // Prepare initial prompt for content generation
      const initPrompt = {
        prompt: `Create a quiz for the topic: ${subject}. Include ${questionsPerQuiz} questions with a required score of ${requiredScore}.`
      };

      // Create the initial task thread record
      const { data: newTaskThread, error: taskThreadError } = await supabase
        .from('task_threads')
        .insert({
          user_task_id: task.id,
          thread_id: chatThread.id,
          due_date: initialDueDate.toISOString(),
          init_prompt: initPrompt,
          status: TASK_THREAD_STATUS.OPEN
        })
        .select('id')
        .single();

      if (taskThreadError) {
        console.error('Failed to create task thread:', taskThreadError);
        throw new Error('Task thread creation failed');
      }

      taskThread = newTaskThread;
      console.log(`Successfully created initial task thread ${taskThread.id} for new task "${name}"`);
    } catch (threadError) {
      console.error('Failed to create initial task thread:', threadError);
      // Task was created successfully, but thread creation failed
      // Log the error but don't fail the entire request
      console.warn('Task created successfully but initial thread creation failed - will be handled by recurring tasks job');
    }

    return {
      success: true,
      task: {
        ...task,
      },
      // Include thread info if created successfully
      ...(taskThread && { taskThread: { id: taskThread.id } }),
      ...(chatThread && { chatThread: { id: chatThread.id } })
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

/**
 * Calculate the initial due date for a new task
 * - For one-off tasks: use provided due_date or end of today
 * - For recurring tasks: use recurrence logic to set appropriate due date
 */
function calculateInitialDueDate(providedDueDate: string | null, recurrenceFrequency: string | null): Date {
  const now = new Date();

  // If a specific due date was provided, use it
  if (providedDueDate) {
    return new Date(providedDueDate);
  }

  // For recurring tasks, calculate based on frequency
  if (recurrenceFrequency) {
    switch (recurrenceFrequency) {
      case RECURRENCE_FREQUENCY.DAILY: {
        // Daily tasks are due at the end of the current day
        const dailyDue = new Date(now);
        dailyDue.setHours(23, 59, 59, 999);
        return dailyDue;
      }

      case RECURRENCE_FREQUENCY.WEEKLY: {
        // Weekly tasks are due at the end of Sunday (this Sunday if today is Sunday, next Sunday otherwise)
        const weeklyDue = new Date(now);
        const daysUntilSunday = 7 - weeklyDue.getDay();
        if (daysUntilSunday === 7) {
          // Today is Sunday, due today
          weeklyDue.setHours(23, 59, 59, 999);
        } else {
          // Due next Sunday
          weeklyDue.setDate(weeklyDue.getDate() + daysUntilSunday);
          weeklyDue.setHours(23, 59, 59, 999);
        }
        return weeklyDue;
      }

      case RECURRENCE_FREQUENCY.MONTHLY: {
        // Monthly tasks are due at the end of the current month
        const monthlyDue = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthlyDue.setHours(23, 59, 59, 999);
        return monthlyDue;
      }

      case RECURRENCE_FREQUENCY.ONE_OFF:
      default:
        // Fall through to default behavior
        break;
    }
  }

  // Default: due at the end of today
  const defaultDue = new Date(now);
  defaultDue.setHours(23, 59, 59, 999);
  return defaultDue;
}
