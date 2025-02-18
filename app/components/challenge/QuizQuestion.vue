<template>
  <div class="question">
    <span class="question-index text-primary text-2xl">Q{{ questionIndex + 1 }}. </span>
    <span class="question-content text-xl" v-html="content" ref="content" @DOMNodeInserted="renderMathJax"></span>
    <!-- <div class="explanation" @click="toggleExplain">
      <div v-if="explanation" v-html="explanation" ref="explanation" @DOMNodeInserted="renderMathJax" />
      <span v-else class="explanation">Explain</span>
    </div>-->
    <div v-for="(option, index) in question.options" :key="index">
      <label class="form-control text-xl ml-7 mt-4">
        <input
          type="radio"
          :value="option"
          :name="'question-' + questionIndex"
          :checked="selectedAnswer === option"
          @change="selectAnswer(option)"
        />
        {{ option }}
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: Object,
    questionIndex: Number,
    selectedAnswer: String,  // Receive the selected answer from the parent
  },
  data() {
    return {
      content: "",
      explanation: null
    }
  },
  methods: {
    selectAnswer(answer) {
      this.$emit('answer-selected', answer);  // Emit the selected answer to the parent
    },
    toggleExplain() {
      if (this.explanation) {
        this.explanation = null;
      } else {
        this.explanation = this.question.explanation;
      }
    },
    renderMathJax() {
      if (window.MathJax) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.$refs.content]);
        if (this.$refs.explanation) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.$refs.explanation]);
        }
      }
    }
  },
  created() {
    this.content = this.question ? this.question.title.replace(/\n/g, "<br />") : "";
  },
  watch: {
    content(newContent) {
      this.$nextTick(() => {
        this.renderMathJax();
      });
    },
    explanation(newExplanation) {
      this.$nextTick(() => {
        this.renderMathJax();
      });
    }
  }
}
</script>

<style scoped>
.question-index {
  font-weight: bold;
}
.explanation {
  color: #48bb78;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
  cursor: pointer;
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
  /* Add if not using autoprefixer */
  -webkit-appearance: none;
  /* Remove most all native input styles */
  appearance: none;
  background-color: white;
  /* Not removed via appearance */
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
  /* Windows High Contrast Mode */
  background-color: #00dc82;
}

input[type="radio"]:checked::before {
  transform: scale(1);
}

</style>
