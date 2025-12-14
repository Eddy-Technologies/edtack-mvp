/**
 * Quiz Scoring Service
 *
 * Handles scoring logic for all question types:
 * - MCQ (Multiple Choice)
 * - Boolean (True/False)
 * - Open (Open-ended text)
 * - Fill (Fill in the blanks)
 * - Draw (Drawing questions)
 */

import { markQuestion } from '~~/server/utils/markingApi';
import { MARKING_STATUS, QUESTION_TYPE } from '~~/shared/constants';

// Types
export interface QuestionData {
  id: string;
  type: string;
  title: string;
  question: string;
  explanation?: string;
  question_options: Array<{ id: string; option_text: string }>;
  question_correct_answers: Array<{
    id: string;
    option_id?: string;
    answer_text?: string;
    answer_boolean?: boolean;
    order_index?: number;
  }>;
}

export interface UserAnswer {
  selectedOptions?: string[];
  answer?: string | boolean;
  answers?: string[];
  drawingFile?: string;
}

export interface QuestionResult {
  questionIndex: number;
  questionId: string;
  questionType: string;
  markingStatus: string;
  feedbackPositive: string | null;
  feedbackGaps: string | null;
  feedbackImprovement: string | null;
  keyConcepts: string[] | null;
  markingRationale: string | null;
  pointsEarned: number;
  pointsPossible: number;
  userAnswers: any[];
}

export interface AttemptScore {
  score: number;
  totalScore: number;
  submittedAt?: string;
}

/**
 * Transform marking API status (snake_case) to MARKING_STATUS enum (CONSTANT_CASE)
 */
export function transformMarkingStatus(apiStatus: string | undefined): string {
  if (!apiStatus) return MARKING_STATUS.INCORRECT;

  switch (apiStatus) {
    case 'correct':
      return MARKING_STATUS.CORRECT;
    case 'partially_correct':
      return MARKING_STATUS.PARTIALLY_CORRECT;
    case 'incorrect':
      return MARKING_STATUS.INCORRECT;
    default:
      console.warn(`[quizScoringService] Unknown marking status: ${apiStatus}, defaulting to INCORRECT`);
      return MARKING_STATUS.INCORRECT;
  }
}

/**
 * Score an MCQ question
 */
export function scoreMcqQuestion(
  questionData: QuestionData,
  userAnswer: UserAnswer
): { markingStatus: string; pointsEarned: number; pointsPossible: number; userAnswers: any[] } {
  const pointsPossible = 1;

  const correctOptionIds = questionData.question_correct_answers
    .filter((a) => a.option_id)
    .map((a) => a.option_id)
    .sort();

  const userOptionIds = Array.isArray(userAnswer?.selectedOptions) ?
      [...userAnswer.selectedOptions].sort() :
      [];

  const isCorrect =
    correctOptionIds.length === userOptionIds.length &&
    correctOptionIds.every((id, idx) => id === userOptionIds[idx]);

  const markingStatus = isCorrect ? MARKING_STATUS.CORRECT : MARKING_STATUS.INCORRECT;
  const pointsEarned = isCorrect ? pointsPossible : 0;

  // Build userAnswers array for MCQ
  const userAnswers = questionData.question_options
    .filter((opt) => userOptionIds.includes(opt.id))
    .map((opt) => ({ option_text: opt.option_text }));

  return { markingStatus, pointsEarned, pointsPossible, userAnswers };
}

/**
 * Score a Boolean question
 */
export function scoreBooleanQuestion(
  questionData: QuestionData,
  userAnswer: UserAnswer
): { markingStatus: string; pointsEarned: number; pointsPossible: number; userAnswers: any[] } {
  const pointsPossible = 1;

  const correctAnswer = questionData.question_correct_answers[0]?.answer_boolean;
  const userBooleanAnswer = userAnswer?.answer;

  // Normalize both values to boolean for comparison
  const normalizedUserAnswer = userBooleanAnswer === 'true' || userBooleanAnswer === true;
  const isCorrect = correctAnswer === normalizedUserAnswer;

  const markingStatus = isCorrect ? MARKING_STATUS.CORRECT : MARKING_STATUS.INCORRECT;
  const pointsEarned = isCorrect ? pointsPossible : 0;

  // Build userAnswers array for Boolean
  const userAnswers = [{
    answer_boolean: normalizedUserAnswer,
  }];

  return { markingStatus, pointsEarned, pointsPossible, userAnswers };
}

/**
 * Score an open-ended question (OPEN, FILL, DRAW) using the marking API
 */
export async function scoreOpenEndedQuestion(
  questionData: QuestionData,
  userAnswer: UserAnswer
): Promise<QuestionResult> {
  const answerContent = userAnswer?.answer || userAnswer?.answers || userAnswer?.drawingFile;

  const markingResponse = await markQuestion(questionData, answerContent, {});
  const markingResult = markingResponse.result;

  // Build userAnswers array based on question type
  let userAnswers: any[] = [];

  if (questionData.type === QUESTION_TYPE.OPEN) {
    userAnswers = [{ answer_text: userAnswer?.answer || '' }];
  } else if (questionData.type === QUESTION_TYPE.FILL) {
    if (Array.isArray(userAnswer?.answers)) {
      userAnswers = userAnswer.answers.map((ans, idx) => ({
        answer_text: ans,
        order_index: idx,
      }));
    } else {
      userAnswers = [{ answer_text: userAnswer?.answer || '' }];
    }
  } else if (questionData.type === QUESTION_TYPE.DRAW) {
    userAnswers = [{ answer_draw_file: userAnswer?.drawingFile || '' }];
  }

  return {
    questionIndex: -1, // Will be set by caller
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
    userAnswers,
  };
}

/**
 * Score a single question based on its type
 */
export async function scoreQuestion(
  questionData: QuestionData,
  userAnswer: UserAnswer,
  questionIndex: number
): Promise<QuestionResult> {
  switch (questionData.type) {
    case QUESTION_TYPE.MCQ: {
      const result = scoreMcqQuestion(questionData, userAnswer);
      return {
        questionIndex,
        questionId: questionData.id,
        questionType: questionData.type,
        markingStatus: result.markingStatus,
        feedbackPositive: null,
        feedbackGaps: null,
        feedbackImprovement: null,
        keyConcepts: null,
        markingRationale: null,
        pointsEarned: result.pointsEarned,
        pointsPossible: result.pointsPossible,
        userAnswers: result.userAnswers,
      };
    }

    case QUESTION_TYPE.BOOLEAN: {
      const result = scoreBooleanQuestion(questionData, userAnswer);
      return {
        questionIndex,
        questionId: questionData.id,
        questionType: questionData.type,
        markingStatus: result.markingStatus,
        feedbackPositive: null,
        feedbackGaps: null,
        feedbackImprovement: null,
        keyConcepts: null,
        markingRationale: null,
        pointsEarned: result.pointsEarned,
        pointsPossible: result.pointsPossible,
        userAnswers: result.userAnswers,
      };
    }

    case QUESTION_TYPE.OPEN:
    case QUESTION_TYPE.FILL:
    case QUESTION_TYPE.DRAW: {
      const result = await scoreOpenEndedQuestion(questionData, userAnswer);
      return { ...result, questionIndex };
    }

    default:
      console.warn(`[quizScoringService] Unknown question type: ${questionData.type}`);
      return {
        questionIndex,
        questionId: questionData.id,
        questionType: questionData.type,
        markingStatus: MARKING_STATUS.INCORRECT,
        feedbackPositive: null,
        feedbackGaps: null,
        feedbackImprovement: null,
        keyConcepts: null,
        markingRationale: null,
        pointsEarned: 0,
        pointsPossible: 1,
        userAnswers: [],
      };
  }
}

/**
 * Score all questions in a quiz
 */
export async function scoreAllQuestions(
  questions: Array<{ questions: QuestionData }>,
  answers: Record<number, UserAnswer>
): Promise<{ results: QuestionResult[]; earnedScore: number; totalScore: number }> {
  const results: QuestionResult[] = [];
  let earnedScore = 0;
  let totalScore = 0;

  for (let i = 0; i < questions.length; i++) {
    const questionData = questions[i].questions;
    const userAnswer = answers[i];

    const result = await scoreQuestion(questionData, userAnswer, i);
    results.push(result);

    earnedScore += result.pointsEarned;
    totalScore += result.pointsPossible;
  }

  return { results, earnedScore, totalScore };
}

/**
 * Calculate attempt scores grouped by attempt number
 */
export function calculateAttemptScores(
  attempts: Array<{ attempt_number: number; score: number; max_score: number; submitted_at?: string }>
): Record<number, AttemptScore> {
  const attemptScores: Record<number, AttemptScore> = {};

  attempts.forEach((att) => {
    if (!attemptScores[att.attempt_number]) {
      attemptScores[att.attempt_number] = {
        score: 0,
        totalScore: 0,
        submittedAt: att.submitted_at,
      };
    }
    attemptScores[att.attempt_number].score += att.score;
    attemptScores[att.attempt_number].totalScore += att.max_score;
  });

  return attemptScores;
}

/**
 * Find best score across all attempts
 */
export function findBestScore(
  attemptScores: Record<number, AttemptScore>,
  currentEarned: number,
  currentTotal: number
): { bestScore: number; bestTotalScore: number; bestPercentage: number } {
  let bestScore = currentEarned;
  let bestTotalScore = currentTotal;
  let bestPercentage = currentTotal > 0 ? Math.round((currentEarned / currentTotal) * 100) : 0;

  Object.values(attemptScores).forEach((attempt) => {
    const percentage = attempt.totalScore > 0 ?
        Math.round((attempt.score / attempt.totalScore) * 100) :
      0;
    if (percentage > bestPercentage) {
      bestScore = attempt.score;
      bestTotalScore = attempt.totalScore;
      bestPercentage = percentage;
    }
  });

  return { bestScore, bestTotalScore, bestPercentage };
}

/**
 * Format attempts for API response
 */
export function formatAttemptsForResponse(
  attemptScores: Record<number, AttemptScore>
): Array<{ attemptNumber: number; score: number; totalScore: number; percentage: number; submittedAt: string }> {
  return Object.entries(attemptScores)
    .map(([attemptNum, data]) => ({
      attemptNumber: parseInt(attemptNum),
      score: data.score,
      totalScore: data.totalScore,
      percentage: data.totalScore > 0 ? Math.round((data.score / data.totalScore) * 100) : 0,
      submittedAt: data.submittedAt || new Date().toISOString(),
    }))
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}
