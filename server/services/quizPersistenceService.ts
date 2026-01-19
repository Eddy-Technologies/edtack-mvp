/**
 * Quiz Persistence Service
 *
 * Handles database operations for quiz attempts, answers, and question generation:
 * - Creating attempt records
 * - Creating answer records
 * - Persisting generated questions
 * - Fetching attempt results (with batch query optimization)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { QuestionResult } from './quizScoringService';
import type { QuizQuestion } from '~/types/quiz.types';
import { QUESTION_TYPE, TASK_CHAPTER_STATUS } from '~~/shared/constants';

// Types
export interface AttemptRecord {
  user_info_id: string;
  question_id: string;
  attempt_number: number;
  submitted_at: string;
  duration_seconds: number;
  score: number;
  max_score: number;
  marking_status: string;
  feedback_positive?: string | null;
  feedback_gaps?: string | null;
  feedback_improvement?: string | null;
  key_concepts_assessed?: string[] | null;
  marking_rationale?: string | null;
}

export interface AnswerRecord {
  user_question_attempts_id: string;
  option_id: string | null;
  option_text: string | null;
  option_image: string | null;
  answer_text: string | null;
  answer_boolean: boolean | null;
  answer_draw_file: string | null;
  order_index: number;
}

export interface PersistResult {
  success: boolean;
  questionId: string;
  error?: any;
}

/**
 * Create a question attempt record
 */
export async function createQuestionAttempt(
  supabase: SupabaseClient,
  attemptData: AttemptRecord
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('user_question_attempts')
    .insert([attemptData])
    .select('id')
    .single();

  if (error) {
    console.error('[quizPersistenceService] Error inserting attempt:', error);
    throw error;
  }

  return data;
}

/**
 * Create answer records for a question attempt
 */
export async function createQuestionAnswers(
  supabase: SupabaseClient,
  attemptId: string,
  questionType: string,
  userAnswer: any,
  questionOptions?: Array<{ id: string; option_text: string; image_url?: string }>
): Promise<void> {
  const answerRecords: AnswerRecord[] = [];

  switch (questionType) {
    case QUESTION_TYPE.MCQ: {
      const selectedOptionIds = userAnswer?.selectedOptions || [];

      if (selectedOptionIds.length > 0 && questionOptions) {
        // Fetch option snapshots
        const { data: optionsData, error: optionsError } = await supabase
          .from('question_options')
          .select('id, option_text, image_url')
          .in('id', selectedOptionIds);

        if (optionsError) {
          console.error('[quizPersistenceService] Error fetching options:', optionsError);
          throw optionsError;
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
      if (Array.isArray(userAnswer?.answers)) {
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
      console.warn('[quizPersistenceService] Unknown question type:', questionType);
      break;
  }

  if (answerRecords.length > 0) {
    const { error } = await supabase
      .from('user_question_answers')
      .insert(answerRecords);

    if (error) {
      console.error('[quizPersistenceService] Error inserting answers:', error);
      throw error;
    }
  }
}

/**
 * Persist all quiz attempts and answers
 */
export async function persistAllAttempts(
  supabase: SupabaseClient,
  userInfoId: string,
  attemptNumber: number,
  questions: Array<{ questions: any }>,
  answers: Record<number, any>,
  results: QuestionResult[]
): Promise<string[]> {
  const attemptIds: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const questionData = questions[i].questions;
    const userAnswer = answers[i];
    const result = results[i];

    // Create attempt record
    const attemptRecord: AttemptRecord = {
      user_info_id: userInfoId,
      question_id: questionData.id,
      attempt_number: attemptNumber,
      submitted_at: new Date().toISOString(),
      duration_seconds: 0,
      score: result.pointsEarned,
      max_score: result.pointsPossible,
      marking_status: result.markingStatus,
      feedback_positive: result.feedbackPositive,
      feedback_gaps: result.feedbackGaps,
      feedback_improvement: result.feedbackImprovement,
      key_concepts_assessed: result.keyConcepts,
      marking_rationale: result.markingRationale,
    };

    const { id: attemptId } = await createQuestionAttempt(supabase, attemptRecord);
    attemptIds.push(attemptId);

    // Create answer records
    await createQuestionAnswers(
      supabase,
      attemptId,
      questionData.type,
      userAnswer,
      questionData.question_options
    );
  }

  return attemptIds;
}

/**
 * Fetch latest attempt results for all questions (BATCH QUERY - replaces N+1 pattern)
 */
export async function fetchLatestAttemptResults(
  supabase: SupabaseClient,
  questionIds: string[],
  userInfoId: string,
  attemptNumber: number
): Promise<Map<string, any>> {
  const { data: allAttempts, error } = await supabase
    .from('user_question_attempts')
    .select('*, user_question_answers(*)')
    .in('question_id', questionIds)
    .eq('user_info_id', userInfoId)
    .eq('attempt_number', attemptNumber);

  if (error) {
    console.error('[quizPersistenceService] Error fetching attempts:', error);
    throw error;
  }

  // Group by question_id for easy lookup
  const attemptsByQuestion = new Map<string, any>();
  allAttempts?.forEach((attempt) => {
    attemptsByQuestion.set(attempt.question_id, attempt);
  });

  return attemptsByQuestion;
}

/**
 * Get the next attempt number for a set of questions
 */
export async function getNextAttemptNumber(
  supabase: SupabaseClient,
  questionIds: string[],
  userInfoId: string
): Promise<number> {
  const { data: existingAttempts } = await supabase
    .from('user_question_attempts')
    .select('attempt_number')
    .in('question_id', questionIds)
    .eq('user_info_id', userInfoId)
    .order('attempt_number', { ascending: false })
    .limit(1);

  return existingAttempts?.[0]?.attempt_number ?
    existingAttempts[0].attempt_number + 1 :
    1;
}

/**
 * Fetch all attempts for score calculation
 */
export async function fetchAllAttempts(
  supabase: SupabaseClient,
  questionIds: string[],
  userInfoId: string
): Promise<Array<{ attempt_number: number; score: number; max_score: number; submitted_at?: string }>> {
  const { data, error } = await supabase
    .from('user_question_attempts')
    .select('attempt_number, submitted_at, score, max_score')
    .in('question_id', questionIds)
    .eq('user_info_id', userInfoId);

  if (error) {
    console.error('[quizPersistenceService] Error fetching all attempts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all attempts with answers in a single query
 * Used for parent review to reduce query count
 */
export async function fetchAllAttemptsWithAnswers(
  supabase: SupabaseClient,
  questionIds: string[],
  userInfoId: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_question_attempts')
    .select(`
      question_id,
      attempt_number,
      score,
      max_score,
      submitted_at,
      marking_status,
      feedback_positive,
      feedback_gaps,
      feedback_improvement,
      key_concepts_assessed,
      user_question_answers(*)
    `)
    .in('question_id', questionIds)
    .eq('user_info_id', userInfoId);

  if (error) {
    console.error('[quizPersistenceService] Error fetching attempts with answers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update task-chapter with score and status
 *
 * Status determination:
 * - COMPLETED: score >= requiredScore (passed)
 * - ATTEMPTED: score < requiredScore (not passed)
 * - Never downgrades from COMPLETED to ATTEMPTED
 */
export async function updateChapterScore(
  supabase: SupabaseClient,
  userTasksChapterId: string,
  bestScore: number,
  bestTotalScore: number,
  isFirstAttempt: boolean,
  requiredScore: number,
  currentStatus?: string
): Promise<void> {
  // Calculate best percentage
  const bestPercentage =
    bestTotalScore > 0 ? Math.round((bestScore / bestTotalScore) * 100) : 0;

  // Determine new status: never downgrade from COMPLETED
  let newStatus: TASK_CHAPTER_STATUS;
  if (currentStatus === TASK_CHAPTER_STATUS.COMPLETED) {
    newStatus = TASK_CHAPTER_STATUS.COMPLETED;
  } else if (bestPercentage >= requiredScore) {
    newStatus = TASK_CHAPTER_STATUS.COMPLETED;
  } else {
    newStatus = TASK_CHAPTER_STATUS.ATTEMPTED;
  }

  const updateData: any = {
    score: bestScore,
    total_score: bestTotalScore,
    status: newStatus,
  };

  if (isFirstAttempt) {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('user_tasks_chapters')
    .update(updateData)
    .eq('id', userTasksChapterId);

  if (error) {
    console.error('[quizPersistenceService] Error updating task-chapter:', error);
    throw error;
  }
}

// ============================================
// Question Generation Persistence
// ============================================

/**
 * Persist generated quiz questions to the database
 * (Moved from generate.post.ts)
 */
export async function persistGeneratedQuestions(
  supabase: SupabaseClient,
  questions: QuizQuestion[],
  chapterId: string
): Promise<PersistResult[]> {
  const results: PersistResult[] = [];

  for (const question of questions) {
    const questionId = crypto.randomUUID();

    try {
      // 1. Insert into questions table
      const questionRecord = {
        id: questionId,
        chapter_id: chapterId,
        parent_question_id: question.parent_id || null,
        subquestion_order: question.order || null,
        part_label: question.part_label || null,
        type: question.question_type,
        title: question.title,
        question: question.content,
        explanation: question.explanation || null,
        question_image_url: null,
        explanation_image_url: null,
        source_timestamp: question.source_timestamp || new Date().toISOString(),
        source_name: 'AI_GENERATED',
      };

      const { error: questionError } = await supabase.from('questions').insert([questionRecord]);
      if (questionError) {
        console.error('[quizPersistenceService] Error inserting question:', questionError);
        throw questionError;
      }

      // 2. Insert options (for MCQ questions)
      const optionIdMap = new Map<string, string>();

      if (question.question_type === QUESTION_TYPE.MCQ && question.options && question.options.length > 0) {
        const optionRecords = question.options.map((option) => {
          const newOptionId = crypto.randomUUID();
          optionIdMap.set(option.id, newOptionId);

          return {
            id: newOptionId,
            question_id: questionId,
            option_text: option.option_text,
            image_url: option.imageUrl || null,
          };
        });

        const { error: optionsError } = await supabase.from('question_options').insert(optionRecords);
        if (optionsError) {
          console.error('[quizPersistenceService] Error inserting options:', optionsError);
          throw optionsError;
        }
      }

      // 3. Insert correct answers
      if (question.answer && question.answer.length > 0) {
        const answerRecords = question.answer.map((answer) => ({
          id: crypto.randomUUID(),
          question_id: questionId,
          option_id: answer.option_id ? (optionIdMap.get(answer.option_id) || null) : null,
          answer_text: answer.answer_text || null,
          answer_boolean: answer.answer_boolean !== null ? answer.answer_boolean : null,
          answer_draw_file: answer.answer_draw_file || null,
          image_url: null,
          order_index: answer.order_index,
        }));

        const { error: answersError } = await supabase.from('question_correct_answers').insert(answerRecords);
        if (answersError) {
          console.error('[quizPersistenceService] Error inserting answers:', answersError);
          throw answersError;
        }
      }

      results.push({ success: true, questionId });
    } catch (error) {
      console.error(`[quizPersistenceService] Failed to persist question:`, error);
      results.push({ success: false, questionId, error });
    }
  }

  return results;
}

/**
 * Link questions to a task-chapter
 */
export async function linkQuestionsToChapter(
  supabase: SupabaseClient,
  questionIds: string[],
  userTasksChapterId: string
): Promise<void> {
  const linkRecords = questionIds.map((questionId, index) => ({
    user_tasks_chapters_id: userTasksChapterId,
    question_id: questionId,
    display_order: index,
  }));

  const { error } = await supabase
    .from('user_tasks_chapters_questions')
    .insert(linkRecords);

  if (error) {
    console.error('[quizPersistenceService] Error linking questions:', error);
    throw error;
  }
}

/**
 * Check if quiz already exists for a task-chapter
 */
export async function checkExistingQuiz(
  supabase: SupabaseClient,
  userTasksChapterId: string
): Promise<boolean> {
  const { data: existingLinks } = await supabase
    .from('user_tasks_chapters_questions')
    .select('id')
    .eq('user_tasks_chapters_id', userTasksChapterId)
    .limit(1);

  return existingLinks && existingLinks.length > 0;
}
