<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <!-- Scrollable message list with space for input -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex"
        :class="msg.isUser ? 'justify-end mr-20' : 'justify-center'"
      >
        <div
          :class="[
            'p-3 rounded-lg text-sm max-w-[75%] whitespace-pre-wrap',
            msg.isUser
              ? 'bg-green-100 text-gray-800 rounded-bl-none'
              : 'text-gray-800 rounded-br-none',
          ]"
        >
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- Sticky ChatInput -->
    <div class="sticky bg-white p-10 z-10">
      <ChatInput @send="handleSend" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import ChatInput from './ChatInput.vue';

const scrollArea = ref(null);
const messages = ref([{ text: 'Talk to Snorlax...', isUser: false }]);

const handleSend = (text) => {
  messages.value.push({ text, isUser: true });

  // Simulate assistant reply
  setTimeout(() => {
    messages.value.push({
      text: `You said: "${text}". Here's a helpful response!`,
      isUser: false,
    });
  }, 500);
};

// Auto-scroll to bottom on message update
watch(
  () => messages.value.length,
  async () => {
    await nextTick();
    if (scrollArea.value) {
      scrollArea.value.scrollTop = scrollArea.value.scrollHeight;
    }
  }
);
</script>
