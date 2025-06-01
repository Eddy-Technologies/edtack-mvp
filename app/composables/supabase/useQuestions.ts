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

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    attemptQuestion,
  };
}
