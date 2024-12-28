<template>
  <div>
    <h2>Quiz Results</h2>
    <p>You got {{ score }} out of {{ totalQuestions }} correct!</p>
  </div>
</template>

<script>
export default {
  props: {
    score: Number,
    totalQuestions: Number
  }
}
</script>

<style scoped>
/* Add styles here */
</style>
