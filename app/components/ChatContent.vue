<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <div ref="scrollArea" class="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
      <div class="whitespace-pre-wrap flex-shrink min-w-0 text-center">Talk to Eddy...</div>

      <component
        :is="unit.component"
        v-for="(unit, index) in flattenedPlaybackUnits"
        :key="index"
        v-bind="unit.props"
        :start-playback="currentPlaybackIndex === index"
        @finish="handleFinish"
      />

      <div ref="bottomAnchor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import QuestionBubble from '@/components/playback/QuestionBubble.vue';
import { useChat } from '~/composables/useChat';
import { useSpeech } from '~/composables/useSpeech';
import { useLesson } from '~/composables/useLesson';

const messageStream = ref<any[]>([]);

const bottomAnchor = ref<HTMLElement | null>(null);

const conversationSummary = ref(
  'Eddy is a lion character that talks and is highly intelligent, he educates with passion.'
);
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);

const { speakLastAssistantMessage, onSpeechEnd } = useSpeech();
const { getLessonBundle } = useLesson();

// Flatten the entire messageStream into an ordered array of playback units
const flattenedPlaybackUnits = computed(() => {
  const units: any[] = [];
  messageStream.value.forEach((block, blockIndex) => {
    if (block.type === 'text' && block.text) {
      units.push({
        component: TextBubble,
        props: {
          text: block.text,
          isFirst: blockIndex === 0,
        },
      });
    }
    if (block.type === 'slides' && Array.isArray(block.slides)) {
      block.slides.forEach((slide) => {
        units.push({
          component: SlideBubble,
          props: {
            slide,
            isUser: false,
            startPlayback: false, // controlled globally by parent
          },
        });
      });
    }
    if (block.type === 'questions' && Array.isArray(block.questions)) {
      block.questions.forEach((question) => {
        units.push({
          component: QuestionBubble,
          props: {
            text: question,
            isFirst: false,
          },
        });
      });
    }
  });
  return units;
});

// When one bubble finishes, move to the next
function handleFinish() {
  currentPlaybackIndex.value++;
  nextTick(() => {
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  });
}

// Handle user sending a message or lesson request
const handleSend = async (text: string) => {
  if (!text.trim()) return;

  if (text.includes('lesson')) {
    constructLesson(text);
  } else {
    isPlayingAllowed.value = false;
    await nextTick();
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

    // Add user message
    messageStream.value.push({
      type: 'text',
      text,
      isUser: true,
      playable: false,
    });

    // Add placeholder for assistant
    messageStream.value.push({
      type: 'text',
      text: '',
      isUser: false,
      playable: false,
    });

    // Prepare recent context
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

// Clear chat method to reset all chat state
const clearChat = () => {
  messageStream.value = [];
  conversationSummary.value = 'Eddy is a lion character that talks and is highly intelligent, he educates with passion.';
  currentPlaybackIndex.value = 0;
  isPlayingAllowed.value = false;
};

// Expose methods to parent component
defineExpose({
  handleSend,
  clearChat,
});
</script>
