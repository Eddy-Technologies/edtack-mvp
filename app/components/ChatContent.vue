<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Token Count Display and Connection Status -->
    <div
      class="bg-gray-100 text-gray-700 text-sm p-2 text-center border-b border-gray-300 flex justify-between items-center px-4"
    >
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
            {{
              wsChat.isConnected
                ? 'Connected'
                : wsChat.isConnecting
                  ? 'Connecting...'
                  : 'Disconnected'
            }}
          </span>
        </span>
      </div>
      <!-- <div>
        Token Usage: <span class="font-bold">{{ tokenCount }}</span>
      </div> -->
      <div class="w-20" />
    </div>

    <div ref="scrollArea" class="flex-1 overflow-y-auto py-6 px-24 space-y-8">
      <component
        :is="unit.component"
        v-for="(unit, index) in flattenedPlaybackUnits"
        :key="index"
        v-bind="unit.props"
        :start-playback="currentPlaybackIndex === index"
        @finish="handleFinish"
      />

      <!-- Loading indicator when waiting for WebSocket response -->
      <LoadingIndicator
        v-if="wsChat?.isWaitingForResponse || isWaitingForResponse"
        :character="character"
        :is-loading="true"
      />

      <div ref="bottomAnchor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import LoadingIndicator from '@/components/chat/LoadingIndicator.vue';
import { useWebSocketChat } from '~/composables/useWebSocketChat';
import { useMeStore } from '~/stores/me';
import { useChatStore } from '~/stores/chat';
import { useCharacters } from '~/composables/useCharacters';
import mockQuizData from '~/mockQuizData';

// Props interface - simplified
interface ChatContentProps {
  threadId: string;
  character: any;
  messages: any;
}

// Component props
const props = defineProps<ChatContentProps>();

const messageStream = ref<any[]>(props.messages);

const bottomAnchor = ref<HTMLElement | null>(null);

// Use computed conversation summary instead of static ref
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);
const tokenCount = ref(0);

// WebSocket integration
const useWebSocket = ref(true); // WebSocket-only mode
const wsChat = ref<ReturnType<typeof useWebSocketChat> | null>(null);
const isFirstMessage = ref(true);
const isWaitingForResponse = ref(false);
const currentThreadId = ref<string>(''); // Track initialized thread to prevent re-init
const messageQueue = ref<string[]>([]); // Queue for messages waiting to be sent

if (import.meta.client) {
  tokenCount.value = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
}

// const { getLessonBundle } = useLesson();
const meStore = useMeStore();
const chatStore = useChatStore();
const { getPendingMessage, clearPendingMessage } = useCharacters();

// Dynamic conversation summary based on character prop
const conversationSummaryComputed = computed(() => {
  if (props.character?.personality_prompt) {
    return props.character.personality_prompt;
  }
  return 'Eddy is a lion character that talks and is highly intelligent, he educates with passion.';
});

// Initialize chat - simplified approach
const initializeChat = async () => {
  console.log('Initializing chat with props:', {
    threadId: props.threadId,
    character: props.character?.name,
  });

  // Skip if 'new' thread ID (invalid)
  if (!props.threadId || props.threadId === 'new') {
    console.log('Skipping initialization - invalid thread ID');
    return;
  }

  const userId = meStore.user_info_id || meStore.id;

  // If we already have this thread initialized and connected, skip re-initialization
  if (currentThreadId.value === props.threadId && wsChat.value?.isConnected) {
    console.log('Chat already initialized for this thread:', props.threadId);
    return;
  }

  if (!meStore.isInitialized) {
    console.log('Store not initialized yet, retrying...');
    setTimeout(initializeChat, 500);
    return;
  }

  if (!userId) {
    console.warn('No user ID available - user may not be logged in');
    setTimeout(initializeChat, 2000);
    return;
  }

  if (!props.character) {
    console.warn('No character provided as prop');
    return;
  }

  // Always treat as new chat since we have no history
  isFirstMessage.value = true;

  console.log('Using thread ID:', props.threadId);

  // Track the current thread ID to prevent unnecessary re-initialization
  currentThreadId.value = props.threadId;

  if (useWebSocket.value && props.threadId) {
    console.log('🚀 Initializing WebSocket chat with thread ID:', props.threadId);
    wsChat.value = useWebSocketChat(props.threadId);

    // Always connect immediately
    wsChat.value?.connect();
    console.log('🔌 Connected WebSocket');

    // Check for pending message and send it
    const pendingMessage = getPendingMessage();
    if (pendingMessage) {
      console.log('Found pending message, sending:', pendingMessage);
      clearPendingMessage();

      // Wait for connection then send
      nextTick(() => {
        handleSend(pendingMessage);
      });
    }
  }
};

onMounted(() => {
  // Single watcher for WebSocket responses
  watch(
    () => wsChat.value?.response,
    (newMessages) => {
      if (newMessages?.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        handleWebSocketMessage(lastMessage);
      }
    },
    { deep: true }
  );

  // Single watcher for connection state - process queue when connected
  watch(
    () => wsChat.value?.isConnected,
    (connected) => {
      if (connected) {
        processMessageQueue();
      }
    }
  );

  // Initialize when all prerequisites are met
  watch(
    () => ({
      loggedIn: meStore.isLoggedIn,
      initialized: meStore.isInitialized,
      threadId: props.threadId,
      character: props.character,
    }),
    (state) => {
      if (state.loggedIn && state.initialized && state.threadId && state.character) {
        initializeChat();
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  if (wsChat.value) {
    wsChat.value.disconnect();
  }
});

// Send message directly to WebSocket
const sendMessage = async (text: string) => {
  if (!wsChat.value?.isConnected || !text.trim()) {
    console.warn('Cannot send message: WebSocket not connected or empty text');
    return false;
  }

  const character = props.character;
  const subjectForBackend = character?.subject?.toLowerCase() || 'general';

  const userInfo = {
    subject: subjectForBackend,
    level: meStore.level_type || 'PRIMARY_1',
    country: meStore.country_code || 'SG',
    character_slug: character?.slug,
    personality_prompt: character?.personality_prompt || conversationSummaryComputed.value,
  };

  let success: boolean;
  if (isFirstMessage.value) {
    success = wsChat.value.startChat(text, userInfo);
    isFirstMessage.value = false;
  } else {
    success = wsChat.value.sendUserResponse(text, userInfo);
  }

  const response = await fetch('/api/chat/message', {
    // New API endpoint
    method: 'POST', // Explicitly POST
    headers: {
      'Content-Type': 'application/json', // Set content type
    },
    body: JSON.stringify({
      thread_id: chatStore.thread_id,
      content: text || '',
      user_id: meStore.user_info_id || null,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Fetch failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  if (success) {
    isWaitingForResponse.value = true;
  }

  return success;
};

// Process queued messages when WebSocket connects
const processMessageQueue = () => {
  if (wsChat.value?.isConnected && messageQueue.value.length > 0) {
    console.log('Processing queued messages:', messageQueue.value.length);
    const messages = [...messageQueue.value];
    messageQueue.value = [];

    messages.forEach((message) => {
      nextTick(() => {
        sendMessage(message);
      });
    });
  }
};

// Handle incoming WebSocket messages
const handleWebSocketMessage = (message: any) => {
  // Display any message with message.message field unconditionally
  if (message.status === 'user_message') {
    console.log('Received user_message message:', message);

    messageStream.value.push(message);

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

  if (
    message.status === 'timeout' ||
    message.status === 'cancelled' ||
    message.status === 'error'
  ) {
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = {
        type: 'text',
        text: `[Timeout: ${message.error || 'Request error. Please try again.'}]`,
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
  console.log('Flattening message stream into playback units:', messageStream.value);
  const units: any[] = [];
  messageStream.value.forEach((block, blockIndex) => {
    if (block.text) {
      units.push({
        component: TextBubble,
        props: {
          text: block.text,
          isFirst: blockIndex === 0,
          isUser: block.isUser,
        },
      });
    }
    if (block.message) {
      units.push({
        component: TextBubble,
        props: {
          text: block.message,
          isFirst: blockIndex === 0,
          isUser: block.isUser,
        },
      });
    }
    if (Array.isArray(block.slides)) {
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

  // Development: Inject mock quiz data when "mock_data" is typed
  if (text.trim() === 'mock_data') {
    console.log('Injecting mock quiz data...');
    messageStream.value.push(mockQuizData);
    isPlayingAllowed.value = true;
    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  // Development: Inject mock playback data when "mock_playback" is typed
  if (text.trim() === 'mock_playback') {
    console.log('Injecting mock playback data...');
    const { default: mockPlaybackData } = await import('~/mockPlaybackData');
    messageStream.value = mockPlaybackData;
    isPlayingAllowed.value = true;
    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  isPlayingAllowed.value = false;
  await nextTick();
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

  // Add user message to UI immediately
  messageStream.value.push({
    type: 'text',
    text,
    isUser: true,
    playable: false,
  });

  // Since we connect immediately in initializeChat, just try to send
  if (wsChat.value?.isConnected) {
    const success = sendMessage(text);
    if (!success) {
      // Handle send failure
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        type: 'text',
        text: '[Failed to send message - WebSocket error]',
        isUser: false,
        playable: false,
      };
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    }
  } else {
    // Queue the message for later sending (fallback)
    console.log('WebSocket not connected, queuing message:', text);
    messageQueue.value.push(text);
  }
};

// Clear chat method to reset all chat state
const clearChat = () => {
  messageStream.value = [];
  currentPlaybackIndex.value = 0;
  isPlayingAllowed.value = false;
  isWaitingForResponse.value = false;
  messageQueue.value = [];

  // Disconnect current WebSocket
  if (wsChat.value) {
    wsChat.value.disconnect();
    wsChat.value = null;
  }

  // Reset flags
  isFirstMessage.value = true;
  currentThreadId.value = '';
};

// Expose methods to parent component
defineExpose({
  handleSend,
  clearChat,
});
</script>
