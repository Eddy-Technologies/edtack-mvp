<template>
  <div class="flex flex-col md:flex-row h-screen">
    <!-- Left column for VideoPanel -->
    <div class="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-200">
      <VideoPanel />
    </div>

    <!-- Right column for ChatPanel -->
    <div class="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
      <ChatPanel class="flex-grow" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Import components
import ChatPanel from '~/components/chat/ChatPanel.vue';
import VideoPanel from '~/components/video/VideoPanel.vue';

// Define any page-specific logic if needed in the future
</script>

<style scoped>
/* Add any page-specific styles if needed */
.h-screen {
  height: 100vh;
}
</style>
