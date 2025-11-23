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
import { getSupabaseClient } from '~~/server/utils/authConfig';
import { markQuestion } from '~~/server/utils/markingApi';
import { MARKING_STATUS, QUESTION_TYPE } from '~~/shared/constants';

/**
 * Transform marking API status (snake_case) to MARKING_STATUS enum (CONSTANT_CASE)
 */
function transformMarkingStatus(apiStatus: string | undefined): string {
  if (!apiStatus) return MARKING_STATUS.INCORRECT;

  switch (apiStatus) {
    case 'correct':
      return MARKING_STATUS.CORRECT;
    case 'partially_correct':
      return MARKING_STATUS.PARTIALLY_CORRECT;
    case 'incorrect':
      return MARKING_STATUS.INCORRECT;
    default:
      console.warn(`[attempt] Unknown marking status: ${apiStatus}, defaulting to INCORRECT`);
      return MARKING_STATUS.INCORRECT;
  }
}

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

    // Check if quiz is already completed (enforce 1 attempt limit)
    const { data: chapterData, error: chapterError } = await supabase
      .from('user_tasks_chapters')
      .select(`
        id,
        status,
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
      console.error('[attempt] Error fetching chapter data:', chapterError);
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

    const requiredScore = chapterData.user_tasks.required_score || 70;
    const creditReward = chapterData.user_tasks.credit || 0;

    console.log('[attempt] Quiz config:', { requiredScore, creditReward });

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

    if (fetchError) {
      console.error('[attempt] Error fetching questions:', fetchError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch quiz questions',
      });
    }

    if (!questionLinks || questionLinks.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No questions found for this quiz',
      });
    }

    // Calculate next attempt number by checking existing attempts
    const questionIds = questionLinks.map(link => link.questions.id);

    const { data: existingAttempts } = await supabase
      .from('user_question_attempts')
      .select('attempt_number')
      .in('question_id', questionIds)
      .eq('user_info_id', userInfo.id)
      .order('attempt_number', { ascending: false })
      .limit(1);

    const nextAttemptNumber = existingAttempts?.[0]?.attempt_number
      ? existingAttempts[0].attempt_number + 1
      : 1;

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

    console.log('[attempt] All questions answered, proceeding with scoring');

    // Score each question
    let totalScore = 0;
    let earnedScore = 0;
    const results: any[] = new Array(questionLinks.length);

    for (let i = 0; i < questionLinks.length; i++) {
      const questionData = questionLinks[i].questions;
      const userAnswer = answers[i];

      let markingStatus = MARKING_STATUS.INCORRECT;
      const feedbackPositive = null;
      const feedbackGaps = null;
      const feedbackImprovement = null;
      const questionPoints = 1; // Default point value for MCQ/Boolean

      // Score based on question type
      let userAnswers: any[] = [];

      switch (questionData.type) {
        case QUESTION_TYPE.MCQ: {
          // MCQ: Compare selected option IDs
          totalScore += questionPoints;

          const correctOptionIds = questionData.question_correct_answers
            .filter((a: any) => a.option_id)
            .map((a: any) => a.option_id)
            .sort();

          const userOptionIds = Array.isArray(userAnswer?.selectedOptions) ?
              userAnswer.selectedOptions.sort() :
              [];

          const isAnswerCorrect =
            correctOptionIds.length === userOptionIds.length &&
            correctOptionIds.every((id: string, idx: number) => id === userOptionIds[idx]);

          if (isAnswerCorrect) {
            earnedScore += questionPoints;
            markingStatus = MARKING_STATUS.CORRECT;
          } else {
            markingStatus = MARKING_STATUS.INCORRECT;
          }

          // Build userAnswers array for MCQ
          userAnswers = questionData.question_options
            .filter((opt: any) => userOptionIds.includes(opt.id))
            .map((opt: any) => ({
              option_text: opt.option_text,
            }));

          break;
        }

        case QUESTION_TYPE.BOOLEAN: {
          // Boolean: Compare true/false
          totalScore += questionPoints;

          const correctAnswer = questionData.question_correct_answers[0]?.answer_boolean;
          const userBooleanAnswer = userAnswer?.answer;

          // Normalize both values to boolean for comparison
          const normalizedUserAnswer = userBooleanAnswer === 'true' || userBooleanAnswer === true;
          const isAnswerCorrect = correctAnswer === normalizedUserAnswer;

          if (isAnswerCorrect) {
            earnedScore += questionPoints;
            markingStatus = MARKING_STATUS.CORRECT;
          } else {
            markingStatus = MARKING_STATUS.INCORRECT;
          }

          // Build userAnswers array for Boolean
          userAnswers = [{
            answer_boolean: userBooleanAnswer === 'true' || userBooleanAnswer === true,
          }];

          break;
        }

        case QUESTION_TYPE.OPEN:
        case QUESTION_TYPE.FILL:
        case QUESTION_TYPE.DRAW: {
          // Use marking API for open, fill, and draw questions
          try {
            const markingResponse = await markQuestion(
              questionData,
              userAnswer?.answer || userAnswer?.answers || userAnswer?.drawingFile,
              {}
            );

            const markingResult = markingResponse.result;

            // Add actual score from marking API
            totalScore += markingResult.score.total;
            earnedScore += markingResult.score.awarded;

            // Build userAnswers array based on question type
            if (questionData.type === QUESTION_TYPE.OPEN) {
              userAnswers = [{ answer_text: userAnswer?.answer || '' }];
            } else if (questionData.type === QUESTION_TYPE.FILL) {
              if (Array.isArray(userAnswer?.answers)) {
                userAnswers = userAnswer.answers.map((ans: string, idx: number) => ({
                  answer_text: ans,
                  order_index: idx,
                }));
              } else {
                userAnswers = [{ answer_text: userAnswer?.answer || '' }];
              }
            } else if (questionData.type === QUESTION_TYPE.DRAW) {
              userAnswers = [{ answer_draw_file: userAnswer?.drawingFile || '' }];
            }

            // Store marking result for database persistence
            results[i] = {
              questionIndex: i,
              questionId: questionData.id,
              questionType: questionData.type,
              markingStatus: transformMarkingStatus(markingResult.status),
              feedbackPositive: markingResult.feedback.positive || null,
              feedbackGaps: markingResult.feedback.gaps || null,
              feedbackImprovement: markingResult.feedback.improvement || null,
              keyConcepts: markingResult.key_concepts_assessed || null,
              markingRationale: markingResult.marking_rationale || null,
              pointsEarned: markingResult.score.awarded,
              pointsPossible: markingResult.score.total,
              userAnswers: userAnswers,
            };

            continue; // Skip the results.push at the end of the loop
          } catch (error) {
            console.error('[attempt] Marking API error:', error);
            throw createError({
              statusCode: 500,
              message: 'Failed to mark question',
            });
          }
        }

        default: {
          console.warn('[attempt] Unknown question type:', questionData.type);
          break;
        }
      }

      results[i] = {
        questionIndex: i,
        questionId: questionData.id,
        questionType: questionData.type,
        markingStatus,
        feedbackPositive,
        feedbackGaps,
        feedbackImprovement,
        keyConcepts: null,
        markingRationale: null,
        pointsEarned: markingStatus === MARKING_STATUS.CORRECT ? questionPoints : 0,
        pointsPossible: questionPoints,
        userAnswers: userAnswers,
      };
    }

    console.log('[attempt] Quiz scored:', { earnedScore, totalScore, userId: userInfo.id });

    // Store attempts and answers in database
    console.log('[attempt] Persisting attempts and answers to database');
    console.log('[attempt] User info ID:', userInfo.id);
    const attemptIds = [];

    for (let i = 0; i < questionLinks.length; i++) {
      const questionData = questionLinks[i].questions;
      const userAnswer = answers[i];
      const result = results[i];

      // Create user_question_attempts record
      const attemptRecord = {
        user_info_id: userInfo.id,
        question_id: questionData.id,
        attempt_number: nextAttemptNumber,
        submitted_at: new Date().toISOString(),
        duration_seconds: 0, // Frontend doesn't track timing yet
        score: result.pointsEarned,
        // Store marking fields in individual columns
        max_score: result.pointsPossible,
        marking_status: result.markingStatus,
        feedback_positive: result.feedbackPositive || null,
        feedback_gaps: result.feedbackGaps || null,
        feedback_improvement: result.feedbackImprovement || null,
        key_concepts_assessed: result.keyConcepts || null,
        marking_rationale: result.markingRationale || null,
      };

      const { data: attemptData, error: attemptError } = await supabase
        .from('user_question_attempts')
        .insert([attemptRecord])
        .select('id')
        .single();

      if (attemptError) {
        console.error('[attempt] Error inserting attempt:', attemptError);
        throw createError({
          statusCode: 500,
          message: 'Failed to persist quiz attempt',
        });
      }

      const attemptId = attemptData.id;
      attemptIds.push(attemptId);
      console.log(`[attempt] Created attempt ${attemptId} for question ${questionData.id} with user_info_id ${userInfo.id}`);

      // Create user_question_answers records based on question type
      const answerRecords = [];

      switch (questionData.type) {
        case QUESTION_TYPE.MCQ: {
          // MCQ: Insert one record per selected option
          const selectedOptionIds = userAnswer?.selectedOptions || [];

          // Fetch option snapshots
          if (selectedOptionIds.length > 0) {
            const { data: optionsData, error: optionsError } = await supabase
              .from('question_options')
              .select('id, option_text, image_url')
              .in('id', selectedOptionIds);

            if (optionsError) {
              console.error('[attempt] Error fetching options:', optionsError);
              throw createError({
                statusCode: 500,
                message: 'Failed to fetch option data',
              });
            }

            optionsData?.forEach((option, index) => {
              answerRecords.push({
                user_question_attempts_id: attemptId,
                option_id: option.id,
                option_text: option.option_text,
                option_image: option.image_url,
                answer_text: null,
                answer_boolean: null,
                answer_draw_file: null,
                order_index: index,
              });
            });
          }
          break;
        }

        case QUESTION_TYPE.BOOLEAN: {
          // Boolean: Insert one record with answer_boolean
          answerRecords.push({
            user_question_attempts_id: attemptId,
            option_id: null,
            option_text: null,
            option_image: null,
            answer_text: null,
            answer_boolean: userAnswer?.answer === 'true' || userAnswer?.answer === true,
            answer_draw_file: null,
            order_index: 0,
          });
          break;
        }

        case QUESTION_TYPE.OPEN: {
          // Open: Insert one record with answer_text
          answerRecords.push({
            user_question_attempts_id: attemptId,
            option_id: null,
            option_text: null,
            option_image: null,
            answer_text: userAnswer?.answer || '',
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 0,
          });
          break;
        }

        case QUESTION_TYPE.FILL: {
          // Fill: Insert records for each answer (single or multiple)
          if (Array.isArray(userAnswer?.answers)) {
            // Multiple blanks
            userAnswer.answers.forEach((ans: string, index: number) => {
              answerRecords.push({
                user_question_attempts_id: attemptId,
                option_id: null,
                option_text: null,
                option_image: null,
                answer_text: ans || '',
                answer_boolean: null,
                answer_draw_file: null,
                order_index: index,
              });
            });
          } else {
            // Single blank
            answerRecords.push({
              user_question_attempts_id: attemptId,
              option_id: null,
              option_text: null,
              option_image: null,
              answer_text: userAnswer?.answer || '',
              answer_boolean: null,
              answer_draw_file: null,
              order_index: 0,
            });
          }
          break;
        }

        case QUESTION_TYPE.DRAW: {
          // Draw: Insert one record with answer_draw_file
          answerRecords.push({
            user_question_attempts_id: attemptId,
            option_id: null,
            option_text: null,
            option_image: null,
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: userAnswer?.drawingFile || '',
            order_index: 0,
          });
          break;
        }

        default:
          console.warn('[attempt] Unknown question type:', questionData.type);
          break;
      }

      // Insert answer records if any
      if (answerRecords.length > 0) {
        const { error: answersError } = await supabase
          .from('user_question_answers')
          .insert(answerRecords);

        if (answersError) {
          console.error('[attempt] Error inserting answers:', answersError);
          throw createError({
            statusCode: 500,
            message: 'Failed to persist quiz answers',
          });
        }
      }
    }

    console.log('[attempt] Successfully persisted all attempts and answers');

    // Calculate current attempt percentage
    const currentPercentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;

    console.log('[attempt] Current attempt score:', { earnedScore, totalScore, currentPercentage });

    // Fetch all attempts for this quiz to find the best score
    const { data: allAttempts, error: allAttemptsError } = await supabase
      .from('user_question_attempts')
      .select('attempt_number, score, max_score')
      .in('question_id', questionIds)
      .eq('user_info_id', userInfo.id);

    if (allAttemptsError) {
      console.error('[attempt] Error fetching all attempts:', allAttemptsError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch attempt history',
      });
    }

    // Group by attempt_number and calculate totals
    const attemptScores: Record<number, { score: number; totalScore: number }> = {};

    allAttempts?.forEach(att => {
      if (!attemptScores[att.attempt_number]) {
        attemptScores[att.attempt_number] = { score: 0, totalScore: 0 };
      }
      attemptScores[att.attempt_number].score += att.score;
      attemptScores[att.attempt_number].totalScore += att.max_score;
    });

    // Find best percentage across all attempts
    let bestScore = earnedScore;
    let bestTotalScore = totalScore;
    let bestPercentage = currentPercentage;

    Object.values(attemptScores).forEach(attempt => {
      const percentage = attempt.totalScore > 0 ? Math.round((attempt.score / attempt.totalScore) * 100) : 0;
      if (percentage > bestPercentage) {
        bestScore = attempt.score;
        bestTotalScore = attempt.totalScore;
        bestPercentage = percentage;
      }
    });

    // Use best score to determine if threshold is passed
    const passedThreshold = bestPercentage >= requiredScore;

    console.log('[attempt] Score analysis:', {
      currentAttempt: { earnedScore, totalScore, currentPercentage },
      bestAttempt: { bestScore, bestTotalScore, bestPercentage },
      requiredScore,
      passedThreshold,
      creditReward
    });

    // Update user_tasks_chapters with best score and completion
    // Only set completed_at on first attempt, keep it for subsequent attempts
    const updateData: any = {
      score: bestScore,
      total_score: bestTotalScore,
      status: 'COMPLETED',
    };

    // Only set completed_at if this is the first attempt
    if (nextAttemptNumber === 1) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('user_tasks_chapters')
      .update(updateData)
      .eq('id', userTasksChapterId);

    if (updateError) {
      console.error('[attempt] Error updating task-chapter:', updateError);
      throw createError({
        statusCode: 500,
        message: 'Failed to save quiz results',
      });
    }

    console.log('[attempt] Successfully saved quiz results');

    // Disburse credits if threshold is met and credit reward exists
    let creditEarned = 0;
    if (passedThreshold && creditReward > 0) {
      try {
        // Check if credits have already been disbursed for this quiz
        const { data: existingTransaction } = await supabase
          .from('credit_transactions')
          .select('id, amount')
          .eq('metadata->>userTasksChapterId', userTasksChapterId)
          .eq('metadata->>source', 'quiz_completion')
          .maybeSingle();

        if (existingTransaction) {
          console.log('[attempt] Credits already disbursed:', existingTransaction.amount);
          creditEarned = existingTransaction.amount;
          // Skip disbursement, credits already given
        } else {
          // Get user's credit record
        const { data: userCredit, error: creditFetchError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_info_id', userInfo.id)
          .single();

        if (creditFetchError && creditFetchError.code !== 'PGRST116') {
          console.error('[attempt] Error fetching user credits:', creditFetchError);
          throw creditFetchError;
        }

        // Update or insert user credits
        const newCreditBalance = (userCredit?.credit || 0) + creditReward;

        const { error: creditUpdateError } = await supabase
          .from('user_credits')
          .upsert({
            user_info_id: userInfo.id,
            credit: newCreditBalance,
            reserved_credit: userCredit?.reserved_credit || 0,
          });

        if (creditUpdateError) {
          console.error('[attempt] Error updating credits:', creditUpdateError);
          throw creditUpdateError;
        }

        // Create credit transaction record
        const { error: transactionError } = await supabase
          .from('credit_transactions')
          .insert({
            user_info_id: userInfo.id,
            transaction_type: 'topup',
            amount: creditReward,
            currency: 'SGD',
            description: `Quiz reward for ${chapterData.user_tasks.id}`,
            metadata: {
              source: 'quiz_completion',
              userTasksChapterId,
              score: bestScore,
              totalScore: bestTotalScore,
              percentage: bestPercentage,
            },
          });

        if (transactionError) {
          console.error('[attempt] Error creating transaction:', transactionError);
          throw transactionError;
        }

          creditEarned = creditReward;
          console.log('[attempt] Credits disbursed:', { creditEarned, newBalance: newCreditBalance });
        }
      } catch (creditError) {
        console.error('[attempt] Credit disbursement failed:', creditError);
        // Don't fail the quiz submission if credit disbursement fails
        // Just log the error and continue
      }
    }

    return {
      success: true,
      // Current/Latest attempt (just submitted)
      score: earnedScore,
      totalScore,
      percentage: currentPercentage,
      latestScore: earnedScore,
      latestTotalScore: totalScore,
      latestPercentage: currentPercentage,
      // Best attempt across all attempts
      bestScore,
      bestTotalScore,
      bestPercentage,
      // Other fields
      requiredScore,
      passedThreshold,
      creditEarned,
      creditDisbursed: creditEarned > 0,
      creditReward,
      attemptNumber: nextAttemptNumber,
      attemptCount: nextAttemptNumber,
      attempts: Object.entries(attemptScores).map(([attemptNum, data]) => ({
        attemptNumber: parseInt(attemptNum),
        score: data.score,
        totalScore: data.totalScore,
        percentage: data.totalScore > 0 ? Math.round((data.score / data.totalScore) * 100) : 0,
        submittedAt: data.submittedAt || new Date().toISOString(),
      })).sort((a, b) => a.attemptNumber - b.attemptNumber),
      results,
    };
  } catch (error: any) {
    console.error('[attempt] Error:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to submit quiz attempt',
    });
  }
});
