export type StudyActionType = 'lesson' | 'practice';

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

      default:
        throw new Error(`Invalid task type: ${taskType}. Must be 'lesson' or 'practice'.`);
    }

    return { prompt, taskTitle, taskType };
  };

  return {
    generateStudyPrompt
  };
};
