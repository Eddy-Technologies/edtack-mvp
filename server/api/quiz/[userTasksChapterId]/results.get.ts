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
          required_score,
          credit
        )
      `)
      .eq('id', userTasksChapterId)
      .single();

    if (chapterError) {
      console.error('[results] Error fetching chapter data:', chapterError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch quiz data',
      });
    }

    if (!chapterData) {
      throw createError({
        statusCode: 404,
        message: 'Quiz not found',
      });
    }

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

    const questionIds = questions.map(q => q.id);

    // Fetch ALL attempts for this quiz to calculate best and latest scores
    const { data: allAttempts, error: allAttemptsError } = await supabase
      .from('user_question_attempts')
      .select('attempt_number, submitted_at, score, max_score')
      .in('question_id', questionIds)
      .eq('user_info_id', userInfo.id);

    if (allAttemptsError) {
      console.error('[results] Error fetching all attempts:', allAttemptsError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch attempt history',
      });
    }

    // Group by attempt_number and calculate totals
    const attemptScores: Record<number, { score: number; totalScore: number; submittedAt: string }> = {};

    allAttempts?.forEach(att => {
      if (!attemptScores[att.attempt_number]) {
        attemptScores[att.attempt_number] = {
          score: 0,
          totalScore: 0,
          submittedAt: att.submitted_at
        };
      }
      attemptScores[att.attempt_number].score += att.score;
      attemptScores[att.attempt_number].totalScore += att.max_score;
    });

    // Calculate percentages for each attempt
    const attempts = Object.entries(attemptScores).map(([attemptNum, data]) => ({
      attemptNumber: parseInt(attemptNum),
      score: data.score,
      totalScore: data.totalScore,
      percentage: data.totalScore > 0 ? Math.round((data.score / data.totalScore) * 100) : 0,
      submittedAt: data.submittedAt
    })).sort((a, b) => a.attemptNumber - b.attemptNumber);

    // Find best and latest
    const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
    const bestAttempt = attempts.length > 0
      ? attempts.reduce((best, curr) => curr.percentage > best.percentage ? curr : best)
      : null;

    // Use stored best score from user_tasks_chapters (should match calculated best)
    const bestScore = chapterData.score || 0;
    const bestTotalScore = chapterData.total_score || 0;
    const bestPercentage = bestTotalScore > 0 ? Math.round((bestScore / bestTotalScore) * 100) : 0;

    const latestScore = latestAttempt?.score || 0;
    const latestTotalScore = latestAttempt?.totalScore || 0;
    const latestPercentage = latestAttempt?.percentage || 0;

    const requiredScore = chapterData.user_tasks.required_score || 70;
    const passedThreshold = bestPercentage >= requiredScore;
    const attemptCount = attempts.length;

    // Check if credits were earned (look for transaction)
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('metadata->>userTasksChapterId', userTasksChapterId)
      .eq('metadata->>source', 'quiz_completion')
      .limit(1);

    const creditEarned = (!txError && transactions && transactions.length > 0) ?
      transactions[0].amount :
      0;

    const creditDisbursed = creditEarned > 0;
    const creditReward = chapterData.user_tasks.credit || 0;

    // Fetch actual attempt results from database for LATEST attempt only
    const results = [];
    const latestAttemptNumber = latestAttempt?.attemptNumber || 1;

    console.log('[results] Looking for latest attempt (#' + latestAttemptNumber + ') with user_info_id:', userInfo.id);

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      // Fetch LATEST attempt for this question
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_question_attempts')
        .select(`*, user_question_answers(*)`)
        .eq('question_id', question.id)
        .eq('user_info_id', userInfo.id)
        .eq('attempt_number', latestAttemptNumber)
        .single();

      if (attemptError) {
        console.warn('[results] No attempt found for question:', question.id);
        console.warn('[results] Error details:', attemptError);
        // If no attempt found, create placeholder result
        results.push({
          questionIndex: index,
          questionId: question.id,
          questionType: question.type,
          feedback: 'No attempt recorded',
          pointsEarned: 0,
          pointsPossible: 1,
          userAnswers: [],
        });
        continue;
      }

      // Build user answers array based on question type
      const userAnswers = attemptData.user_question_answers || [];

      // Read from individual columns
      const feedbackPositive = attemptData.feedback_positive || null;
      const feedbackGaps = attemptData.feedback_gaps || null;
      const feedbackImprovement = attemptData.feedback_improvement || null;
      const markingStatus = attemptData.marking_status || null;
      const pointsPossible = attemptData.max_score || 1;
      const keyConcepts = attemptData.key_concepts_assessed || null;
      const markingRationale = attemptData.marking_rationale || null;

      results.push({
        questionIndex: index,
        questionId: question.id,
        questionType: question.type,
        feedbackPositive,
        feedbackGaps,
        feedbackImprovement,
        markingStatus,
        keyConcepts,
        markingRationale,
        pointsEarned: attemptData.score || 0,
        pointsPossible,
        userAnswers: userAnswers.sort((a: any, b: any) => a.order_index - b.order_index),
      });
    }

    console.log('[results] Retrieved results:', {
      latestScore,
      latestTotalScore,
      latestPercentage,
      bestScore,
      bestTotalScore,
      bestPercentage,
      passedThreshold,
      attemptCount
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
      // Legacy fields (keep for backward compatibility, use best score)
      score: bestScore,
      totalScore: bestTotalScore,
      percentage: bestPercentage,
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

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch quiz results',
    });
  }
});
