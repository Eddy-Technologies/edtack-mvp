import type { QuizQuestion } from '~/types/quiz.types';

export function useQuestions() {
  const supabase = useSupabaseClient();

  // Fetch all questions
  async function getQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  // Fetch a single question by ID
  async function getQuestionById(id: string | number) {
    const { data, error } = await supabase.from('questions').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  // Add a new question
  async function addQuestion(questionData: Record<string, any>) {
    const { error } = await supabase.from('questions').insert([questionData]);
    if (error) throw error;
    return true;
  }

  // Update a question by ID
  async function updateQuestion(id: string | number, updates: Record<string, any>) {
    const { error } = await supabase.from('questions').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  }

  // Delete a question by ID
  async function deleteQuestion(id: string | number) {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Attempt a question (record a user's attempt)
  async function attemptQuestion({
    userId,
    questionId,
    selectedAnswer,
    isCorrect,
    attemptData = {},
  }: {
    userId: string | number;
    questionId: string | number;
    selectedAnswer: string;
    isCorrect: boolean;
    attemptData?: Record<string, any>;
  }) {
    const { error } = await supabase.from('question_attempts').insert([
      {
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        ...attemptData,
      },
    ]);
    if (error) throw error;
    return true;
  }

  /**
   * Persist a quiz question from AI backend to database (3 tables)
   * Handles all question types: MCQ, open, fill, boolean, draw
   */
  async function persistQuizQuestion(question: QuizQuestion, chapterId: string) {
    try {
      // 1. Insert into questions table
      const questionRecord = {
        id: question.id,
        chapter_id: chapterId,
        parent_question_id: question.parent_id || null,
        subquestion_order: question.order || null,
        part_label: question.part_label || null,
        type: question.question_type,
        title: question.title,
        question: question.content,
        explanation: question.explanation || null,
        question_image_url: null, // Can be added if available in question data
        explanation_image_url: null,
        source_timestamp: question.source_timestamp || new Date().toISOString(),
        source_name: 'AI_GENERATED', // Can be made dynamic
      };

      const { error: questionError } = await supabase.from('questions').insert([questionRecord]);
      if (questionError) {
        console.error('Error inserting question:', questionError);
        throw questionError;
      }

      // 2. Insert options (for MCQ questions)
      if (question.question_type === 'mcq' && question.options && question.options.length > 0) {
        const optionRecords = question.options.map((option) => ({
          id: option.id,
          question_id: question.id,
          option_text: option.option_text,
          image_url: option.imageUrl || null,
        }));

        const { error: optionsError } = await supabase.from('question_options').insert(optionRecords);
        if (optionsError) {
          console.error('Error inserting question options:', optionsError);
          throw optionsError;
        }
      }

      // 3. Insert correct answers
      if (question.answer && question.answer.length > 0) {
        const answerRecords = question.answer.map((answer) => ({
          id: answer.id,
          question_id: question.id,
          option_id: answer.option_id || null, // For MCQ
          answer_text: answer.answer_text || null, // For open/fill
          answer_boolean: answer.answer_boolean !== null ? answer.answer_boolean : null, // For boolean
          answer_draw_file: answer.answer_draw_file || null, // For draw
          image_url: null, // Can be added if available
          order_index: answer.order_index,
        }));

        const { error: answersError } = await supabase
          .from('question_correct_answers')
          .insert(answerRecords);
        if (answersError) {
          console.error('Error inserting correct answers:', answersError);
          throw answersError;
        }
      }

      return true;
    } catch (error) {
      console.error('Error persisting quiz question:', error);
      throw error;
    }
  }

  /**
   * Bulk persist multiple quiz questions from AI backend
   */
  async function persistQuizQuestions(questions: QuizQuestion[], chapterId: string) {
    const results = [];
    for (const question of questions) {
      try {
        await persistQuizQuestion(question, chapterId);
        results.push({ success: true, questionId: question.id });
      } catch (error) {
        console.error(`Failed to persist question ${question.id}:`, error);
        results.push({ success: false, questionId: question.id, error });
      }
    }
    return results;
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    attemptQuestion,
    persistQuizQuestion,
    persistQuizQuestions,
  };
}
