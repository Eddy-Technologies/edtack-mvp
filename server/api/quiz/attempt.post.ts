/**
 * Submit a quiz attempt and calculate score
 *
 * Route: /api/quiz/attempt
 * Method: POST
 *
 * Request body:
 * - userTasksChapterId: string - The task-chapter assignment ID
 * - answers: Record<number, any> - User answers indexed by question position
 *
 * Returns:
 * - success: boolean
 * - score: number - Points earned
 * - totalScore: number - Maximum possible points
 * - results: array of question results with correctness
 */

import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient, getSupabaseAccessToken } from '~~/server/utils/authConfig';
import {
  scoreAllQuestions,
  calculateAttemptScores,
  findBestScore,
  formatAttemptsForResponse,
} from '~~/server/services/quizScoringService';
import {
  persistAllAttempts,
  getNextAttemptNumber,
  fetchAllAttempts,
  updateChapterScore,
} from '~~/server/services/quizPersistenceService';
import { handleQuizCreditDisbursement } from '~~/server/services/creditService';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const userInfo = await getUserInfo(event);

    // Parse request body
    const body = await readBody(event);
    const { userTasksChapterId, answers } = body;

    if (!userTasksChapterId || !answers) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: userTasksChapterId or answers',
      });
    }

    console.log('[attempt] Processing quiz submission for task-chapter:', userTasksChapterId);

    const supabase = await getSupabaseClient(event);

    // Fetch quiz data with task info
    const { data: chapterData, error: chapterError } = await supabase
      .from('user_tasks_chapters')
      .select(`
        id,
        status,
        completed_at,
        user_task_id,
        user_tasks!inner(
          id,
          status,
          required_score,
          credit,
          creator_user_info_id,
          assignee_user_info_id
        )
      `)
      .eq('id', userTasksChapterId)
      .single();

    if (chapterError || !chapterData) {
      console.error('[attempt] Error fetching chapter data:', chapterError);
      throw createError({
        statusCode: chapterError ? 500 : 404,
        message: chapterError ? 'Failed to fetch quiz data' : 'Quiz not found',
      });
    }

    // Check if task is still OPEN
    if (chapterData.user_tasks.status && chapterData.user_tasks.status !== 'OPEN') {
      throw createError({
        statusCode: 400,
        message: 'Cannot submit quiz attempt for a closed or expired task. You can still review past attempts.',
      });
    }

    // PERMISSION CHECK: Verify user is assignee of this task
    if (chapterData.user_tasks.assignee_user_info_id !== userInfo.id) {
      console.warn(
        `[attempt] SECURITY: Permission denied - ` +
        `User ${userInfo.id} attempted to submit for task-chapter ${userTasksChapterId} ` +
        `assigned to ${chapterData.user_tasks.assignee_user_info_id}`
      );
      throw createError({
        statusCode: 403,
        message: 'Unauthorized: You can only submit quiz attempts for tasks assigned to you',
      });
    }

    console.log('[attempt] Permission check passed - user is task assignee');

    const requiredScore = chapterData.user_tasks.required_score || 70;
    const creditReward = chapterData.user_tasks.credit || 0;

    // Fetch questions with correct answers
    const { data: questionLinks, error: fetchError } = await supabase
      .from('user_tasks_chapters_questions')
      .select(`
        question_id,
        display_order,
        questions!inner(
          id,
          type,
          title,
          question,
          explanation,
          question_options(
            id,
            option_text
          ),
          question_correct_answers(
            id,
            option_id,
            answer_text,
            answer_boolean,
            order_index
          )
        )
      `)
      .eq('user_tasks_chapters_id', userTasksChapterId)
      .order('display_order', { ascending: true });

    if (fetchError || !questionLinks || questionLinks.length === 0) {
      console.error('[attempt] Error fetching questions:', fetchError);
      throw createError({
        statusCode: fetchError ? 500 : 404,
        message: fetchError ? 'Failed to fetch quiz questions' : 'No questions found for this quiz',
      });
    }

    // Get next attempt number
    const questionIds = questionLinks.map((link) => link.questions.id);
    const nextAttemptNumber = await getNextAttemptNumber(supabase, questionIds, userInfo.id);

    console.log('[attempt] Next attempt number:', nextAttemptNumber);

    // Validate all questions have been answered
    for (let i = 0; i < questionLinks.length; i++) {
      if (answers[i] === undefined || answers[i] === null) {
        throw createError({
          statusCode: 400,
          message: `All questions must be answered. Missing answer for question ${i + 1}.`,
        });
      }
    }

    // Get auth token for Python backend (used for open-ended question scoring)
    const authToken = await getSupabaseAccessToken(event);

    // Score all questions using scoring service
    const { results, earnedScore, totalScore } = await scoreAllQuestions(
      questionLinks,
      answers,
      { authToken: authToken || undefined }
    );

    console.log('[attempt] Quiz scored:', { earnedScore, totalScore, userId: userInfo.id });

    // Persist attempts and answers using persistence service
    await persistAllAttempts(
      supabase,
      userInfo.id,
      nextAttemptNumber,
      questionLinks,
      answers,
      results
    );

    console.log('[attempt] Successfully persisted all attempts and answers');

    // Calculate current attempt percentage
    const currentPercentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;

    // Fetch all attempts and calculate best score
    const allAttempts = await fetchAllAttempts(supabase, questionIds, userInfo.id);
    const attemptScores = calculateAttemptScores(allAttempts);
    const { bestScore, bestTotalScore, bestPercentage } = findBestScore(
      attemptScores,
      earnedScore,
      totalScore
    );

    const passedThreshold = bestPercentage >= requiredScore;

    console.log('[attempt] Score analysis:', {
      currentAttempt: { earnedScore, totalScore, currentPercentage },
      bestAttempt: { bestScore, bestTotalScore, bestPercentage },
      requiredScore,
      passedThreshold,
      creditReward,
    });

    // Update task-chapter with best score
    await updateChapterScore(
      supabase,
      userTasksChapterId,
      bestScore,
      bestTotalScore,
      nextAttemptNumber === 1
    );

    // Disburse credits if threshold is met using credit service
    const creditResult = await handleQuizCreditDisbursement(
      supabase,
      userInfo.id,
      chapterData.user_tasks.creator_user_info_id,
      chapterData.user_tasks.id,
      userTasksChapterId,
      creditReward,
      passedThreshold,
      { bestScore, bestTotalScore, bestPercentage }
    );

    return {
      success: true,
      // Latest attempt (just submitted)
      latestScore: earnedScore,
      latestTotalScore: totalScore,
      latestPercentage: currentPercentage,
      // Best attempt across all attempts
      bestScore,
      bestTotalScore,
      bestPercentage,
      // Threshold and credits
      requiredScore,
      passedThreshold,
      creditEarned: creditResult.creditEarned,
      creditDisbursed: creditResult.creditDisbursed,
      creditReward,
      // Attempt metadata
      attemptCount: nextAttemptNumber,
      attempts: formatAttemptsForResponse(attemptScores),
      results,
    };
  } catch (error: any) {
    console.error('[attempt] Error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to submit quiz attempt',
    });
  }
});
