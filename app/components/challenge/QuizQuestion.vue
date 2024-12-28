<template>
  <div class="question">
    <div v-html="content" />
    <div class="explanation" @click="toggleExplain">
      <div v-if="explanation" v-html="explanation" />
      <span v-else class="explanation">Explain</span>
    </div>
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
      this.$emit('answer-selected', answer) ;  // Emit the selected answer to the parent
    },
    toggleExplain() {
      if (this.explanation) {
        this.explanation = null;
      } else {
        this.explanation = this.question.explanation;
      }
    }
  },
  created() {
    this.content = this.question.title.replace(/\n/g, "<br />");
  }
}
</script>

<style scoped>
.explanation {
  color: #48bb78;
  font-weight: bold;
  display: block;
  margin-top: 10px;
  cursor: pointer;
}
/* Add any additional styling */
</style>
