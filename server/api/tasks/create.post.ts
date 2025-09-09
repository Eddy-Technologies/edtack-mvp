import { getSupabaseClient } from '~~/server/utils/authConfig';
import { RECURRENCE_FREQUENCY, TASK_STATUS, TASK_THREAD_STATUS } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';
import { codeService, getCodes } from '~~/server/services/codeService';
import { CODE_CATEGORIES } from '~/stores/codes';

export interface CreateTaskReq {
  assigneeUserInfoId: string;
  subject: string;
  lessonGenerationType: string;
  creditsPerQuiz: number;
  requiredScore: number;
  chapters: string[];
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body: CreateTaskReq = await readBody(event);

    const { assigneeUserInfoId, subject, lessonGenerationType, creditsPerQuiz, requiredScore, chapters } = body;

    // Validate required fields
    if (!assigneeUserInfoId || !subject || !lessonGenerationType || creditsPerQuiz === undefined || !chapters?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'assigneeUserInfoId, subject, lessonGenerationType, creditsPerQuiz, and chapters are required'
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
    if (creditsPerQuiz < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'creditsPerQuiz must be at least 1'
      });
    }

    if (requiredScore !== undefined && (requiredScore < 0 || requiredScore > 100)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'requiredScore must be between 0 and 100'
      });
    }
    const { data: subjectData } = await supabase
      .from('subjects')
      .select(`*`)
      .eq('name', subject)
      .single();

    // Generate task name from subject and lesson generation type
    const typeLabel = await codeService.getCode(supabase, CODE_CATEGORIES.LESSON_GENERATION_TYPE, lessonGenerationType);
    const name = `${subjectData?.display_name} ${typeLabel?.name}`;

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .insert({
        creator_user_info_id: creatorInfo.id,
        assignee_user_info_id: assigneeUserInfoId,
        name,
        subject,
        lesson_generation_type: lessonGenerationType,
        credit: creditsPerQuiz,
        questions_per_quiz: 10, // Default to 10 questions
        required_score: requiredScore || 0,
        recurrence_frequency: RECURRENCE_FREQUENCY.ONE_OFF,
        due_date: null,
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

    // Step 1.5: Create chapter associations for this task
    const chapterInserts = chapters.map((chapterName) => ({
      user_task_id: task.id,
      chapter_name: chapterName
    }));

    const { error: chapterError } = await supabase
      .from('user_tasks_chapters')
      .insert(chapterInserts);

    if (chapterError) {
      console.error('Failed to create task chapters:', chapterError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task chapter associations'
      });
    }

    // Step 2: Create initial task_thread for this task
    // According to the architecture, every task gets an immediate thread instance
    let taskThread = null;
    let chatThread = null;

    try {
      // Calculate due date for the initial thread - set to end of today
      const now = new Date();
      const initialDueDate = new Date(now);
      initialDueDate.setHours(23, 59, 59, 999);

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

      // Create the initial task thread record
      const { data: newTaskThread, error: taskThreadError } = await supabase
        .from('task_threads')
        .insert({
          user_task_id: task.id,
          thread_id: chatThread.id,
          due_date: initialDueDate.toISOString(),
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
