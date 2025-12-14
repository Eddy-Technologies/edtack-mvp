/**
 * Fetch quiz questions for a specific task-chapter assignment
 *
 * Route: /api/quiz/[userTasksChapterId]/questions
 * Method: GET
 *
 * Returns:
 * - success: boolean
 * - questions: array of question objects with options and correct answers
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

    console.log('[questions] Fetching questions for task-chapter:', userTasksChapterId);

    const supabase = await getSupabaseClient(event);

    // Fetch questions linked to this task-chapter via junction table
    // Only select fields that are actually used by the frontend
    const { data: questionLinks, error: linkError } = await supabase
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
          part_label,
          question_options(
            id,
            option_text,
            image_url
          ),
          question_correct_answers(
            id,
            option_id,
            answer_text,
            answer_boolean,
            answer_draw_file,
            order_index
          )
        )
      `)
      .eq('user_tasks_chapters_id', userTasksChapterId)
      .order('display_order', { ascending: true });

    if (linkError) {
      console.error('[questions] Error fetching question links:', linkError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch quiz questions',
      });
    }

    // Transform to FE-expected shape (renamed fields)
    const questions = (questionLinks || []).map((link) => ({
      id: link.questions.id,
      question_type: link.questions.type,
      title: link.questions.title,
      content: link.questions.question,
      explanation: link.questions.explanation,
      part_label: link.questions.part_label,
      options: link.questions.question_options,
      answer: link.questions.question_correct_answers,
    }));

    console.log('[questions] Found', questions.length, 'questions for task-chapter:', userTasksChapterId);

    return {
      success: true,
      questions,
    };
  } catch (error: any) {
    console.error('[questions] Error:', error);

    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Otherwise create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch quiz questions',
    });
  }
});
