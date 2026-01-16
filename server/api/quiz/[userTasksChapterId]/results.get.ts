/**
 * Fetch previous quiz attempt results for a completed quiz
 *
 * Route: /api/quiz/[userTasksChapterId]/results
 * Method: GET
 *
 * Returns:
 * - success: boolean
 * - isCompleted: boolean
 * - score: number
 * - totalScore: number
 * - percentage: number
 * - requiredScore: number
 * - passedThreshold: boolean
 * - creditEarned: number
 * - questions: array of questions with results
 */

import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';
import {
  calculateAttemptScores,
  formatAttemptsForResponse,
} from '~~/server/services/quizScoringService';
import {
  fetchAllAttempts,
  fetchLatestAttemptResults,
} from '~~/server/services/quizPersistenceService';
import { getQuizCreditTransaction } from '~~/server/services/creditService';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const userInfo = await getUserInfo(event);

    // Get userTasksChapterId from route params
    const userTasksChapterId = getRouterParam(event, 'userTasksChapterId');

    if (!userTasksChapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: userTasksChapterId',
      });
    }

    const supabase = await getSupabaseClient(event);

    // Fetch task-chapter data with user_tasks info
    const { data: chapterData, error: chapterError } = await supabase
      .from('user_tasks_chapters')
      .select(`
        id,
        status,
        score,
        total_score,
        completed_at,
        user_task_id,
        user_tasks!inner(
          id,
          assignee_user_info_id,
          required_score,
          credit
        )
      `)
      .eq('id', userTasksChapterId)
      .single();

    if (chapterError || !chapterData) {
      console.error('[results] Error fetching chapter data:', chapterError);
      throw createError({
        statusCode: chapterError ? 500 : 404,
        message: chapterError ? 'Failed to fetch quiz data' : 'Quiz not found',
      });
    }

    // PERMISSION CHECK: Verify user is assignee of this task
    if (chapterData.user_tasks.assignee_user_info_id !== userInfo.id) {
      console.warn(
        `[results] SECURITY: Permission denied - ` +
        `User ${userInfo.id} attempted to view results for task-chapter ${userTasksChapterId} ` +
        `assigned to ${chapterData.user_tasks.assignee_user_info_id}`
      );
      throw createError({
        statusCode: 403,
        message: 'Unauthorized: You can only view results for quizzes assigned to you',
      });
    }

    console.log('[results] Permission check passed - user is task assignee');

    // If not completed, return not completed status
    if (!chapterData.completed_at) {
      return {
        success: true,
        isCompleted: false,
      };
    }

    // Fetch questions for this task-chapter
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
            answer_boolean
          )
        )
      `)
      .eq('user_tasks_chapters_id', userTasksChapterId)
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('[results] Error fetching questions:', fetchError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch quiz questions',
      });
    }

    // Transform questions
    const questions = (questionLinks || []).map((link) => ({
      ...link.questions,
      question_type: link.questions.type,
      content: link.questions.question,
      options: link.questions.question_options,
      answer: link.questions.question_correct_answers,
    }));

    const questionIds = questions.map((q) => q.id);

    // Fetch all attempts and calculate scores using services
    const allAttempts = await fetchAllAttempts(supabase, questionIds, userInfo.id);
    const attemptScores = calculateAttemptScores(allAttempts);
    const attempts = formatAttemptsForResponse(attemptScores);

    // Find latest attempt
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
    const latestAttemptNumber = latestAttempt?.attemptNumber || 1;

    // Use stored best score from user_tasks_chapters
    const bestScore = chapterData.score || 0;
    const bestTotalScore = chapterData.total_score || 0;
    const bestPercentage = bestTotalScore > 0 ? Math.round((bestScore / bestTotalScore) * 100) : 0;

    const latestScore = latestAttempt?.score || 0;
    const latestTotalScore = latestAttempt?.totalScore || 0;
    const latestPercentage = latestAttempt?.percentage || 0;

    // Validate required_score is set
    if (chapterData.user_tasks.required_score === null || chapterData.user_tasks.required_score === undefined) {
      throw createError({
        statusCode: 500,
        message: 'Task configuration error: required_score is not set'
      });
    }

    const requiredScore = chapterData.user_tasks.required_score;
    const passedThreshold = bestPercentage >= requiredScore;
    const attemptCount = attempts.length;

    // Check if credits were earned using credit service
    const creditEarned = await getQuizCreditTransaction(supabase, userTasksChapterId);
    const creditDisbursed = creditEarned > 0;
    const creditReward = chapterData.user_tasks.credit || 0;

    // OPTIMIZED: Fetch all attempt results in a single batch query (replaces N+1 loop)
    console.log('[results] Fetching latest attempt (#' + latestAttemptNumber + ') with batch query');

    const attemptsByQuestion = await fetchLatestAttemptResults(
      supabase,
      questionIds,
      userInfo.id,
      latestAttemptNumber
    );

    // Build results from batch query data
    const results = questions.map((question, index) => {
      const attemptData = attemptsByQuestion.get(question.id);

      if (!attemptData) {
        return {
          questionIndex: index,
          questionId: question.id,
          questionType: question.type,
          feedback: 'No attempt recorded',
          pointsEarned: 0,
          pointsPossible: 1,
          userAnswers: [],
        };
      }

      const userAnswers = (attemptData.user_question_answers || [])
        .sort((a: any, b: any) => a.order_index - b.order_index);

      return {
        questionIndex: index,
        questionId: question.id,
        questionType: question.type,
        feedbackPositive: attemptData.feedback_positive || null,
        feedbackGaps: attemptData.feedback_gaps || null,
        feedbackImprovement: attemptData.feedback_improvement || null,
        markingStatus: attemptData.marking_status || null,
        keyConcepts: attemptData.key_concepts_assessed || null,
        pointsEarned: attemptData.score || 0,
        pointsPossible: attemptData.max_score || 1,
        userAnswers,
      };
    });

    return {
      success: true,
      isCompleted: true,
      // Latest attempt scores (for review display)
      latestScore,
      latestTotalScore,
      latestPercentage,
      // Best attempt scores (for credit calculation)
      bestScore,
      bestTotalScore,
      bestPercentage,
      // Threshold and credits
      requiredScore,
      passedThreshold,
      creditEarned,
      creditDisbursed,
      creditReward,
      // Attempt metadata
      attemptCount,
      attempts,
      // Questions and results (from latest attempt)
      questions,
      results,
    };
  } catch (error: any) {
    console.error('[results] Error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch quiz results',
    });
  }
});
