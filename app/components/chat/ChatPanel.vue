<template>
  <div class="w-full border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
    <div ref="chatContainer" class="flex-1 overflow-y-auto">
      <div
        class="max-w-4xl mx-auto min-h-full border-x border-gray-200 dark:border-gray-800 p-4 space-y-2"
        :class="{
          'flex items-center justify-center': messages.length === 0,
        }"
      >
        <template v-for="message in messages" :key="message.id">
          <UserMessage
            v-if="message.role === 'user'"
            :content="message.content"
          />

          <AssistantMessage
            v-else
            :content="message.content"
            :message-id="message.id"
          />
        </template>
        <ChatLoadingSkeleton v-if="loading" class="p-4" />
        <NoChats v-if="!loading && messages.length === 0" @query-select="onQuerySelect" />
      </div>
    </div>
    <UDivider />
    <div class="flex items-start p-3.5 relative w-full max-w-4xl mx-auto">
      <UTextarea
        ref="userInput"
        v-model="userMessage"
        placeholder="How can Eddy help you today?"
        class="w-full"
        :ui="{
          padding: { xl: 'pr-11' },
          base: '!ring-primary-500 dark:!ring-primary-400',
        }"
        :rows="1"
        :maxrows="5"
        :disabled="loading"
        autoresize
        size="xl"
        @keydown.enter.exact.prevent="sendMessage"
        @keydown.enter.shift.exact.prevent="userMessage += '\n'"
      />

      <UButton
        icon="i-heroicons-arrow-up-20-solid"
        class="absolute top-5 right-5"
        :disabled="loading"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~~/types';
import NoChats from "~/components/chat/NoChats.vue";
import ChatLoadingSkeleton from "~/components/chat/ChatLoadingSkeleton.vue";
import AssistantMessage from "~/components/chat/AssistantMessage.vue";

const messages = ref<Message[]>([]);
const loading = ref(false);
const userMessage = ref('');
const chatContainer = ref<HTMLElement | null>(null);
let observer: MutationObserver | null = null;

onMounted(() => {
  if (chatContainer.value) {
    observer = new MutationObserver(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });

    observer.observe(chatContainer.value, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  nextTick(() => {
    userInput.value?.textarea.focus();
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const onQuerySelect = (query: string) => {
  userMessage.value = query;
  sendMessage();
};

const toast = useToast();
const userInput = useTemplateRef('userInput');

const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  loading.value = true;
  const tmpMessage = userMessage.value;
  userMessage.value = '';

  // Add user message
  messages.value.push({
    role: 'user',
    id: String(Date.now()),
    content: tmpMessage,
  });

  // Placeholder for assistant response
  const assistantMessageId = String(Date.now() + 1);
  messages.value.push({
    role: 'assistant',
    id: assistantMessageId,
    content: '',
  });

  await nextTick();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done && reader) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
      if (chunk) {
        messages.value[messages.value.length - 1].content += chunk;
      }
    }

    loading.value = false;
    nextTick(() => {
      userInput.value?.textarea.focus();
    });
  } catch (error) {
    console.error(error);
    messages.value.pop();
    userMessage.value = tmpMessage;
    loading.value = false;

    toast.add({
      title: 'Request Error',
      description: 'Failed to generate a response, please try again.',
      timeout: 10000,
      icon: 'i-heroicons-exclamation-triangle-16-solid',
      color: 'red',
    });
  }
};
</script>
