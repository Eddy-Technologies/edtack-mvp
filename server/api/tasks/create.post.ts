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
        .from('chat_threads')
        .insert({
          user_infos_id: assigneeUserInfoId,
          title: `${name} - ${initialDueDate.toDateString()}`
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
        subject: subject,
        lesson_generation_type: lessonGenerationType,
        questions_per_quiz: questionsPerQuiz || 10,
        required_score: requiredScore || 70,
        credit_reward: credit,
        task_name: name,
        due_date: initialDueDate.toISOString(),
        timestamp: new Date().toISOString()
      };

      // Generate content using the same logic as recurring tasks
      const generatedContent = await generateTaskContent(initPrompt);
      // Call API see if can get content in the first place

      // Create the initial task thread record
      const { data: newTaskThread, error: taskThreadError } = await supabase
        .from('task_threads')
        .insert({
          user_task_id: task.id,
          chat_thread_id: chatThread.id,
          due_date: initialDueDate.toISOString(),
          init_prompt: initPrompt,
          generated_content: generatedContent,
          status: TASK_THREAD_STATUS.OPEN
        })
        .select('id')
        .single();

      if (taskThreadError) {
        console.error('Failed to create task thread:', taskThreadError);
        throw new Error('Task thread creation failed');
      }

      taskThread = newTaskThread;

      // Create initial chat messages for the conversation
      await createChatMessages(supabase, chatThread.id, initPrompt, generatedContent);

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
        creditInDollars: (task.credit / 100).toFixed(2)
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

/**
 * Placeholder function for content generation API call
 * This matches the implementation in recurring-tasks.ts for consistency
 * In production, this would call the actual AI/content generation service
 */
async function generateTaskContent(initPrompt: any): Promise<any> {
  // Simulate content generation with placeholder data
  const placeholderContent = {
    quiz_id: `quiz_${Date.now()}`,
    questions: Array.from({ length: initPrompt.questions_per_quiz }, (_, i) => ({
      id: `q_${i + 1}`,
      question: `Sample question ${i + 1} for ${initPrompt.subject}`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      explanation: `This is the explanation for question ${i + 1}`
    })),
    metadata: {
      subject: initPrompt.subject,
      difficulty: 'grade_appropriate',
      estimated_duration: '15 minutes',
      generated_at: new Date().toISOString()
    }
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('Generated placeholder content for new task:', initPrompt.task_name);
  return placeholderContent;
}

/**
 * Creates initial chat messages for the task thread conversation
 * Creates two messages: one for the initial prompt, one for the generated content
 * This matches the implementation in recurring-tasks.ts for consistency
 */
async function createChatMessages(
  supabase: any,
  chatThreadId: string,
  initPrompt: any,
  generatedContent: any
) {
  try {
    // Create initial prompt message
    const { error: promptMessageError } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: chatThreadId,
        sender: null, // System message
        type: 'system_prompt',
        content: JSON.stringify(initPrompt)
      });

    if (promptMessageError) {
      console.error('Failed to create prompt message:', promptMessageError);
    }

    // Create generated content message
    const { error: contentMessageError } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: chatThreadId,
        sender: null, // System message
        type: 'generated_content',
        content: JSON.stringify(generatedContent)
      });

    if (contentMessageError) {
      console.error('Failed to create content message:', contentMessageError);
    }
  } catch (error) {
    console.error('Error creating chat messages:', error);
  }
}
