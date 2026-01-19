<template>
  <!-- Fallback content (won't render due to middleware redirect) -->
  <div>Redirecting to chat...</div>
</template>

<script setup lang="ts">
// Redirect handled by middleware to avoid flash of content
definePageMeta({
  middleware: 'redirect-chat'
});
</script>
