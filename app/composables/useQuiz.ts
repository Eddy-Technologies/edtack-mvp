import { ref, computed, readonly } from 'vue';
import type { QuizState, UserAnswer } from '~/types/quiz.types';

export const useQuiz = () => {
  const quizState = ref<QuizState>({
    userAnswers: {},
    showExplanations: {},
    score: 0,
    totalQuestions: 0
  });

  const submitAnswer = (answer: UserAnswer) => {
    quizState.value.userAnswers[answer.questionId] = answer;
    quizState.value.showExplanations[answer.questionId] = true;

    updateScore();
  };

  const updateScore = () => {
    const answers = Object.values(quizState.value.userAnswers);
    quizState.value.score = answers.filter((answer) => answer.isCorrect).length;
    quizState.value.totalQuestions = answers.length;
  };

  const getAnswer = (questionId: string): UserAnswer | undefined => {
    return quizState.value.userAnswers[questionId];
  };

  const shouldShowExplanation = (questionId: string): boolean => {
    return quizState.value.showExplanations[questionId] || false;
  };

  const resetQuiz = () => {
    quizState.value = {
      userAnswers: {},
      showExplanations: {},
      score: 0,
      totalQuestions: 0
    };
  };

  const quizScore = computed(() => ({
    score: quizState.value.score,
    total: quizState.value.totalQuestions,
    percentage: quizState.value.totalQuestions > 0 ?
        Math.round((quizState.value.score / quizState.value.totalQuestions) * 100) :
      0
  }));

  const isQuizComplete = computed(() => {
    return quizState.value.totalQuestions > 0 &&
      Object.keys(quizState.value.userAnswers).length === quizState.value.totalQuestions;
  });

  return {
    quizState: readonly(quizState),
    submitAnswer,
    getAnswer,
    shouldShowExplanation,
    resetQuiz,
    quizScore,
    isQuizComplete
  };
};
