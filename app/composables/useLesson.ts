// ~/composables/useLesson.ts
import lessonData from '../../assets/lessons_output.schema.json';

export function useLesson() {
  const allEntries = lessonData as any[];

  const getLessonBundle = (keyword: string) => {
    const parent = allEntries.find((item) => item.parent_id === null);
    if (!parent) return null;

    const slides = allEntries.filter((item) => item.type === 'slide');
    const questions = allEntries.filter((item) => item.type === 'question');
    return { parent, slides, questions };
  };
  return {
    getLessonBundle,
  };
}
