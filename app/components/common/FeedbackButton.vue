<template>
  <button
    @click="handleClick"
    class="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50"
  >
    Feedback
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['openFeedback']);

function handleClick() {
  emit('openFeedback');
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
