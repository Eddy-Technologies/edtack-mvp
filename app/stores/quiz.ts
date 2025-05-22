// stores/quizStore.ts
import { defineStore } from 'pinia';

export const useQuizStore = defineStore('quiz', {
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
