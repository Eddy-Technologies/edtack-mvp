export type StudyActionType = 'lesson' | 'practice' | 'quiz';

export const useStudy = () => {
  const generateStudyPrompt = (chapterName: string, subjectName: string, taskType: StudyActionType) => {
    let prompt = '';
    let taskTitle = '';

    switch (taskType) {
      case 'lesson':
        taskTitle = `${chapterName} Lesson`;
        prompt = `I want to learn about ${subjectName}, specifically the chapter "${chapterName}".`;
        break;

      case 'practice':
        taskTitle = `${chapterName} Practice`;
        prompt = `I want to take a 5-question practice on ${subjectName} covering the chapter "${chapterName}".`;
        break;

      case 'quiz':
        taskTitle = `${chapterName} Quiz`;
        prompt = `I want to take a 10-question quiz on ${subjectName} covering the chapter "${chapterName}".`;
        break;

      default:
        throw new Error(`Invalid task type: ${taskType}. Must be 'lesson', 'practice', or 'quiz'.`);
    }

    return { prompt, taskTitle, taskType };
  };

  const handleQuizAction = async (chapter: any, subjectName: string, loadingState?: { [key: string]: boolean }) => {
    const router = useRouter();
    const { getCharacterBySubject } = useCharacters();

    try {
      if (loadingState) {
        loadingState[chapter.name] = true;
      }

      // Check if task thread already exists
      if (chapter.taskThreads && chapter.taskThreads.length > 0) {
        // Navigate to existing thread
        const threadId = chapter.taskThreads[0].thread_id;
        const character = getCharacterBySubject(subjectName);
        const characterSlug = character?.slug || 'eddy';
        await router.push(`/chat/${characterSlug}/${threadId}`);
        return;
      }

      // Create new task thread
      const response = await $fetch('/api/study/create-quiz-thread', {
        method: 'POST',
        body: {
          chapterName: chapter.name,
          subjectName: subjectName
        }
      });

      if (response.success) {
        // Generate quiz prompt and navigate
        const studyResult = generateStudyPrompt(chapter.display_name, subjectName, 'quiz');
        const queryParams = new URLSearchParams({
          study_prompt: studyResult.prompt
        });

        const character = getCharacterBySubject(subjectName);
        const characterSlug = character?.slug || 'eddy';
        await router.push(`/chat/${characterSlug}/${response.threadId}?${queryParams.toString()}`);
      }
    } catch (error: any) {
      console.error('Error handling quiz action:', error);
      throw new Error(error.data?.message || 'Failed to create quiz session');
    } finally {
      if (loadingState) {
        loadingState[chapter.name] = false;
      }
    }
  };

  return {
    generateStudyPrompt,
    handleQuizAction
  };
};
