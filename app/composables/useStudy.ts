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

  const createQuizThread = async (chapterName: string, subjectName: string) => {
    try {
      const response = await $fetch('/api/study/create-quiz-thread', {
        method: 'POST',
        body: {
          chapterName,
          subjectName
        }
      });

      if (!response.success) {
        throw new Error('Failed to create quiz thread');
      }

      return response;
    } catch (error: any) {
      console.error('Error creating quiz thread:', error);
      throw new Error(error.data?.message || 'Failed to create quiz thread');
    }
  };

  return {
    generateStudyPrompt,
    createQuizThread,
  };
};
