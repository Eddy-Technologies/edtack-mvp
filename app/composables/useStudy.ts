export type StudyActionType = 'lesson' | 'practice' | 'quiz';

export const useStudy = () => {
  const generateStudyPrompt = (chapterName: string, subjectName: string, taskType: StudyActionType, numQuestions?: number) => {
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

      case 'quiz': {
        const count = numQuestions || 10;
        const mcqCount = Math.round(count * 0.8);
        const openCount = count - mcqCount;
        taskTitle = `${chapterName} Quiz`;
        prompt = `I want to take a ${count}-question quiz consisting of ${mcqCount} mcq and ${openCount} open-ended questions on ${subjectName} covering the chapter "${chapterName}".`;
        break;
      }

      default:
        throw new Error(`Invalid task type: ${taskType}. Must be 'lesson', 'practice', or 'quiz'.`);
    }

    return { prompt, taskTitle, taskType };
  };

  return {
    generateStudyPrompt
  };
};
