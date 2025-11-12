/**
 * Check if a quiz already exists for a user and chapter
 *
 * Query parameters:
 * - chapterId: The chapter identifier
 *
 * Returns:
 * - exists: boolean - Whether quiz exists
 * - hasQuestions: boolean - Whether user has questions for this chapter
 * - questionCount: number - Number of questions found
 *
 * TODO: When implementing multiple quizzes per chapter, this will need to query
 * quiz_sessions table instead of questions table directly.
 */

import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user (validates user is logged in)
    const _userInfo = await getUserInfo(event);

    // Get query parameters
    const query = getQuery(event);
    const chapterId = query.chapterId as string;
    const userTasksChapterId = query.userTasksChapterId as string;

    if (!chapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: chapterId',
      });
    }

    // Get Supabase client
    const supabase = await getSupabaseClient(event);

    // If userTasksChapterId provided, check junction table for linked questions
    if (userTasksChapterId) {
      const { data: linkedQuestions, error } = await supabase
        .from('user_tasks_chapters_questions')
        .select('id')
        .eq('user_tasks_chapters_id', userTasksChapterId);

      if (error) {
        console.error('[check-existing] Error querying linked questions:', error);
        throw createError({
          statusCode: 500,
          message: 'Failed to check existing quiz',
        });
      }

      const hasQuestions = linkedQuestions && linkedQuestions.length > 0;
      const questionCount = linkedQuestions?.length || 0;

      console.log(
        `[check-existing] Task-Chapter ${userTasksChapterId}: ${hasQuestions ? 'has' : 'no'} linked quiz (${questionCount} questions)`
      );

      return {
        success: true,
        exists: hasQuestions,
        hasQuestions,
        questionCount,
      };
    }

    // Fallback: Check if questions exist for this chapter (original behavior)
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id')
      .eq('chapter_id', chapterId)
      .eq('source_name', 'AI_GENERATED'); // Only count AI-generated questions for quizzes

    if (error) {
      console.error('[check-existing] Error querying questions:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to check existing quiz',
      });
    }

    const hasQuestions = questions && questions.length > 0;
    const questionCount = questions?.length || 0;

    console.log(
      `[check-existing] Chapter ${chapterId}: ${hasQuestions ? 'has' : 'no'} quiz (${questionCount} questions)`
    );

    return {
      success: true,
      exists: hasQuestions,
      hasQuestions,
      questionCount,
    };
  } catch (error: any) {
    console.error('[check-existing] Error:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to check existing quiz',
    });
  }
});
