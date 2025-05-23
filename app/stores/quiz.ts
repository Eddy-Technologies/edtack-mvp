import { defineStore } from 'pinia';

export const useQuizStore = defineStore('quiz', {
  // State is now a function that returns a plain object, do not use 'ref' or 'reactive' directly
  state: () => ({
    quiz: null as any,
  }),
  actions: {
    setQuiz(data: any) {
      this.quiz = data;
    },
    clear() {
      this.quiz = null;
    }
  },
});
