/**
 * Python Backend API Integration
 *
 * This utility handles communication with the Python backend for quiz generation.
 * Integrates with the POST /api/v1/task/{thread_id} endpoint.
 *
 * Note: The Python backend handles all subject/level/country mappings via
 * map_frontend_user_info() in eddy/utils/frontend_mapping.py
 */

import type { QuizQuestion } from '~/types/quiz.types';

export interface GenerateQuizParams {
  prompt: string;
  chapterName: string;
  chapterDisplayName: string;
  subjectName: string;
  userLevel: string;
  syllabusType: string;
  numQuestions: number;
}

export interface GenerateQuizResponse {
  success: boolean;
  questions: QuizQuestion[];
  threadId?: string;
  message?: string;
}

/**
 * Python backend response type for POST /api/v1/task/{thread_id}
 * Based on TaskGenerationResponse schema in eddy/api/endpoints.py
 */
export interface PythonTaskGenerationResponse {
  status: string;
  message: string;
  teaching_mat: any[];
  generation_intent_type: string | null;
  selected_chapters: any[];
  generation_metadata: Record<string, any> | null;
  thread_id: string;
  processing_info: {
    processing_time_ms: number;
    timestamp: string;
    items_generated: number;
    generator_version: string;
  };
}

/**
 * Generate a quiz by calling the Python backend
 *
 * @param params Quiz generation parameters
 * @returns Generated quiz questions
 *
 * Note: Subject, level, and country values are passed directly to Python backend.
 * The Python backend handles mapping via map_frontend_user_info() function.
 */
export async function generateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResponse> {
  const config = useRuntimeConfig();
  const pythonApiUrl = config.public.pythonApiUrl;

  // Generate unique thread ID for this quiz generation
  const threadId = crypto.randomUUID();

  console.log('[pythonApi] Generating quiz with params:', params);
  console.log('[pythonApi] Python API URL:', pythonApiUrl);
  console.log('[pythonApi] Thread ID:', threadId);

  try {
    // Format request body for Python backend
    // Python backend will handle mapping subject/level/country values
    const requestBody = {
      input: params.prompt,
      user_info: {
        subject: params.subjectName, // Pass directly (e.g., "Mathematics", "Biology")
        level: params.userLevel, // Pass directly (e.g., "SECONDARY_3", "PRIMARY_1")
        country: 'SINGAPORE', // Python backend will map to lowercase
        personality_prompt: 'no personality needed',
      },
    };

    console.log('[pythonApi] Request body:', JSON.stringify(requestBody, null, 2));

    // Call Python backend API with explicit type
    const response = await $fetch<PythonTaskGenerationResponse>(`${pythonApiUrl}/task/${threadId}`, {
      method: 'POST',
      body: requestBody,
      timeout: 60000 * 5, // TODO: revise 5 minute timeout
    });

    console.log('[pythonApi] Response status:', response.status);
    console.log('[pythonApi] Response message:', response.message);

    // Validate response
    if (!response.teaching_mat || !Array.isArray(response.teaching_mat)) {
      throw new Error('Invalid response: teaching_mat array missing');
    }

    // Extract questions from teaching_mat
    const questions: QuizQuestion[] = response.teaching_mat.filter(
      (item: any) => item.type === 'question'
    );

    console.log('[pythonApi] Successfully generated quiz with', questions.length, 'questions');

    // Validate questions have required fields
    for (const question of questions) {
      if (!question.id || !question.content || !question.question_type) {
        console.warn('[pythonApi] Question missing required fields:', question);
      }
    }

    return {
      success: true,
      questions,
      threadId,
      message: response.message,
    };
  } catch (error: any) {
    console.error('[pythonApi] Error generating quiz:', error);

    // Provide more detailed error messages
    if (error.name === 'FetchError') {
      if (error.statusCode) {
        throw new Error(`Python backend error (${error.statusCode}): ${error.message}`);
      }
      throw new Error(`Network error: Unable to reach Python backend at ${pythonApiUrl}`);
    }

    if (error.name === 'TimeoutError') {
      throw new Error('Quiz generation timed out after 60 seconds. Please try again.');
    }

    throw new Error(`Failed to generate quiz: ${error.message || 'Unknown error'}`);
  }
}
