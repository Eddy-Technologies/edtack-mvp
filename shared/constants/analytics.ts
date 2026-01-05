// Analytics Event Names - Following GA4 naming conventions
// Use snake_case for event names

export const ANALYTICS_EVENTS = {
  // Learning engagement
  LESSON_START: 'lesson_start',
  LESSON_COMPLETE: 'lesson_complete',
  LESSON_PROGRESS: 'lesson_progress',
  QUIZ_START: 'quiz_start',
  QUIZ_ATTEMPT: 'quiz_attempt',
  QUIZ_COMPLETE: 'quiz_complete',

  // Feature usage
  TAB_VIEW: 'tab_view',
  FEATURE_CLICK: 'feature_click',
  NAVIGATION: 'navigation',
  SEARCH: 'search',

  // Conversion funnel
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  FIRST_LESSON: 'first_lesson',
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade',
  PURCHASE: 'purchase',

  // Chat/RAG specific
  CHAT_SESSION_START: 'chat_session_start',
  CHAT_SESSION_END: 'chat_session_end',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_SUGGESTION_USED: 'chat_suggestion_used',
  CHAT_SUBJECT_SELECTED: 'chat_subject_selected',
  CHAT_THREAD_RESUMED: 'chat_thread_resumed',
  CHAT_SLIDE_VIEWED: 'chat_slide_viewed',
  CHAT_SLIDE_NAVIGATION: 'chat_slide_navigation',
  CHAT_FEEDBACK_SUBMITTED: 'chat_feedback_submitted',
  CHAT_FEEDBACK_DETAILED: 'chat_feedback_detailed',
  CHAT_RESPONSE_COPIED: 'chat_response_copied',
  CHAT_STREAMING_COMPLETE: 'chat_streaming_complete',
  CHAT_ANSWER_SUBMITTED: 'chat_answer_submitted',
  CHAT_ANSWER_MARKED: 'chat_answer_marked',
  CHAT_RETRY_ATTEMPT: 'chat_retry_attempt',
  CHAT_EXPLANATION_VIEWED: 'chat_explanation_viewed',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const ANALYTICS_CATEGORIES = {
  LEARNING: 'learning',
  FEATURE: 'feature',
  CONVERSION: 'conversion',
  FEEDBACK: 'feedback',
  CHAT: 'chat',
} as const;

export type AnalyticsCategory = (typeof ANALYTICS_CATEGORIES)[keyof typeof ANALYTICS_CATEGORIES];
