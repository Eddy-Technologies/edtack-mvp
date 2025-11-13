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

import { requireAuth } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    await requireAuth(event);

    // Get userTasksChapterId from route params
    const userTasksChapterId = getRouterParam(event, 'userTasksChapterId');

    if (!userTasksChapterId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: userTasksChapterId',
      });
    }

    console.log('[results] Fetching quiz results for task-chapter:', userTasksChapterId);

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

    // Calculate results
    const score = chapterData.score || 0;
    const totalScore = chapterData.total_score || 0;
    const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
    const requiredScore = chapterData.user_tasks.required_score || 70;
    const passedThreshold = percentage >= requiredScore;

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

    // Fetch actual attempt results from database
    const results = [];

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      // Fetch attempt for this question
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_question_attempts')
        .select(`
          id,
          score,
          is_correct,
          submitted_at,
          user_question_answers(
            option_id,
            option_text,
            option_image,
            answer_text,
            answer_boolean,
            answer_draw_file,
            order_index
          )
        `)
        .eq('question_id', question.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (attemptError) {
        console.warn('[results] No attempt found for question:', question.id);
        // If no attempt found, create placeholder result
        results.push({
          questionIndex: index,
          questionId: question.id,
          questionType: question.type,
          isCorrect: false,
          feedback: 'No attempt recorded',
          pointsEarned: 0,
          pointsPossible: 1,
          userAnswers: [],
        });
        continue;
      }

      // Build user answers array based on question type
      const userAnswers = attemptData.user_question_answers || [];

      // Determine feedback based on question type
      let feedback = '';
      if (question.type === 'open' || question.type === 'fill' || question.type === 'draw') {
        feedback = attemptData.is_correct === null ?
          'Answer submitted - requires manual grading' :
            (attemptData.is_correct ? 'Correct!' : 'Incorrect');
      } else {
        feedback = attemptData.is_correct ? 'Correct!' : 'Incorrect';
      }

      results.push({
        questionIndex: index,
        questionId: question.id,
        questionType: question.type,
        isCorrect: attemptData.is_correct !== null ? attemptData.is_correct : false,
        feedback,
        pointsEarned: attemptData.score || 0,
        pointsPossible: 1,
        userAnswers: userAnswers.sort((a: any, b: any) => a.order_index - b.order_index),
      });
    }

    console.log('[results] Retrieved results:', {
      score,
      totalScore,
      percentage,
      passedThreshold
    });

    return {
      success: true,
      isCompleted: true,
      score,
      totalScore,
      percentage,
      requiredScore,
      passedThreshold,
      creditEarned,
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
