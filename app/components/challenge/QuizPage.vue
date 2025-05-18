<template>
  <div class="mx-auto sm:w-11/12 sm:max-w-6xl sm:px-6">
    <h1 class=" font-bold mb-2 text-center text-primary">{{ name }}</h1>

    <!-- Quiz Phase -->
    <div v-if="!quizFinished">
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="bg-white dark:bg-zinc-900 rounded-xl p-5 mb-5 border border-gray-200 dark:border-zinc-700 shadow hover:shadow-lg transition"
      >
        <Question
          :question="question"
          :question-index="index"
          :selected-answer="userAnswers[index]"
          @answer-selected="updateAnswer(index, $event)"
        />
      </div>

      <div class="flex justify-center sm:justify-start mt-5">
        <button
          class="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500 text-white dark:text-zinc-900 font-semibold rounded-lg transition"
          @click="submitQuiz"
        >
          Submit Challenge
        </button>
      </div>
    </div>

    <!-- Result Phase -->
    <div v-else ref="content">
      <h3 class="text-2xl font-semibold mb-5 text-center text-primary">Results</h3>

      <div
        v-for="(question, index) in questions"
        :key="index"
        class="bg-white dark:bg-zinc-900 rounded-xl p-5 mb-5 border border-gray-200 dark:border-zinc-700 shadow"
      >
        <QuestionResult
          :question="question"
          :question-index="index"
          :selected-answer="userAnswers[index]"
        />
      </div>

      <div
        class="mt-8 p-6 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-cyan-400 text-center rounded-lg shadow"
      >
        <h4 class="text-xl font-bold mb-2">Your Score: {{ score }} / {{ questions.length }}</h4>
        <span class="text-lg font-medium text-primary">You earned {{ score }} credits!</span>
      </div>

      <UButton to="store" aria-label="store" class="mt-6">
        Redeem your credits!
      </UButton>
    </div>
  </div>
</template>

<script>
import Question from '~/components/challenge/Question.vue';
import QuestionResult from '~/components/challenge/QuestionResult.vue';

export default {
  components: {
    Question,
    QuestionResult
  },
  props: {
    quiz: Object,
  },
  emits: ['quiz-submitted'],
  data() {
    return {
      questions: this.quiz,
      userAnswers: [],
      quizFinished: false,
      score: 0,
      name: this.$route.query.name
    };
  },
  methods: {
    submitQuiz() {
      this.quizFinished = true;
      this.calculateScore();
      this.$emit('quiz-submitted', this.score);
    },
    updateAnswer(index, answer) {
      this.userAnswers[index] = answer;
    },
    calculateScore() {
      this.score = this.userAnswers.reduce((total, answer, index) => {
        return total + (answer === this.questions[index].correctAnswer ? 1 : 0);
      }, 0);
    }
  }
};
</script>
