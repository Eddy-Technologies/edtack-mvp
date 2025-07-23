<!-- pages/chat/index.vue -->
<script setup lang="ts">
const avatarId = '1';

navigateTo(`/chat/${avatarId}`, { replace: true });
</script>

<template>
  <!-- Optional: fallback loading -->
  <div>Redirecting...</div>
</template>
