<template>
  <div
    ref="content"
    class="question p-5"
  >
    <div class="flex justify-between items-center mb-2">
      <div class="question-index text-primary text-2xl">Q{{ questionIndex + 1 }}. </div>
      <div
        class="py-1 px-2 rounded-md question border-2 border-solid shadow-md font-semibold"
        :class="[
          selectedAnswer === question.correctAnswer ? 'border-green-600 bg-green-100 text-green-600' :
          selectedAnswer === undefined|null ? 'border-gray-600 bg-gray-100':
          'border-red-600 bg-red-100 text-red-600'
        ]"
      >
        <p v-if="selectedAnswer === question.correctAnswer">✅ Correct</p>
        <p v-else-if="selectedAnswer === undefined || selectedAnswer === null">Not attempted</p>
        <p v-else>❌  Incorrect</p>
      </div>
    </div>

    <p class="question-content text-xl">{{ question.title }}</p>
    <div v-for="(option, index) in question.options" :key="index">
      <label
        class="form-control text-xl mt-4 option-item"
        :class="[
          selectedAnswer === option
            ? option === question.correctAnswer
              ? 'correct-answer'
              : 'wrong-answer'
            : '',
          option === question.correctAnswer ? 'always-correct' : ''
        ]"
      >
        <input
          type="radio"
          :value="option"
          :name="'question-' + questionIndex"
          :checked="selectedAnswer === option"
          disabled
        >
        <span>{{ option }}</span>
      </label>
    </div>
    <p v-if="showDebugInfo" class="feedback correct-answer-box">
      <strong>Correct Answer:</strong> {{ question.correctAnswer }}
    </p>

    <!-- <p v-if="selectedAnswer === question.correctAnswer" class="feedback correct-feedback">
      ✅ Correct!
    </p>

    <p v-else class="feedback wrong-feedback">
      ❌ Incorrect.
    </p> -->

    <p v-if="selectedAnswer !== question.correctAnswer" ref="explanation" class="feedback explanation-box">
      <strong>Explanation:</strong> {{ question.explanation }}
    </p>

    <UButton
      class="mt-4 px-3 py-1 text-sm bg-red-400 dark:bg-red-700 rounded hover:bg-red-300 dark:hover:bg-red-600 transition"
      @click="openReportModal"
    >
      Report Error
    </UButton>

    <ReportErrorModal
      :show-report-modal="showReport"
      :question="question"
      :selected-answer="selectedAnswer"
      @close="showReport = false"
    />
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import 'katex/dist/katex.min.css';
import { renderMath } from '~/utils/katexUtils.js';
import ReportErrorModal from '~/components/report/ReportErrorModal.vue';

const props = defineProps({
  question: Object,
  questionIndex: Number,
  selectedAnswer: String,
});

const showDebugInfo = ref(false);
const showReport = ref(false);
const content = ref(null);

function openReportModal() {
  showReport.value = true;
}

onMounted(() => {
  if (props.question && props.question.title) {
    renderMath(content.value);
  }
});
</script>

<style scoped>
.question-index {
  font-weight: bold;
}

:root {
  --form-control-color: rebeccapurple;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

form {
  display: grid;
  place-content: center;
  min-height: 100vh;
}

.form-control {
  line-height: 1.1;
  display: grid;
  grid-template-columns: 1em auto;
  gap: 0.5em;
}

.form-control+.form-control {
  margin-top: 1em;
}

.form-control:focus-within {
  color: var(--form-control-color);
}

input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: white;
  margin: 0;
  font: inherit;
  color: currentColor;
  width: 1em;
  height: 1em;
  border: 0.10em solid currentColor;
  border-radius: 20%;
  transform: translateY(0.09em);
  display: grid;
  place-content: center;
}

input[type="radio"]::before {
  content: "";
  width: 0.4em;
  height: 0.4em;
  border-radius: 50%;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--form-control-color);
  background-color: #00dc82;
}

input[type="radio"]:checked::before {
  transform: scale(1);
}

.option-item {
  border-width: 2px;
  padding: 0.75em 1em;
  border-radius: 0.5em;
  transition: all 0.2s ease;
}

/* Always Correct (user did not select but is correct) */
.always-correct {
  background-color: #c8e6ce; /* Vibrant soft green */
  border: 2px dotted #388e3c; /* Rich green dotted border */
  color: #1b5e20; /* Deep green text */
  font-weight: bold;
  box-shadow: 0 0 6px rgba(56, 142, 60, 0.15);
  opacity: 1;
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.always-correct:hover {
  background-color: #a2d190; /* Slightly stronger vibrant green */
  box-shadow: 0 0 12px rgba(56, 142, 60, 0.35);
}

/* Dark mode */
.dark .always-correct {
  background-color: #1b5e20;
  color: #a5d6a7;
  border-color: #00e676;
  box-shadow: 0 0 8px rgba(0, 230, 118, 0.5);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.dark .always-correct:hover {
  background-color: #238c4b;
  box-shadow: 0 0 14px rgba(0, 230, 118, 0.6);
}

/* Wrong Answer */
.wrong-answer {
  background-color: #ffebee; /* Light red */
  border: 2px solid #d32f2f;
  color: #b71c1c;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(211, 47, 47, 0.2);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.wrong-answer:hover {
  background-color: #ffcdd2; /* Slightly stronger red on hover */
  box-shadow: 0 0 12px rgba(211, 47, 47, 0.4);
}

/* Dark mode */
.dark .wrong-answer {
  background-color: #b71c1c;
  color: #ffcdd2;
  border-color: #ef5350;
  box-shadow: 0 0 8px rgba(239, 83, 80, 0.5);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.dark .wrong-answer:hover {
  background-color: #ef9a9a; /* lighter red */
  box-shadow: 0 0 14px rgba(239, 83, 80, 0.7);
}

/* Correct Answer (user selected) */
.correct-answer {
  background-color: #d0f6d6; /* Deeper vibrant green */
  border: 2px solid #00a152; /* Dark vibrant green border */
  color: #007e33; /* Deep green text for contrast */
  font-weight: bold;
  box-shadow: 0 0 14px rgba(0, 161, 82, 0.3);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.correct-answer:hover {
  background-color: #9ddb8f; /* Stronger green on hover */
  box-shadow: 0 0 22px rgba(0, 161, 82, 0.5);
}

/* Dark mode */
.dark .correct-answer {
  background-color: #1b5e20;
  color: #a5d6a7;
  border-color: #00e676;
  box-shadow: 0 0 8px rgba(0, 230, 118, 0.5);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.dark .correct-answer:hover {
  background-color: #238c4b;
  box-shadow: 0 0 18px rgba(0, 230, 118, 0.7);
}

/* Generic feedback box */
.feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.6;
  font-weight: 500;
}

/* Correct Answer Display */
.correct-answer-box {
  background-color: #e8f5e9;
  border: 2px solid #00c853;
  color: #1b5e20;
}

.dark .correct-answer-box {
  background-color: #1b5e20;
  border-color: #00e676;
  color: #a5d6a7;
}

/* Explanation Box */
.explanation-box {
  background-color: #fff8e1;
  border: 2px solid #ffb300;
  color: #795548;
}

.dark .explanation-box {
  background-color: #3e2723;
  border-color: #ffca28;
  color: #ffe0b2;
}

/* Positive Feedback */
.correct-feedback {
  background-color: #c8e6ce;
  border: 2px solid #00c853;
  color: #1b5e20;
}

.dark .correct-feedback {
  background-color: #1b5e20;
  border-color: #00e676;
  color: #a5d6a7;
}

/* Negative Feedback */
.wrong-feedback {
  background-color: #ffebee;
  border: 2px solid #d32f2f;
  color: #b71c1c;
}

.dark .wrong-feedback {
  background-color: #b71c1c;
  border-color: #ef5350;
  color: #ffcdd2;
}
</style>
