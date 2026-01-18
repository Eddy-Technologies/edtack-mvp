<template>
  <Button
    variant="primary"
    class="fixed bottom-6 right-6 text-sm py-2 px-4 rounded-full shadow-lg z-50"
    @click="handleClick"
  >
    Feedback
  </Button>
</template>

<script setup lang="ts">
import Button from '~/components/common/Button.vue';

function handleClick() {
  navigateTo('/about?tab=feedback');
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
