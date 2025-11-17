import { getSupabaseClient } from '~~/server/utils/authConfig';
import { TASK_STATUS } from '~~/shared/constants';
import { getUserInfo } from '~~/server/utils/auth';
import { codeService } from '~~/server/services/codeService';
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

    // Create chapter associations for this task
    const chapterInserts = chapters.map((chapterName) => ({
      user_task_id: task.id,
      chapter_name: chapterName
    }));

    const { data: taskChapters, error: chapterError } = await supabase
      .from('user_tasks_chapters')
      .insert(chapterInserts)
      .select('*');

    if (chapterError) {
      console.error('Failed to create task chapters:', chapterError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task chapter associations'
      });
    }

    console.log(`Successfully created task "${name}" with ${chapters.length} chapters`);

    return {
      success: true,
      task: {
        ...task,
        chapters: taskChapters
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
