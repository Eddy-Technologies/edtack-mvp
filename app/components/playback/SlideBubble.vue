<template>
  <div class="min-w-0 text-left">
    <!-- Render QuizQuestion if this is a question type slide -->
    <QuizQuestion
      v-if="slide.type === 'question'"
      :question="slide"
      :start-playback="startPlayback"
      @finish="emit('finish')"
      @answer-submitted="handleAnswerSubmitted"
    />

    <!-- Regular slide content -->
    <div v-else>
      <h2 class="text-lg font-semibold mb-2 whitespace-pre-wrap">{{ displayedTitle }}</h2>
      <div v-if="isTyping" class="whitespace-pre-wrap">{{ displayedText }}</div>
      <div v-else v-html="processedHtml" />

      <!-- Message Actions for regular slides -->
      <MessageActions
        v-if="!isTyping && slide.type !== 'question'"
        :message-text="slideText"
        :message-id="messageId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue';
import MessageActions from '../chat/MessageActions.vue';
import QuizQuestion from './QuizQuestion.vue';
import type { UserAnswer } from '~/types/quiz.types';

const props = defineProps<{
  slide: any;
  isUser: boolean;
  startPlayback: boolean;
  messageId?: string;
  threadId?: string;
}>();

const emit = defineEmits(['finish', 'answer-submitted']);

// Computed property to get combined slide text for MessageActions
const slideText = computed(() => {
  const title = props.slide.part_label || props.slide.title || '';
  const content = stripImages(props.slide.content || '');
  return `${title}\n\n${content}`.trim();
});

function handleAnswerSubmitted(answer: UserAnswer) {
  emit('answer-submitted', answer);
}

const displayedTitle = ref('');
const displayedText = ref('');
const isTyping = ref(false);
const processedHtml = ref('');
let intervalId: number | null = null;

function stripImages(raw: string) {
  return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image]');
}

function convertImages(raw: string) {
  return raw.replace(
    /&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g,
    `<img src="https://picsum.photos/id/1/200/300" alt="Slide image" class="my-2 max-w-full rounded-md"/>`
  );
}

function typeSlideSimultaneous(title: string, content: string) {
  displayedTitle.value = '';
  displayedText.value = '';
  isTyping.value = true;

  // Split title and content into char arrays
  const titleChars = title.split('');
  const contentChars = content.split('');
  const maxLength = Math.max(titleChars.length, contentChars.length);
  let i = 0;

  intervalId = window.setInterval(() => {
    if (i < titleChars.length) {
      displayedTitle.value += titleChars[i];
    }
    if (i < contentChars.length) {
      displayedText.value += contentChars[i];
    }
    i++;

    if (i >= maxLength && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      isTyping.value = false;
      processedHtml.value = convertImages(props.slide.content || '');
      emit('finish');
    }
  }, 5);
}

watch(
  () => props.startPlayback,
  (start) => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (start) {
      const titleText = (props.slide.part_label || props.slide.title || '').toString();
      const contentText = stripImages(props.slide.content || '').toString();
      typeSlideSimultaneous(titleText, contentText);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>
