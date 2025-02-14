<template>
  <div class="question">
    <span class="question-index">Q{{ questionIndex + 1 }}. </span>
    <span v-html="content" ref="content" @DOMNodeInserted="renderMathJax"></span>
    <!-- <div class="explanation" @click="toggleExplain">
      <div v-if="explanation" v-html="explanation" ref="explanation" @DOMNodeInserted="renderMathJax" />
      <span v-else class="explanation">Explain</span>
    </div>-->
    <div v-for="(option, index) in question.options" :key="index">
      <label>
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
  color: #48bb78;
  font-weight: bold;
}
.explanation {
  color: #48bb78;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
  cursor: pointer;
}
/* Add any additional styling */
</style>
