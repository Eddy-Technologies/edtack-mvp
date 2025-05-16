<template>
  <div class="quiz-container">
    <h1 class="quiz-title">{{ name }}</h1>

    <!-- Quiz Phase -->
    <div v-if="!quizFinished">
      <div v-for="(question, index) in questions" :key="index" class="quiz-section">
        <QuizQuestion
          :question="question"
          :questionIndex="index"
          :selectedAnswer="userAnswers[index]"
          @answer-selected="updateAnswer(index, $event)"
        />
      </div>
      <button class="btn-submit" @click="submitQuiz">Submit Challenge</button>
    </div>

    <!-- Result Phase -->
    <div v-else ref="content">
      <h3 class="section-title">Results</h3>
      <div v-for="(question, index) in questions" :key="index" class="quiz-section">
        <QuizResult
          :question="question"
          :questionIndex="index"
          :selectedAnswer="userAnswers[index]"
        />
      </div>
      <div class="score-box">
        <h4>Your Score: {{ score }} / {{ questions.length }}</h4>
        <span>You earned {{ score }} credits!</span>
      </div>
    </div>
  </div>
</template>

<script>
import QuizQuestion from "~/components/challenge/QuizQuestion.vue";
import QuizResult from "~/components/challenge/QuizResult.vue";

export default {
  components: {
    QuizQuestion,
    QuizResult
  },
  props: {
    quiz: Object,
  },
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

<style scoped>
/* Container */
.quiz-container {
  width: 80%;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

/* Title */
.quiz-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
}

/* Segmented Card Section */
.quiz-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.quiz-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dark .quiz-section {
  background-color: #1e1e1e;
  border-color: #333;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.05);
}

.dark .quiz-section:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.08);
}

/* Buttons */
.btn-submit {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #00c853;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background-color: #00b341;
}

.dark .btn-submit {
  background-color: #00e676;
  color: #121212;
}

.dark .btn-submit:hover {
  background-color: #00c853;
}

/* Score box */
.score-box {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #b3e5fc;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 191, 255, 0.2);
}

.dark .score-box {
  background-color: #263238;
  border-color: #4dd0e1;
  color: #b2ebf2;
  box-shadow: 0 0 8px rgba(77, 208, 225, 0.3);
}

/* Section titles */
.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

h4 {
  font-size: 1.2rem;
  margin-top: 20px;
  font-weight: 600;
}

</style>
