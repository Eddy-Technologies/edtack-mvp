/**
 * Marking API Integration Utility
 * Calls the Python backend marking API for question evaluation
 */

interface MarkingScore {
  awarded: number;
  total: number;
}

interface MarkingFeedback {
  positive: string;
  gaps: string;
  improvement: string;
}

export interface MarkingResult {
  question_id: string;
  score: MarkingScore;
  status: 'correct' | 'partially_correct' | 'incorrect';
  feedback: MarkingFeedback;
  key_concepts_assessed: string[];
  marking_rationale: string;
}

interface MarkingApiResponse {
  result: MarkingResult;
  processing_info: {
    processing_time_ms: number;
    timestamp: string;
    marker_version: string;
  };
}

export interface MarkQuestionOptions {
  subject?: string;
  level?: string;
  country?: string;
  authToken?: string; // Optional auth token for Python backend
}

/**
 * Marks a question using the Python backend marking API
 * @param question - Question object from database
 * @param studentAnswer - Student's answer submission
 * @param options - User context and auth options (subject, level, country, authToken)
 * @returns Marking API response
 */
export async function markQuestion(
  question: any,
  studentAnswer: any,
  options: MarkQuestionOptions = {}
): Promise<MarkingApiResponse> {
  const config = useRuntimeConfig();
  const pythonApiUrl = config.public.pythonApiUrl;
  const chatAuthEnabled = config.public.chatAuthEnabled;

  if (!pythonApiUrl) {
    throw new Error('Python API URL is not configured');
  }

  // Prepare marking request
  const request = {
    question: {
      id: question.id,
      type: 'question',
      question_type: question.type,
      title: question.title || '',
      content: question.question || '',
      explanation: question.explanation || '',
      answer: question.question_correct_answers?.map((a: any) => ({
        option_id: a.option_id,
        order_index: a.order_index,
        answer_text: a.answer_text,
      })) || [],
      options: question.question_options?.map((o: any) => ({
        id: o.id,
        option_text: o.option_text,
        correct: question.question_correct_answers?.some((a: any) => a.option_id === o.id),
      })) || [],
    },
    student_answer: studentAnswer,
    user_info: {
      subject: options.subject || 'general',
      level: options.level || 'secondary',
      country: options.country || 'singapore',
    },
  };

  // Build headers with optional auth
  const headers: Record<string, string> = {};
  if (chatAuthEnabled && options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  // Call marking API
  const response = await $fetch<MarkingApiResponse>(`${pythonApiUrl}/api/v1/mark/question`, {
    method: 'POST',
    body: request,
    headers,
    timeout: 30000, // 30 seconds
  });

  return response;
}
