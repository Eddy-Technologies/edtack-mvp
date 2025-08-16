<!-- pages/index.vue -->
<script setup lang="ts">
// Redirect directly to default character to avoid routing conflicts
navigateTo('/chat/eddy/new', { replace: true });
</script>

<template>
  <!-- Optional: fallback loading -->
  <div>Redirecting to chat...</div>
</template>
