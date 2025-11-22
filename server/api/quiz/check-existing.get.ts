/**
 * Check if a quiz already exists for a user task-chapter assignment
 *
 * Query parameters:
 * - userTasksChapterId: The user task-chapter assignment identifier
 *
 * Returns:
 * - exists: boolean - Whether quiz exists
 * - hasQuestions: boolean - Whether questions are linked to this task-chapter
 * - questionCount: number - Number of questions found
 */

import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user (validates user is logged in)
    await requireAuth(event);

    // Get query parameters
    const query = getQuery(event);
    const userTasksChapterId = query.userTasksChapterId as string;

    if (!userTasksChapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: userTasksChapterId',
      });
    }

    // Get Supabase client
    const supabase = await getSupabaseClient(event);

    // Check junction table for linked questions
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
