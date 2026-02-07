import { useStudy } from '~/composables/useStudy';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useThreads } from '~/composables/useThreads';
import { useAnalytics } from '~/composables/useAnalytics';

interface StartLessonParams {
  chapterName: string;
  chapterDisplayName: string;
  subject: string;
  subjectDisplayName: string;
}

interface LessonResponse {
  success: boolean;
  hasSeededLesson: boolean;
  thread?: {
    id: string;
    title: string;
    subject: string | null;
    created_at?: string;
    updated_at?: string;
  };
  slideCount?: number;
}

export const useLessonStart = () => {
  const router = useRouter();
  const toast = useToast();
  const { generateStudyPrompt } = useStudy();
  const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();
  const { fetchThreads } = useThreads();
  const analytics = useAnalytics();

  const startLesson = async (params: StartLessonParams): Promise<void> => {
    const { chapterName, chapterDisplayName, subject, subjectDisplayName } = params;

    try {
      // Check token limits - show toast if exceeded but allow action (soft limit)
      await fetchTokenUsage();

      if (isLimitExceeded.value) {
        toast.add({
          title: 'Token limit reached',
          description: 'You have exceeded your token limit for this billing period.',
          color: 'red',
          timeout: 5000
        });
      }

      // Try seeded lesson first
      try {
        const lessonResponse = await $fetch<LessonResponse>('/api/lesson/start', {
          method: 'POST',
          body: {
            chapterName,
            subject,
          },
        });

        if (lessonResponse.success && lessonResponse.hasSeededLesson && lessonResponse.thread) {
          // Track lesson start
          analytics.learning.lessonStart({
            chapterId: chapterName,
            subjectId: subject,
            lessonType: 'seeded',
          });

          // Refresh thread list from database to include newly created thread
          await fetchThreads(true); // forceRefresh = true to reload from DB

          // Navigate directly to the created thread with seeded lesson
          await router.push(`/chat/${lessonResponse.thread.id}`);
          return;
        }
        // If no seeded lesson, fall through to AI generation
      } catch (lessonError) {
        console.warn('Seeded lesson not available, falling back to AI generation:', lessonError);
        toast.add({
          title: 'Generating lesson',
          description: 'Creating a fresh lesson for you...',
          color: 'blue',
          timeout: 3000,
        });
        // Fall through to AI generation
      }

      // Proceed with AI generation (fallback for lessons without seeded content)
      const studyResult = generateStudyPrompt(chapterDisplayName, subjectDisplayName, 'lesson');

      // Track AI-generated lesson start
      analytics.learning.lessonStart({
        chapterId: chapterName,
        subjectId: subject,
        lessonType: 'ai',
      });

      const queryParams = new URLSearchParams({
        study_prompt: studyResult.prompt
      });

      await router.push(`/chat/new?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error starting lesson:', error);
      toast.add({
        title: 'Error starting lesson',
        description: 'Failed to start the lesson. Please try again.',
        color: 'red',
        timeout: 5000
      });
      throw error;
    }
  };

  return {
    startLesson
  };
};
