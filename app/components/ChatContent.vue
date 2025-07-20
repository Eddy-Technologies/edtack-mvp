<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <!-- Scrollable Message Area -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto p-6 space-y-4">
      <!-- Playback Messages -->
      <ChatMessage
        v-for="(block, index) in messageStream"
        :key="index"
        :block="block"
        :index="index"
      />
      <div ref="bottomAnchor" />
    </div>
  </div>

  <!-- Sticky Controls & Chat Input -->
  <div class="sticky bottom-0 bg-white p-10 z-10 flex flex-col items-center gap-4">
    <div class="flex gap-4">
      <button
        :disabled="isLoadingTTS || !isPlayingAllowed || (!isSpeaking && !hasAssistantMessages)"
        class="px-4 py-2 text-white rounded-lg disabled:opacity-50"
        :class="{
          'bg-blue-500 hover:bg-blue-600': !isSpeaking && !isLoadingTTS,
          'bg-yellow-500 hover:bg-yellow-600': isSpeaking,
          'bg-gray-400': isLoadingTTS,
        }"
        @click="togglePlayback"
      >
        <span v-if="isLoadingTTS">Loading Audio...</span>
        <span v-else-if="isSpeaking">Pause Speech</span>
        <span v-else>Play Last Response</span>
      </button>

      <button
        :disabled="!isSpeaking && !isLoadingTTS"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        @click="stopAudio"
      >
        Stop Speech
      </button>
    </div>

    <ChatInput @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import ChatInput from './ChatInput.vue';
import ChatMessage from './ChatMessage.vue';
import { useChat } from '~/composables/useChat.ts';
import { useSpeech } from '~/composables/useSpeech.ts';
import { useLesson } from '~/composables/useLesson.ts';

const messageStream = ref<any[]>([
  { type: 'text', text: 'Talk to Snorlax...', isUser: false, playable: false },
]);

const bottomAnchor = ref<HTMLElement | null>(null);

const conversationSummary = ref('Snorlax is a sleepy Pokémon who loves naps.');
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);

const {
  isSpeaking,
  isLoadingTTS,
  speakLastAssistantMessage,
  stopSpeaking,
  toggleAudioPlayer,
  onSpeechEnd,
} = useSpeech();

const { getLessonBundle } = useLesson();

const hasAssistantMessages = computed(() =>
  messageStream.value.some((m) => !m.isUser && m.type === 'text' && m.text.trim().length > 0)
);

const handleSend = async (text: string) => {
  if (!text.trim()) return;

  if (text.includes('lesson')) {
    await constructLesson(text);
  } else {
    stopSpeaking();
    isPlayingAllowed.value = false;
    await nextTick();
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    // 1. Add user message
    messageStream.value.push({
      type: 'text',
      text,
      isUser: true,
      playable: false,
    });

    // 2. Add placeholder for assistant response
    messageStream.value.push({
      type: 'text',
      text: '',
      isUser: false,
      playable: false,
    });

    // Prepare messages for API — only take last 6 from stream filtered as text blocks
    const recentMessages = messageStream.value
      .filter((m) => m.type === 'text')
      .slice(-MAX_CONTEXT_MESSAGES)
      .map((m) => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text,
      }));

    const messagesForApi = [
      {
        role: 'system',
        content: `You are a helpful assistant. Remember this context summary:\n${conversationSummary.value}`,
      },
      ...recentMessages,
    ];

    try {
      const { message, updatedSummary } = await useChat('/api/chat', {
        messages: messagesForApi,
        currentSummary: conversationSummary.value,
      });

      // Replace placeholder with real assistant message
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        type: 'text',
        text: message,
        isUser: false,
        playable: true,
      };

      if (updatedSummary) conversationSummary.value = updatedSummary;

      await speakLastAssistantMessage(messageStream.value);

      await new Promise<void>((resolve) => {
        onSpeechEnd(() => {
          isPlayingAllowed.value = true;
          resolve();
        });
      });
    } catch (err) {
      // On error, replace placeholder with error text
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        type: 'text',
        text: '[Error getting response]',
        isUser: false,
        playable: false,
      };
      isPlayingAllowed.value = true;
      console.error('Chat API error:', err);
    }
  }
};

const constructLesson = (text: string) => {
  stopSpeaking();
  isPlayingAllowed.value = false;

  const lesson = getLessonBundle(text);
  if (!lesson) {
    messageStream.value.push({
      type: 'text',
      text: `Sorry, I couldn't find a lesson related to that topic.`,
      isUser: false,
      playable: false,
    });
    return;
  }

  // Build lesson stream: intro text, slides block, questions block
  const stream: any[] = [];

  stream.push({
    type: 'text',
    text: `📘 ${lesson.parent.title}\n\n${cleanContent(lesson.parent.content)}`,
    isUser: false,
    playable: true,
  });

  if (lesson.slides?.length) {
    stream.push({
      type: 'slides',
      slides: lesson.slides,
    });
  }

  if (lesson.questions?.length) {
    stream.push({
      type: 'questions',
      questions: lesson.questions.map((q: any) => formatLessonPart(q, lesson.questions)),
    });
  }

  // Replace messageStream with the lesson content
  messageStream.value = [...messageStream.value, ...stream];

  nextTick(() => {
    isPlayingAllowed.value = true;
  });
};

function cleanContent(raw: string): string {
  return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image: $1]');
}

function formatLessonPart(item: any, allItems: any[]): string {
  let output = '';
  const label = item.part_label || item.title || '';

  output += `${label}\n\n${cleanContent(item.content)}\n`;

  if (item.type === 'question') {
    const qType = item.question_type;

    if (qType === 'mcq' && item.options?.length) {
      output += '\n**Options:**\n';
      item.options.forEach((opt: any, index: number) => {
        if (opt.option_text) {
          output += `- ${String.fromCharCode(65 + index)}. ${opt.option_text}\n`;
        } else if (opt.imageUrl) {
          output += `- ${String.fromCharCode(65 + index)}. [Image Option: ${opt.imageUrl}]\n`;
        }
      });
    }

    if (qType === 'boolean') {
      output += `\n*(This is a True/False question)*`;
    }

    if (qType === 'open') {
      const ans = item.answer?.[0]?.answer_text || '(Student provides open-ended answer)';
      output += `\n**Expected Answer (open-ended):**\n${ans}`;
    }

    if (qType === 'fill') {
      const answers = item.answer || [];
      output += `\nExpected Answers (fill in the blanks):\n`;
      answers.forEach((ans: any, idx: number) => {
        output += `- Blank ${idx + 1}: ${ans.answer_text || '(No answer provided)'}\n`;
      });
    }

    if (qType === 'draw') {
      const ans = item.answer?.[0]?.answer_draw_file;
      if (ans) output += `\n**Expected Drawing: [Drawing Image](${ans})\n`;
      else output += `\n*(Draw response expected)*`;
    }
  }

  if (item.explanation) {
    output += `\n**Explanation:**\n${cleanContent(item.explanation)}`;
  }

  return output;
}

const togglePlayback = () => {
  if (!isPlayingAllowed.value) return;
  toggleAudioPlayer();
};

const stopAudio = () => {
  stopSpeaking();
  isPlayingAllowed.value = true;
};

onUnmounted(() => {
  stopSpeaking();
});
</script>
