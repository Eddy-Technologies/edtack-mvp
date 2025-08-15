<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <!-- Token Count Display and Connection Status -->
    <div class="bg-gray-100 text-gray-700 text-sm p-2 text-center border-b border-gray-300 flex justify-between items-center px-4">
      <div class="flex items-center gap-2">
        <span v-if="useWebSocket && wsChat" class="flex items-center gap-1">
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': wsChat.isConnected,
              'bg-yellow-500': wsChat.isConnecting,
              'bg-red-500': !wsChat.isConnected && !wsChat.isConnecting && wsChat.error,
              'bg-gray-400': !wsChat.isConnected && !wsChat.isConnecting && !wsChat.error,
            }"
          />
          <span class="text-xs">
            {{ wsChat.isConnected ? 'Connected' : wsChat.isConnecting ? 'Connecting...' : 'Disconnected' }}
          </span>
        </span>
      </div>
      <div>
        Token Usage: <span class="font-bold">{{ tokenCount }}</span>
      </div>
      <div class="w-20" />
    </div>

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

      <!-- Loading indicator when waiting for WebSocket response -->
      <div v-if="wsChat?.isWaitingForResponse || isWaitingForResponse" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <!-- Animated dots -->
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>

        <!-- Backend status message -->
        <span class="text-gray-600 text-sm">
          {{ wsChat?.response[wsChat.response.length - 1]?.status || 'Processing...' }}
        </span>
      </div>

      <div ref="bottomAnchor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import QuestionBubble from '@/components/playback/QuestionBubble.vue';
import { useWebSocketChat, GenerationIntentType } from '~/composables/useWebSocketChat';
import { useLesson } from '~/composables/useLesson';
import { useMeStore } from '~/stores/me';

const messageStream = ref<any[]>([]);

const bottomAnchor = ref<HTMLElement | null>(null);

const conversationSummary = ref(
  'Eddy is a lion character that talks and is highly intelligent, he educates with passion.'
);
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);
const tokenCount = ref(0);

// WebSocket integration
const route = useRoute();
const useWebSocket = ref(true); // WebSocket-only mode
const threadId = ref<string>('');
const wsChat = ref<ReturnType<typeof useWebSocketChat> | null>(null);
const isFirstMessage = ref(true);
const isWaitingForResponse = ref(false);

if (import.meta.client) {
  tokenCount.value = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
}

const { getLessonBundle } = useLesson();
const meStore = useMeStore();

// Avatar to subject mapping
const AVATAR_SUBJECTS: Record<string, string> = {
  1: 'general', // Eddy
  2: 'biology', // Winne the Pooh
  3: 'general', // Future
  4: 'history', // Mickey
  5: 'chemistry', // Maya
  6: 'social_studies', // Sherlock
  eddy: 'general',
  biology: 'biology',
  chemistry: 'chemistry',
  history: 'history',
  social: 'social_studies',
  sherlock: 'social_studies',
  mickey: 'history',
  maya: 'chemistry',
  pooh: 'biology',
  winne: 'biology',
};

// Initialize WebSocket connection
onMounted(() => {
  console.log('chat content mounted');
  // Wait for user data to be available

  console.log('chat content mounted and initilaised chat');
  const avatarId = route.params.avatarId as string;
  const userId = meStore.user_info_id || meStore.id;

  console.log('Avatar ID from route:', avatarId); // Debug log
  console.log('User ID from store:', userId); // Debug log
  console.log('Store initialized:', meStore.isInitialized); // Debug log
  console.log('Store logged in:', meStore.isLoggedIn); // Debug log

  if (!meStore.isInitialized) {
    console.log('Store not initialized yet, retrying...');
    setTimeout(initializeChat, 500);
    return;
  }

  if (!userId) {
    console.warn('No user ID available - user may not be logged in');
    // Still retry in case login happens after component mount
    setTimeout(initializeChat, 2000);
    return;
  }

  // Get subject for thread ID
  const subject = AVATAR_SUBJECTS[avatarId?.toLowerCase()] || 'general';

  // Use userId as the primary identifier, with avatarId and subject as context
  const storageKey = `chat-thread-${userId}-${avatarId || 'default'}-${subject}`;
  const storedThread = localStorage.getItem(storageKey);

  if (storedThread) {
    threadId.value = storedThread;
    isFirstMessage.value = false;
  } else {
    threadId.value = `${userId}-${avatarId || 'default'}-${subject}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, threadId.value);
    isFirstMessage.value = true;
  }

  console.log('Generated thread ID:', threadId.value); // Debug log

  if (useWebSocket.value && threadId.value) {
    console.log('🚀 Initializing WebSocket chat with thread ID:', threadId.value);
    wsChat.value = useWebSocketChat(threadId.value);
    wsChat.value?.connect();

    // Watch for incoming WebSocket messages
    if (wsChat.value) {
      watch(() => wsChat.value!.response, (newMessages) => {
        if (newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          handleWebSocketMessage(lastMessage);
        }
      }, { deep: true });
    }

    // Also watch for changes in user login state
    watch(() => meStore.isLoggedIn, (isLoggedIn) => {
      if (isLoggedIn && !wsChat.value) {
        console.log('User logged in, initializing chat...');
        // TODO: reinitialize WebSocket if needed
      }
    });
  };
});

onUnmounted(() => {
  if (wsChat.value) {
    wsChat.value.disconnect();
  }
});

// Helper functions to handle different content types
const parseMessageContent = (message: any) => {
  console.log('Parsing WebSocket message:', message); // Debug log for new format
  
  // If message.message exists, display it unconditionally
  if (message.message) {
    // Check generation_intent_type if available
    if (message.generation_intent_type) {
      switch (message.generation_intent_type) {
        case GenerationIntentType.LESSON:
          return parseLessonContent(message.message);

        case GenerationIntentType.QUIZ:
          return parseQuizContent(message.message);

        case GenerationIntentType.STANDARD_RESPONSE:
        default:
          return {
            type: 'text',
            text: message.message,
            isUser: false,
            playable: true,
          };
      }
    } else {
      // No generation_intent_type, just display the message
      return {
        type: 'text',
        text: message.message,
        isUser: false,
        playable: true,
      };
    }
  }

  // Fallback to existing content/text format for backward compatibility
  return {
    type: 'text',
    text: message.content || message.text || '[No response]',
    isUser: false,
    playable: true,
  };
};

const parseLessonContent = (messageText: string) => {
  // For now, treat lesson content as rich text
  // TODO: Implement proper lesson parsing if messageText contains structured data
  return {
    type: 'text',
    text: `📚 Lesson: ${messageText}`,
    isUser: false,
    playable: true,
  };
};

const parseQuizContent = (messageText: string) => {
  // For now, treat quiz content as rich text
  // TODO: Implement proper quiz parsing if messageText contains structured data
  return {
    type: 'text',
    text: `📝 Quiz: ${messageText}`,
    isUser: false,
    playable: true,
  };
};

// Handle incoming WebSocket messages
const handleWebSocketMessage = (message: any) => {
  // Display any message with message.message field unconditionally
  if (message.message) {
    // Add placeholder for assistant if not exists
    if (messageStream.value.length === 0 || messageStream.value[messageStream.value.length - 1].isUser) {
      messageStream.value.push({
        type: 'text',
        text: '',
        isUser: false,
        playable: false,
      });
    }

    // Update the last assistant message
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = parseMessageContent(message);
    }

    // Update token count if provided
    if (message.tokenCount) {
      const currentTokenCount = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
      const newTokenCount = currentTokenCount + message.tokenCount;
      localStorage.setItem('tokenUsage', newTokenCount.toString());
      tokenCount.value = newTokenCount;
    }

    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;

    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  if (message.status === 'partial') {
    // Handle partial responses - update the last assistant message
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      // For partial responses, use the message or content field directly
      const partialContent = message.message || message.content || '[Partial response...]';
      messageStream.value[lastIdx] = {
        type: 'text',
        text: partialContent,
        isUser: false,
        playable: false, // Don't allow playback until complete
      };
    }

    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  if (message.status === 'timeout') {
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = {
        type: 'text',
        text: `[Timeout: ${message.error || 'Request took too long. Please try again.'}]`,
        isUser: false,
        playable: false,
      };
    }
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;
    return;
  }

  if (message.status === 'cancelled') {
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = {
        type: 'text',
        text: '[Request was cancelled]',
        isUser: false,
        playable: false,
      };
    }
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;
    return;
  }

  if (message.status === 'error') {
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = {
        type: 'text',
        text: `[Error: ${message.error || 'Connection error'}]`,
        isUser: false,
        playable: false,
      };
    }
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;
    return;
  }

  // Handle other message status types (heartbeat, status_update are handled by useWebSocketChat)
};

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
          isUser: block.isUser
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

    // Use WebSocket only
    if (useWebSocket.value && wsChat.value && wsChat.value.isConnected) {
      // Create user_info for the WebSocket message
      const avatarId = route.params.avatarId as string;
      const userInfo = {
        subject: AVATAR_SUBJECTS[avatarId?.toLowerCase()] || 'general',
        level: meStore.level_type || 'PRIMARY_1',
        country: meStore.country_code || 'SG',
      };

      console.log('Sending WebSocket message with user_info:', userInfo); // Debug log

      let success = false;
      if (isFirstMessage.value) {
        success = wsChat.value.startChat(text, userInfo);
        isFirstMessage.value = false;
      } else {
        success = wsChat.value.sendUserResponse(text, userInfo);
      }

      if (success) {
        // Start loading state when message is sent successfully
        isWaitingForResponse.value = true;
      } else {
        // Handle WebSocket send failure
        const lastIdx = messageStream.value.length - 1;
        messageStream.value[lastIdx] = {
          type: 'text',
          text: '[Failed to send message - WebSocket connection error]',
          isUser: false,
          playable: false,
        };
        isPlayingAllowed.value = true;
        isWaitingForResponse.value = false;
      }
    } else {
      // No WebSocket connection available
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        type: 'text',
        text: '[WebSocket not connected - please wait for connection]',
        isUser: false,
        playable: false,
      };
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
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
  isWaitingForResponse.value = false;

  // Reset thread ID and clear from localStorage
  if (import.meta.client) {
    const avatarId = route.params.avatarId as string;
    const userId = meStore.user_info_id || meStore.id;

    if (!userId) {
      console.warn('No user ID available for clearChat');
      return;
    }

    // Get subject for thread ID
    const subject = AVATAR_SUBJECTS[avatarId?.toLowerCase()] || 'general';
    const storageKey = `chat-thread-${userId}-${avatarId || 'default'}-${subject}`;
    localStorage.removeItem(storageKey);

    // Generate new thread ID
    threadId.value = `${userId}-${avatarId || 'default'}-${subject}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, threadId.value);
    isFirstMessage.value = true;

    // Reconnect WebSocket with new thread ID
    if (wsChat.value) {
      wsChat.value.disconnect();
      wsChat.value = useWebSocketChat(threadId.value);
      wsChat.value?.connect();
      wsChat.value?.clearMessages();
    }
  }
};

// Handle continue generation
const handleContinue = async () => {
  if (useWebSocket.value && wsChat.value && wsChat.value.isConnected.value) {
    // Add placeholder for assistant continuation
    messageStream.value.push({
      type: 'text',
      text: '',
      isUser: false,
      playable: false,
    });

    const success = wsChat.value.continueChat();

    if (!success) {
      // Remove placeholder if failed
      messageStream.value.pop();
      console.error('Failed to send continue command');
    }
  }
};

// Expose methods to parent component
defineExpose({
  handleSend,
  clearChat,
  handleContinue,
});
</script>
