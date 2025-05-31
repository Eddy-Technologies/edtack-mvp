<template>
 <div class="w-full border-t border-gray-200 mt-4 pt-4">
 <div ref="chatContainer" class="flex-1 overflow-y-auto">
 <div
 class="max-w-4xl mx-auto min-h-full border-x border-gray-200 p-4 space-y-2"
 :class="{
 'flex items-center justify-center': messages.length === 0,
 }"
 >
 <template v-for="message in messages" :key="message.id">
 <UserMessage v-if="message.role === 'user'" :content="message.content" />
 <AssistantMessage v-else :content="message.content" :message-id="message.id" />
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
 base: '!ring-primary-500 ',
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
import { ref, onMounted, onUnmounted } from 'vue';
import type { Message } from '~~/types';
import UserMessage from '~/components/chat/UserMessage.vue';
import NoChats from '~/components/chat/NoChats.vue';
import ChatLoadingSkeleton from '~/components/chat/ChatLoadingSkeleton.vue';
import AssistantMessage from '~/components/chat/AssistantMessage.vue';

const props = defineProps<{
 question?: string
}>();

const messages = ref<Message[]>([]);
const loading = ref(false);
const userMessage = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const userInput = useTemplateRef('userInput');
const toast = useToast();

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
 if (query === 'Please explain it in another way') {
 userMessage.value = 'Provide an alternative explanation to the given one'
 } else if (query === 'Help me understand this better') {
 userMessage.value = 'Help me understand the question and the topic in detailed manner'
 } else{
 userMessage.value = query;
 }
 sendMessage();
};

// Simulated streaming helper
const typeText = async (
 text: string,
 onUpdate: (partial: string) => void,
 speed = 10
) => {
 let i = 0;
 while (i < text.length) {
 onUpdate(text.slice(0, i + 1));
 await new Promise((resolve) => setTimeout(resolve, speed));
 i++;
 }
};

const sendMessage = async () => {
 if (!userMessage.value.trim()) return;

 loading.value = true;
 const tmpMessage = userMessage.value;
 userMessage.value = '';

 // Push user message
 messages.value.push({
 role: 'user',
 id: String(Date.now()),
 content: tmpMessage,
 });

 // Placeholder for assistant
 const assistantMessageId = String(Date.now() + 1);
 messages.value.push({
 role: 'assistant',
 id: assistantMessageId,
 content: '',
 });

 await nextTick();

 try {
 const questionContext = `
 Question: ${props.question.title}
 Explanation: ${props.question.explanation}
 Correct Answer: ${props.question.correctAnswer}
 `;
 const res = await fetch('/api/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ messages: messages.value, question: questionContext }),
 });

 const data = await res.json(); // { message:"Full Gemini response" }
 const fullResponse = data.message;

 // Simulate character-by-character streaming
 await typeText(fullResponse, (partial) => {
 messages.value[messages.value.length - 1].content = partial;
 });
 } catch (error) {
 console.error(error);
 messages.value.pop(); // remove assistant placeholder
 userMessage.value = tmpMessage;
 toast.add({
 title: 'Request Error',
 description: 'Failed to generate a response, please try again.',
 timeout: 10000,
 icon: 'i-heroicons-exclamation-triangle-16-solid',
 color: 'red',
 });
 } finally {
 loading.value = false;
 nextTick(() => {
 userInput.value?.textarea.focus();
 });
 }
};
</script>
