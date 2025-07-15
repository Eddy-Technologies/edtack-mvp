<template>
  <Button
    class="fixed bottom-4 right-4 bg-background hover:bg-background-400 text-black font-bold py-2 px-4 rounded-full shadow-lg z-50"
    @click="handleClick"
  >
    Feedback
  </Button>
</template>

<script setup lang="ts">
function handleClick() {
  navigateTo('/feedback');
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
