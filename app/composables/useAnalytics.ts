import { ANALYTICS_EVENTS } from '~~/shared/constants/analytics';

interface TrackParams {
  [key: string]: string | number | boolean | undefined;
}

// Session timer storage
const sessionTimers = new Map<string, number>();

export const useAnalytics = () => {
  const { gtag } = useGtag();
  const { analytics: analyticsEnabled } = useFeatureFlags();
  const runtimeConfig = useRuntimeConfig();

  // Determine environment
  const getEnvironment = (): string => {
    if (import.meta.dev) return 'local';
    // Check if it's the dev Supabase project
    const supabaseUrl = runtimeConfig.public.supabase?.url || '';
    if (supabaseUrl.includes('qfzqwbwwzqmacnhtihov')) return 'dev';
    return 'prod';
  };

  // Core tracking function
  const track = (eventName: string, params: TrackParams = {}) => {
    // Only track if analytics feature is enabled
    if (!analyticsEnabled.value) {
      return;
    }

    gtag('event', eventName, {
      ...params,
      environment: getEnvironment(),
      timestamp: Date.now(),
    });
  };

  // Timer utilities for measuring durations
  const startTimer = (timerName: string): void => {
    sessionTimers.set(timerName, Date.now());
  };

  const getElapsedSeconds = (timerName: string): number => {
    const startTime = sessionTimers.get(timerName);
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const stopTimer = (timerName: string): number => {
    const elapsed = getElapsedSeconds(timerName);
    sessionTimers.delete(timerName);
    return elapsed;
  };

  // Learning engagement events
  const learning = {
    lessonStart: (params: { chapterId: string; subjectId: string; lessonType: 'seeded' | 'ai' }) => {
      track(ANALYTICS_EVENTS.LESSON_START, params);
      startTimer(`lesson_${params.chapterId}`);
    },
    lessonComplete: (params: { chapterId: string; completionRate?: number }) => {
      const timeSpentSeconds = stopTimer(`lesson_${params.chapterId}`);
      track(ANALYTICS_EVENTS.LESSON_COMPLETE, { ...params, timeSpentSeconds });
    },
    lessonProgress: (params: { chapterId: string; progress: number }) => {
      track(ANALYTICS_EVENTS.LESSON_PROGRESS, params);
    },
    quizStart: (params: { quizId: string; chapterId: string; questionCount: number }) => {
      track(ANALYTICS_EVENTS.QUIZ_START, params);
      startTimer(`quiz_${params.quizId}`);
    },
    quizAttempt: (params: { quizId: string; score: number; totalScore: number; attemptNumber: number }) => {
      track(ANALYTICS_EVENTS.QUIZ_ATTEMPT, params);
    },
    quizComplete: (params: { quizId: string; bestScore: number; passedThreshold: boolean }) => {
      const timeSpentSeconds = stopTimer(`quiz_${params.quizId}`);
      track(ANALYTICS_EVENTS.QUIZ_COMPLETE, { ...params, timeSpentSeconds });
    },
  };

  // Feature usage events
  const feature = {
    tabView: (params: { tabName: string; previousTab?: string }) => {
      track(ANALYTICS_EVENTS.TAB_VIEW, params);
    },
    featureClick: (params: { featureName: string; context?: string }) => {
      track(ANALYTICS_EVENTS.FEATURE_CLICK, params);
    },
    navigation: (params: { from: string; to: string; method?: 'click' | 'browser' | 'programmatic' }) => {
      track(ANALYTICS_EVENTS.NAVIGATION, params);
    },
    search: (params: { query: string; resultsCount: number; context?: string }) => {
      track(ANALYTICS_EVENTS.SEARCH, params);
    },
  };

  // Conversion funnel events
  const conversion = {
    registration: (params: { method: 'email' | 'google'; role: string }) => {
      track(ANALYTICS_EVENTS.SIGN_UP, params);
    },
    login: (params: { method: 'email' | 'google' }) => {
      track(ANALYTICS_EVENTS.LOGIN, params);
    },
    onboardingComplete: (params: { stepsCompleted: number; timeSpentSeconds?: number }) => {
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, params);
    },
    firstLesson: (params: { subjectId: string; chapterId: string }) => {
      track(ANALYTICS_EVENTS.FIRST_LESSON, params);
    },
    subscriptionUpgrade: (params: { fromTier: string; toTier: string; revenue?: number }) => {
      track(ANALYTICS_EVENTS.SUBSCRIPTION_UPGRADE, params);
    },
    purchase: (params: { productId: string; amount: number; paymentMethod?: string }) => {
      track(ANALYTICS_EVENTS.PURCHASE, { ...params, currency: 'SGD' });
    },
  };

  // Chat/RAG specific events
  const chat = {
    sessionStart: (params: { threadId: string; subject: string; isNewThread: boolean }) => {
      track(ANALYTICS_EVENTS.CHAT_SESSION_START, params);
      startTimer(`chat_session_${params.threadId}`);
    },
    sessionEnd: (params: { threadId: string; messageCount: number; slideCount?: number }) => {
      const duration = stopTimer(`chat_session_${params.threadId}`);
      track(ANALYTICS_EVENTS.CHAT_SESSION_END, { ...params, duration });
    },
    messageSent: (params: { threadId: string; messageLength: number; subject: string; isFirstMessage: boolean }) => {
      track(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT, params);
    },
    suggestionUsed: (params: { suggestionType: 'lesson' | 'quiz' | 'homework'; subject: string }) => {
      track(ANALYTICS_EVENTS.CHAT_SUGGESTION_USED, params);
    },
    subjectSelected: (params: { subject: string; previousSubject?: string }) => {
      track(ANALYTICS_EVENTS.CHAT_SUBJECT_SELECTED, params);
    },
    threadResumed: (params: { threadId: string; daysSinceLastVisit: number }) => {
      track(ANALYTICS_EVENTS.CHAT_THREAD_RESUMED, params);
    },
    slideViewed: (params: { threadId: string; slideIndex: number; viewDuration?: number }) => {
      track(ANALYTICS_EVENTS.CHAT_SLIDE_VIEWED, params);
    },
    slideNavigation: (params: { direction: 'next' | 'prev' | 'jump'; fromIndex: number; toIndex: number }) => {
      track(ANALYTICS_EVENTS.CHAT_SLIDE_NAVIGATION, params);
    },
    feedbackSubmitted: (params: { messageId: string; feedbackType: 'like' | 'dislike'; category?: string }) => {
      track(ANALYTICS_EVENTS.CHAT_FEEDBACK_SUBMITTED, params);
    },
    feedbackDetailed: (params: { messageId: string; feedbackText?: string; categories?: string[] }) => {
      track(ANALYTICS_EVENTS.CHAT_FEEDBACK_DETAILED, {
        ...params,
        categories: params.categories?.join(','),
      });
    },
    responseCopied: (params: { messageId: string; contentType?: string }) => {
      track(ANALYTICS_EVENTS.CHAT_RESPONSE_COPIED, params);
    },
    streamingComplete: (params: { threadId: string; streamDuration: number; slideCount: number }) => {
      track(ANALYTICS_EVENTS.CHAT_STREAMING_COMPLETE, params);
    },
    answerSubmitted: (params: { threadId: string; questionType: string; isCorrect?: boolean }) => {
      track(ANALYTICS_EVENTS.CHAT_ANSWER_SUBMITTED, params);
    },
    answerMarked: (params: { threadId: string; score: number; totalScore: number; questionType: string }) => {
      track(ANALYTICS_EVENTS.CHAT_ANSWER_MARKED, params);
    },
    retryAttempt: (params: { threadId: string; attemptNumber: number; previousScore?: number }) => {
      track(ANALYTICS_EVENTS.CHAT_RETRY_ATTEMPT, params);
    },
    explanationViewed: (params: { threadId: string; questionId?: string; viewDuration?: number }) => {
      track(ANALYTICS_EVENTS.CHAT_EXPLANATION_VIEWED, params);
    },
  };

  return {
    track,
    learning,
    feature,
    conversion,
    chat,
    startTimer,
    getElapsedSeconds,
    stopTimer,
  };
};
