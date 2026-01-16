/**
 * Batch check if quizzes exist for multiple user task-chapter assignments
 *
 * POST body:
 * - userTasksChapterIds: string[] - Array of user task-chapter assignment identifiers
 *
 * Returns:
 * - results: { [id]: { exists: boolean, questionCount: number, status: string } }
 */

import { getSupabaseClient } from '~~/server/utils/authConfig';
import { TASK_CHAPTER_STATUS } from '~~/shared/constants/codes';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user (validates user is logged in)
    await requireAuth(event);

    // Get request body
    const body = await readBody(event);
    const userTasksChapterIds = body.userTasksChapterIds as string[];

    if (!userTasksChapterIds || !Array.isArray(userTasksChapterIds) || userTasksChapterIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: userTasksChapterIds (must be a non-empty array)',
      });
    }

    // Limit batch size to prevent abuse
    if (userTasksChapterIds.length > 100) {
      throw createError({
        statusCode: 400,
        message: 'Too many IDs. Maximum batch size is 100.',
      });
    }

    // Get Supabase client
    const supabase = await getSupabaseClient(event);

    // Run both queries in parallel for efficiency
    const [questionsResult, chaptersResult] = await Promise.all([
      supabase
        .from('user_tasks_chapters_questions')
        .select('user_tasks_chapters_id')
        .in('user_tasks_chapters_id', userTasksChapterIds),
      supabase
        .from('user_tasks_chapters')
        .select('id, status')
        .in('id', userTasksChapterIds),
    ]);

    const { data: linkedQuestions, error } = questionsResult;
    const { data: chaptersData, error: chaptersError } = chaptersResult;

    if (error) {
      console.error('[check-existing-batch] Error querying linked questions:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to check existing quizzes',
      });
    }

    if (chaptersError) {
      console.error('[check-existing-batch] Error querying chapter status:', chaptersError);
      throw createError({
        statusCode: 500,
        message: 'Failed to check chapter status',
      });
    }

    // Build status map
    const statusMap: Record<string, { status: string }> = {};
    for (const chapter of chaptersData || []) {
      statusMap[chapter.id] = {
        status: chapter.status,
      };
    }

    // Count questions per user_tasks_chapters_id
    const countMap: Record<string, number> = {};
    for (const row of linkedQuestions || []) {
      const id = row.user_tasks_chapters_id;
      countMap[id] = (countMap[id] || 0) + 1;
    }

    // Build results for all requested IDs
    const results: Record<
      string,
      { exists: boolean; questionCount: number; status: string }
    > = {};
    for (const id of userTasksChapterIds) {
      const questionCount = countMap[id] || 0;
      results[id] = {
        exists: questionCount > 0,
        questionCount,
        status: statusMap[id]?.status || TASK_CHAPTER_STATUS.OPEN,
      };
    }

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error('[check-existing-batch] Error:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to check existing quizzes',
    });
  }
});
