<template>
  <div class="question" ref="content">
    <span class="question-index text-primary text-2xl">Q{{ questionIndex + 1 }}. </span>
    <p class="question-content text-xl">{{ question.title }}</p>
    <div v-for="(option, index) in question.options" :key="index">
      <label
          class="form-control text-xl ml-7 mt-4 option-item"
          :class="{
          'bg-[#f0f8ff] border-[#00dc82] dark:bg-[#2a2a2a] dark:border-[#00dc82]': selectedAnswer === option,
          'hover:bg-[#f0f8ff] hover:border-[#00dc82] dark:hover:bg-[#2a2a2a] dark:hover:border-gray-500': selectedAnswer !== option
      }"
      >
      <input
          type="radio"
          :value="option"
          :name="'question-' + questionIndex"
          :checked="selectedAnswer === option"
          @change="selectAnswer(option)"
      />
      <span v-html="option"></span>
      </label>
    </div>
  </div>
</template>

<script>
import 'katex/dist/katex.min.css';
import { renderMath } from "../../utils/katexUtils.js";

export default {
  props: {
    question: Object,
    questionIndex: Number,
    selectedAnswer: String,
  },
  data() {
    return {
      renderedContent: '',
    };
  },
  methods: {
    selectAnswer(answer) {
      this.$emit('answer-selected', answer);
    }
  },
  mounted() {
    if (this.question && this.question.title) {
      renderMath(this.$refs.content);
    }
  }
};
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

.form-control + .form-control {
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
</style>
