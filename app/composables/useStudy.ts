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

  const createQuizThread = async (chapter: any, subjectName: string) => {
    const init_prompt = generateStudyPrompt(chapter.display_name, subjectName, 'quiz');

    try {
      // Create new task thread
      const response = await $fetch('/api/study/create-quiz-thread', {
        method: 'POST',
        body: {
          chapterName: chapter.name,
          subjectName: subjectName,
          init_prompt
        }
      });
      console.log(response);
      return response.threadId;
    } catch (error: any) {
      console.error('Error handling quiz action:', error);
      throw new Error(error.data?.message || 'Failed to create quiz session');
    }
  };

  return {
    generateStudyPrompt,
    createQuizThread
  };
};
