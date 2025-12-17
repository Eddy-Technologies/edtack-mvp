/**
 * Generate a new quiz for a chapter
 *
 * Request body:
 * - prompt: string - Generated prompt from useStudy composable
 * - chapterName: string - Chapter identifier
 * - chapterDisplayName: string - Human-readable chapter name
 * - subjectName: string - Subject name
 * - userLevel: string - User's education level
 * - syllabusType: string - User's syllabus type
 * - numQuestions: number - Number of questions to generate (default: 10)
 *
 * Returns:
 * - success: boolean
 * - questionCount: number
 * - message: string
 */

import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { persistGeneratedQuestions, linkQuestionsToChapter } from '~~/server/services/quizPersistenceService';
import { TASK_CHAPTER_STATUS } from '~~/shared/constants/codes';

export default defineEventHandler(async (event) => {
  // Parse body early so we can access userTasksChapterId in catch block
  const body = await readBody(event);
  const {
    prompt,
    chapterName,
    chapterDisplayName,
    subjectName,
    userLevel,
    syllabusType,
    numQuestions = 10,
    userTasksChapterId,
  } = body;

  try {
    // Get authenticated user
    const userInfo = await getUserInfo(event);

    // Validate required fields
    if (!prompt || !chapterName || !chapterDisplayName || !subjectName) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: prompt, chapterName, chapterDisplayName, or subjectName',
      });
    }

    console.log('[generate] Generating quiz for:', {
      chapterName,
      chapterDisplayName,
      subjectName,
      numQuestions,
      userId: userInfo.user_id,
    });

    const supabase = await getSupabaseClient(event);

    // Check if quiz already exists and if task is OPEN (single query for efficiency)
    if (userTasksChapterId) {
      const { data: chapterData } = await supabase
        .from('user_tasks_chapters')
        .select(`
          id,
          user_tasks!inner(status),
          user_tasks_chapters_questions(id)
        `)
        .eq('id', userTasksChapterId)
        .single();

      // Check if quiz already exists
      const exists = (chapterData?.user_tasks_chapters_questions?.length || 0) > 0;
      if (exists) {
        console.log('[generate] Quiz already generated for this task-chapter:', userTasksChapterId);
        throw createError({
          statusCode: 409,
          message: 'Quiz already generated for this task. Please use the existing quiz.',
        });
      }

      // Check if associated task is OPEN
      if (chapterData?.user_tasks?.status !== 'OPEN') {
        throw createError({
          statusCode: 400,
          message: 'Cannot generate quiz for a closed or expired task',
        });
      }
    }

    // Mark as GENERATING before calling Python backend
    if (userTasksChapterId) {
      await supabase
        .from('user_tasks_chapters')
        .update({
          status: TASK_CHAPTER_STATUS.GENERATING,
          generation_started_at: new Date().toISOString(),
        })
        .eq('id', userTasksChapterId);
      console.log('[generate] Set status to GENERATING for:', userTasksChapterId);
    }

    // Call Python backend to generate quiz
    const quizResponse = await generateQuiz({
      prompt,
      chapterName,
      chapterDisplayName,
      subjectName,
      userLevel: userLevel || 'unknown',
      syllabusType: syllabusType || 'unknown',
      numQuestions,
    });

    if (!quizResponse.success || !quizResponse.questions || quizResponse.questions.length === 0) {
      throw createError({
        statusCode: 500,
        message: 'Failed to generate quiz questions',
      });
    }

    console.log('[generate] Generated', quizResponse.questions.length, 'questions, persisting to database...');

    // Persist questions using service
    const persistResults = await persistGeneratedQuestions(supabase, quizResponse.questions, chapterName);

    // Count successful persists
    const successfulResults = persistResults.filter((r) => r.success);
    const failCount = persistResults.length - successfulResults.length;

    if (failCount > 0) {
      console.warn(`[generate] Failed to persist ${failCount} out of ${persistResults.length} questions`);
    }

    console.log('[generate] Successfully persisted', successfulResults.length, 'questions');

    // Link questions to task-chapter if provided
    if (userTasksChapterId && successfulResults.length > 0) {
      const questionIds = successfulResults.map((r) => r.questionId);
      console.log('[generate] Linking', questionIds.length, 'questions to task-chapter:', userTasksChapterId);

      await linkQuestionsToChapter(supabase, questionIds, userTasksChapterId);
      console.log('[generate] Successfully linked questions to task-chapter');

      // Reset status after successful generation
      await supabase
        .from('user_tasks_chapters')
        .update({
          status: TASK_CHAPTER_STATUS.OPEN,
          generation_started_at: null,
        })
        .eq('id', userTasksChapterId);
      console.log('[generate] Reset status to OPEN for:', userTasksChapterId);
    }

    return {
      success: true,
      questionCount: successfulResults.length,
      message: `Successfully generated and stored ${successfulResults.length} questions`,
    };
  } catch (error: any) {
    console.error('[generate] Error:', error);

    // Reset status on failure if we started generation
    if (userTasksChapterId) {
      try {
        const supabase = await getSupabaseClient(event);
        await supabase
          .from('user_tasks_chapters')
          .update({ status: TASK_CHAPTER_STATUS.OPEN, generation_started_at: null })
          .eq('id', userTasksChapterId);
        console.log('[generate] Reset status on error for:', userTasksChapterId);
      } catch (resetError) {
        console.error('[generate] Failed to reset status:', resetError);
      }
    }

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate quiz',
    });
  }
});
