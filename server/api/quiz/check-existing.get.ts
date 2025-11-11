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

    if (!chapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: chapterId',
      });
    }

    // Get Supabase client
    const supabase = await getSupabaseClient(event);

    // Check if user has questions for this chapter
    // Note: Currently we check questions directly. In the future, this will query quiz_sessions
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
