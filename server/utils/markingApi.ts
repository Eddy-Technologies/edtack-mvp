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

/**
 * Marks a question using the Python backend marking API
 * @param question - Question object from database
 * @param studentAnswer - Student's answer submission
 * @param userInfo - User context (subject, level, country)
 * @returns Marking API response
 */
export async function markQuestion(
  question: any,
  studentAnswer: any,
  userInfo: { subject?: string; level?: string; country?: string }
): Promise<MarkingApiResponse> {
  const config = useRuntimeConfig();
  const pythonApiUrl = config.public.pythonApiUrl;

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
      subject: userInfo.subject || 'general',
      level: userInfo.level || 'secondary',
      country: userInfo.country || 'singapore',
    },
  };

  // Call marking API
  const response = await $fetch<MarkingApiResponse>(`${pythonApiUrl}/mark/question`, {
    method: 'POST',
    body: request,
    timeout: 30000, // 30 seconds
  });

  return response;
}
