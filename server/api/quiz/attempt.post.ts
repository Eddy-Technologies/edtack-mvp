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

    // Enforce 1 attempt limit
    if (chapterData.completed_at) {
      throw createError({
        statusCode: 409,
        message: 'Quiz already completed. Only one attempt is allowed.',
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
    const results = [];

    for (let i = 0; i < questionLinks.length; i++) {
      const questionData = questionLinks[i].questions;
      const userAnswer = answers[i];

      // Each question worth 1 point for now (can be configurable later)
      const questionPoints = 1;
      totalScore += questionPoints;

      let isCorrect = false;
      let feedback = '';

      // Score based on question type
      switch (questionData.type) {
        case 'mcq': {
          // MCQ: Compare selected option IDs
          const correctOptionIds = questionData.question_correct_answers
            .filter((a: any) => a.option_id)
            .map((a: any) => a.option_id)
            .sort();

          const userOptionIds = Array.isArray(userAnswer?.selectedOptions) ?
              userAnswer.selectedOptions.sort() :
              [];

          isCorrect =
            correctOptionIds.length === userOptionIds.length &&
            correctOptionIds.every((id: string, idx: number) => id === userOptionIds[idx]);

          if (isCorrect) {
            earnedScore += questionPoints;
            feedback = 'Correct!';
          } else {
            feedback = 'Incorrect';
          }
          break;
        }

        case 'boolean': {
          // Boolean: Compare true/false
          const correctAnswer = questionData.question_correct_answers[0]?.answer_boolean;
          const userBooleanAnswer = userAnswer?.answer;

          isCorrect = correctAnswer === userBooleanAnswer;

          if (isCorrect) {
            earnedScore += questionPoints;
            feedback = 'Correct!';
          } else {
            feedback = 'Incorrect';
          }
          break;
        }

        case 'open':
        case 'fill': {
          // Open/Fill: For now, mark as requiring manual grading
          // In future, could implement fuzzy text matching
          feedback = 'Answer submitted - requires manual grading';
          // Don't add to score yet - manual grading needed
          break;
        }

        case 'draw': {
          // Draw: Requires manual grading
          feedback = 'Drawing submitted - requires manual grading';
          break;
        }

        default: {
          feedback = 'Unknown question type';
          break;
        }
      }

      results.push({
        questionIndex: i,
        questionId: questionData.id,
        questionType: questionData.type,
        isCorrect,
        feedback,
        pointsEarned: isCorrect ? questionPoints : 0,
        pointsPossible: questionPoints,
      });
    }

    console.log('[attempt] Quiz scored:', { earnedScore, totalScore, userId: userInfo.id });

    // Store attempts and answers in database
    console.log('[attempt] Persisting attempts and answers to database');
    const attemptIds = [];

    for (let i = 0; i < questionLinks.length; i++) {
      const questionData = questionLinks[i].questions;
      const userAnswer = answers[i];
      const result = results[i];

      // Create user_question_attempts record
      const attemptRecord = {
        user_info_id: userInfo.id,
        question_id: questionData.id,
        attempt_number: 1,
        submitted_at: new Date().toISOString(),
        duration_seconds: 0, // Frontend doesn't track timing yet
        score: result.pointsEarned,
        is_correct: result.questionType === 'open' || result.questionType === 'fill' || result.questionType === 'draw' ?
          null :
          result.isCorrect,
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

      // Create user_question_answers records based on question type
      const answerRecords = [];

      switch (questionData.type) {
        case 'mcq': {
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

        case 'boolean': {
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

        case 'open': {
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

        case 'fill': {
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

        case 'draw': {
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

    // Calculate percentage score
    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passedThreshold = percentage >= requiredScore;

    console.log('[attempt] Score analysis:', { percentage, requiredScore, passedThreshold, creditReward });

    // Update user_tasks_chapters with score and completion
    const { error: updateError } = await supabase
      .from('user_tasks_chapters')
      .update({
        score: earnedScore,
        total_score: totalScore,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
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
              score: earnedScore,
              totalScore,
              percentage,
            },
          });

        if (transactionError) {
          console.error('[attempt] Error creating transaction:', transactionError);
          throw transactionError;
        }

        creditEarned = creditReward;
        console.log('[attempt] Credits disbursed:', { creditEarned, newBalance: newCreditBalance });
      } catch (creditError) {
        console.error('[attempt] Credit disbursement failed:', creditError);
        // Don't fail the quiz submission if credit disbursement fails
        // Just log the error and continue
      }
    }

    return {
      success: true,
      score: earnedScore,
      totalScore,
      percentage,
      requiredScore,
      passedThreshold,
      creditEarned,
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
