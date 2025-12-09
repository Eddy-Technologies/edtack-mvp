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
      <MDCRenderer
        v-else-if="markdownBody"
        :body="markdownBody"
        tag="div"
        class="prose prose-md max-w-none"
      />
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
import { ref, watch, onBeforeUnmount, computed, watchEffect } from 'vue';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import MessageActions from '../chat/MessageActions.vue';
import QuizQuestion from './QuizQuestion.vue';
import type { UserAnswer } from '~/types/quiz.types';
import { convertHighlights, convertImages, stripImages } from '~/utils/markdownUtils';

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
const markdownBody = ref();
let intervalId: number | null = null;

// Parse markdown for slide content
watchEffect(async () => {
  if (processedHtml.value) {
    try {
      const parsed = await parseMarkdown(processedHtml.value);
      markdownBody.value = parsed?.body;
    } catch (e) {
      markdownBody.value = null;
    }
  } else {
    markdownBody.value = null;
  }
});

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
      processedHtml.value = convertHighlights(convertImages(props.slide.content || '', 'Slide image'));
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
