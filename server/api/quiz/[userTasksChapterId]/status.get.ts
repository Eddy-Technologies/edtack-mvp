/**
 * Check quiz generation status for a single task-chapter
 *
 * Route: /api/quiz/[userTasksChapterId]/status
 * Method: GET
 *
 * Returns:
 * - status: 'OPEN' | 'GENERATING' | 'COMPLETED' | 'EXPIRED'
 * - generationStartedAt: ISO timestamp (if GENERATING)
 * - hasQuiz: boolean (whether questions exist)
 */

import { getSupabaseClient } from '~~/server/utils/authConfig';
import { TASK_CHAPTER_STATUS } from '~~/shared/constants/codes';

export default defineEventHandler(async (event) => {
  try {
    await requireAuth(event);

    const userTasksChapterId = getRouterParam(event, 'userTasksChapterId');

    if (!userTasksChapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: userTasksChapterId',
      });
    }

    const supabase = await getSupabaseClient(event);

    // Run both queries in parallel for efficiency
    const [chapterResult, countResult] = await Promise.all([
      supabase
        .from('user_tasks_chapters')
        .select('status, generation_started_at')
        .eq('id', userTasksChapterId)
        .single(),
      supabase
        .from('user_tasks_chapters_questions')
        .select('id', { count: 'exact', head: true })
        .eq('user_tasks_chapters_id', userTasksChapterId),
    ]);

    const { data: chapterData, error: chapterError } = chapterResult;
    const { count, error: countError } = countResult;

    if (chapterError || !chapterData) {
      throw createError({
        statusCode: chapterError ? 500 : 404,
        message: chapterError ? 'Failed to fetch status' : 'Task chapter not found',
      });
    }

    if (countError) {
      console.error('[status] Error counting questions:', countError);
    }

    const hasQuiz = (count || 0) > 0;

    // Auto-reset stale generations (>10 minutes)
    const GENERATION_TIMEOUT_MS = 10 * 60 * 1000;
    let status = chapterData.status;

    if (status === TASK_CHAPTER_STATUS.GENERATING && chapterData.generation_started_at) {
      const startedAt = new Date(chapterData.generation_started_at).getTime();
      const isStale = Date.now() - startedAt > GENERATION_TIMEOUT_MS;

      if (isStale) {
        console.log('[status] Auto-resetting stale generation for:', userTasksChapterId);
        await supabase
          .from('user_tasks_chapters')
          .update({ status: TASK_CHAPTER_STATUS.OPEN, generation_started_at: null })
          .eq('id', userTasksChapterId);
        status = TASK_CHAPTER_STATUS.OPEN;
      }
    }

    return {
      success: true,
      status,
      generationStartedAt: chapterData.generation_started_at,
      hasQuiz,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to check generation status',
    });
  }
});
