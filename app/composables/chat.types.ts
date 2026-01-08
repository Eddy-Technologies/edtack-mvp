/**
 * Shared types for chat composables (WebSocket and SSE)
 */

export enum GenerationIntentType {
  STANDARD_RESPONSE = 'standard_response',
  LESSON = 'lesson',
  QUIZ = 'quiz'
}

export interface ChatUserInfo {
  subject?: string;
  level?: string;
  country?: string;
  character_slug?: string;
  personality_prompt?: string;
}

export interface ChatMessage {
  type: 'start' | 'continue' | 'user_response' | 'cancel' | 'task_generation';
  payload?: string;
  user_info?: ChatUserInfo;
}

export interface ChatResponse {
  status: string;
  message?: string;
  generation_intent_type?: 'standard_response' | 'lesson' | 'quiz';
  error?: string;
  is_complete?: boolean;
  timestamp?: number;
  data?: any;
  phase?: string;

  // Cancellation response fields
  ready_for_new_message?: boolean;
  tokens_saved?: boolean;

  // Streaming support
  type?: 'slide_batch_ready' | 'quiz_batch_ready';
  slides?: any[];
  quiz_items?: any[];
  batch_index?: number;
  batch?: {
    slides: any[];
    batch_size: number;
    total_slides_so_far: number;
  };

  [key: string]: any;
}

export interface ChatOptions {
  authToken?: string;
  /**
   * Direct callback for terminal events (completed, cancelled, error, timeout).
   * Bypasses the unreliable watcher chain for more reliable end-state detection.
   */
  onTerminalEvent?: (status: string, response: ChatResponse) => void;
}
