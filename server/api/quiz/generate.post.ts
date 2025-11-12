/**
 * Generate a new quiz for a chapter
 *
 * Request body:
 * - prompt: string - Generated prompt from useStudy composable
 * - chapterName: string - Chapter identifier
 * - chapterDisplayName: string - Human-readable chapter name
 * - subjectName: string - Subject name
 * - userLevel: string - User's education level
 * - syllabusType: string - User's syllabus type
 * - numQuestions: number - Number of questions to generate (default: 10)
 *
 * Returns:
 * - success: boolean
 * - questionCount: number
 * - message: string
 *
 * TODO: When implementing multiple quizzes per chapter:
 * 1. Create quiz_session record first
 * 2. Link questions to quiz_session via quiz_session_questions table
 * 3. Return quiz_session_id instead of just success
 */

import type { QuizQuestion } from '~/types/quiz.types';
import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const userInfo = await getUserInfo(event);

    // Parse request body
    const body = await readBody(event);
    const { prompt, chapterName, chapterDisplayName, subjectName, userLevel, syllabusType, numQuestions = 10, userTasksChapterId } = body;

    // Validate required fields
    if (!prompt || !chapterName || !chapterDisplayName || !subjectName) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: prompt, chapterName, chapterDisplayName, or subjectName',
      });
    }

    console.log('[generate] Generating quiz for:', {
      chapterName,
      chapterDisplayName,
      subjectName,
      numQuestions,
      userId: userInfo.user_id,
    });

    // Check if quiz already exists for this chapter
    const supabase = await getSupabaseClient(event);

    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('chapter_id', chapterName)
      .eq('source_name', 'AI_GENERATED')
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('[generate] Quiz already exists for chapter:', chapterName);
      throw createError({
        statusCode: 409,
        message: 'Quiz already exists for this chapter. Please use the existing quiz.',
      });
    }

    // Call Python backend to generate quiz
    const quizResponse = await generateQuiz({
      prompt,
      chapterName,
      chapterDisplayName,
      subjectName,
      userLevel: userLevel || 'unknown',
      syllabusType: syllabusType || 'unknown',
      numQuestions,
    });

    if (!quizResponse.success || !quizResponse.questions || quizResponse.questions.length === 0) {
      throw createError({
        statusCode: 500,
        message: 'Failed to generate quiz questions',
      });
    }

    console.log('[generate] Generated', quizResponse.questions.length, 'questions, persisting to database...');

    // Persist questions to database
    const persistResults = await persistQuizQuestionsServer(supabase, quizResponse.questions, chapterName);

    // Count successful persists
    const successCount = persistResults.filter((r) => r.success).length;
    const failCount = persistResults.filter((r) => !r.success).length;

    if (failCount > 0) {
      console.warn(`[generate] Failed to persist ${failCount} out of ${persistResults.length} questions`);
    }

    console.log('[generate] Successfully persisted', successCount, 'questions');

    // Link questions to task-chapter if userTasksChapterId provided
    if (userTasksChapterId) {
      const questionIds = persistResults
        .filter((r) => r.success)
        .map((r) => r.questionId);

      if (questionIds.length > 0) {
        console.log('[generate] Linking', questionIds.length, 'questions to task-chapter:', userTasksChapterId);

        const linkRecords = questionIds.map((questionId, index) => ({
          user_tasks_chapters_id: userTasksChapterId,
          question_id: questionId,
          display_order: index,
        }));

        const { error: linkError } = await supabase
          .from('user_tasks_chapters_questions')
          .insert(linkRecords);

        if (linkError) {
          console.error('[generate] Error linking questions to task-chapter:', linkError);
          throw createError({
            statusCode: 500,
            message: 'Failed to link questions to task',
          });
        }

        console.log('[generate] Successfully linked questions to task-chapter');
      }
    }

    return {
      success: true,
      questionCount: successCount,
      message: `Successfully generated and stored ${successCount} questions`,
    };
  } catch (error: any) {
    console.error('[generate] Error:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate quiz',
    });
  }
});

/**
 * Server-side implementation of persistQuizQuestions
 * Handles all question types: MCQ, open, fill, boolean, draw
 *
 * TODO: When implementing quiz_sessions, modify to accept quiz_session_id
 */
async function persistQuizQuestionsServer(
  supabase: any,
  questions: QuizQuestion[],
  chapterId: string
): Promise<Array<{ success: boolean; questionId: string; error?: any }>> {
  const results = [];

  for (const question of questions) {
    // 1. Insert into questions table
    const questionId = crypto.randomUUID();

    try {
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
      console.log('[persistQuizQuestionsServer] Inserting question:', questionRecord);

      const { error: questionError } = await supabase.from('questions').insert([questionRecord]);
      if (questionError) {
        console.error('[persistQuizQuestionsServer] Error inserting question:', questionError);
        throw questionError;
      }

      // 2. Insert options (for MCQ questions)
      // Create mapping from Python API option IDs to database UUIDs
      const optionIdMap = new Map<string, string>();

      if (question.question_type === 'mcq' && question.options && question.options.length > 0) {
        const optionRecords = question.options.map((option) => {
          const newOptionId = crypto.randomUUID();
          // Store mapping: Python option ID -> Database UUID
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
          console.error('[persistQuizQuestionsServer] Error inserting question options:', optionsError);
          throw optionsError;
        }
      }

      // 3. Insert correct answers
      if (question.answer && question.answer.length > 0) {
        const answerRecords = question.answer.map((answer) => ({
          id: crypto.randomUUID(),
          question_id: questionId,
          // Map Python option ID to database UUID if it exists
          option_id: answer.option_id ? (optionIdMap.get(answer.option_id) || null) : null,
          answer_text: answer.answer_text || null,
          answer_boolean: answer.answer_boolean !== null ? answer.answer_boolean : null,
          answer_draw_file: answer.answer_draw_file || null,
          image_url: null,
          order_index: answer.order_index,
        }));

        const { error: answersError } = await supabase.from('question_correct_answers').insert(answerRecords);
        if (answersError) {
          console.error('[persistQuizQuestionsServer] Error inserting correct answers:', answersError);
          throw answersError;
        }
      }

      results.push({ success: true, questionId: questionId });
    } catch (error) {
      console.error(`[persistQuizQuestionsServer] Failed to persist question ${question.id}:`, error);
      results.push({ success: false, questionId: questionId, error });
    }
  }

  return results;
}
