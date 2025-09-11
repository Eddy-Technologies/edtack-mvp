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

      <div class="flex-1" />
    </div>

    <!-- Split Screen Mode -->
    <SlideContainer
      v-if="viewMode === 'split' && selectedSlides.length > 0"
      :slides="selectedSlides"
      :initial-slide-index="0"
      :show-thumbnails="true"
      :task="task"
      @slide-changed="handleSlideChanged"
      @close-split-view="handleCloseSplitView"
    >
      <template #conversation>
        <div class="py-6 px-8 space-y-8">
          <div
            v-for="(unit, index) in flattenedPlaybackUnits"
            :key="index"
            :ref="(el) => setMessageRef(el, unit.props.messageId)"
            :data-message-id="unit.props.messageId"
          >
            <component
              :is="unit.component"
              v-bind="unit.props"
              :start-playback="currentPlaybackIndex === index"
              @finish="handleFinish"
              @open-split-view="(slides) => handleOpenSplitView(slides, unit.props.messageId)"
              @slide-changed="handleSlideChanged"
            />
          </div>

          <!-- Loading indicator when waiting for WebSocket response -->
          <LoadingIndicator
            v-if="wsChat?.isWaitingForResponse || isWaitingForResponse"
            :character="character"
            :is-loading="true"
          />

          <div ref="bottomAnchor" />
        </div>
      </template>
    </SlideContainer>

    <!-- Stream Mode (Original) -->
    <div v-if="viewMode === 'stream'" ref="scrollArea" class="flex-1 overflow-y-auto py-6 px-24 space-y-8">
      <div
        v-for="(unit, index) in flattenedPlaybackUnits"
        :key="index"
        :ref="(el) => setMessageRef(el, unit.props.messageId)"
        :data-message-id="unit.props.messageId"
      >
        <component
          :is="unit.component"
          v-bind="unit.props"
          :start-playback="currentPlaybackIndex === index"
          @finish="handleFinish"
          @open-split-view="(slides) => handleOpenSplitView(slides, unit.props.messageId)"
          @slide-changed="handleSlideChanged"
        />
      </div>

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
import SlidesPlaceholderCard from '@/components/playback/SlidesPlaceholderCard.vue';
import LoadingIndicator from '@/components/chat/LoadingIndicator.vue';
import SlideContainer from '@/components/chat/SlideContainer.vue';
import { useWebSocketChat } from '~/composables/useWebSocketChat';
import { useMeStore } from '~/stores/me';
import { useThreads } from '~/composables/useThreads';
import { useTask } from '~/composables/useTask';
import mockQuizData from '~/mockQuizData';

// Props interface - simplified
interface ChatContentProps {
  threadId: string;
  character: any;
  threadData: any;
  task: any; // TODO: define proper task interface
}

// Component props
const props = defineProps<ChatContentProps>();

// Use global thread state instead of local state
const { messageHistory, addMessage, getPendingMessage, clearPendingMessage } = useThreads();
const messageStream = ref<any[]>([]);

const { updateTaskGeneratedContent } = useTask();

const bottomAnchor = ref<HTMLElement | null>(null);

// Use computed conversation summary instead of static ref
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);
const tokenCount = ref(0);

// Split view state
const viewMode = ref<'stream' | 'split'>('stream');
const currentSlideIndex = ref(0);
const selectedSlides = ref<any[]>([]);

// Message refs for scrolling
const messageRefs = ref<Record<string, HTMLElement>>({});

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

  // Insert messageHistory to messageStream
  messageStream.value = messageHistory.value.map(({ content, id, sender }) => {
    if (!sender) {
      return { ...JSON.parse(content), isUser: false, id };
    }
    return { text: content, isUser: true, id };
  });

  console.log('Using thread ID:', props.threadId);

  // Track the current thread ID to prevent unnecessary re-initialization
  currentThreadId.value = props.threadId;

  if (useWebSocket.value && props.threadId) {
    console.log('🚀 Initializing WebSocket chat with thread ID:', props.threadId);
    wsChat.value = useWebSocketChat(props.threadId);

    // Connect and wait for connection
    wsChat.value?.connect();

    try {
      await wsChat.value?.waitForConnection();
      console.log('🔌 WebSocket connected successfully');

      // Check for task generation or pending message
      const pendingMessage = getPendingMessage();

      if (props.task) {
        console.log('Found task data, starting task init:', props.task);
        initTask();
      } else if (pendingMessage) {
        // Regular pending message
        console.log('Found pending message, sending:', pendingMessage);
        clearPendingMessage();

        // Send immediately since we're already connected
        nextTick(() => {
          handleSend(pendingMessage);
        });
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Handle connection failure gracefully
    }
  }
};

onMounted(() => {
  // Single watcher for WebSocket responses
  watch(
    () => wsChat.value?.response,
    (newMessages) => {
      if (newMessages && newMessages?.length > 0) {
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

  // Watch for new slides being added to messageStream
  watch(
    () => messageStream.value,
    (newMessages, oldMessages) => {
      // Check if new messages were added
      if (newMessages?.length > (oldMessages?.length || 0)) {
        // Check the latest message for slides
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage?.slides && Array.isArray(latestMessage.slides) && latestMessage.slides.length > 0) {
          console.log('Auto-opening split view for new slides:', latestMessage.slides);
          // Auto-open split view with the new slides
          selectedSlides.value = latestMessage.slides;
          viewMode.value = 'split';

          // Scroll to the message with slides (will be implemented)
          nextTick(() => {
            // For now, find the message index and scroll to it
            scrollToMessage(latestMessage.id);
          });
        }
      }
    },
    { deep: true }
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
    level: meStore.level_type,
    country: meStore.country_code,
    character_slug: character?.slug,
    personality_prompt: character?.personality_prompt
  };

  let success: boolean;
  if (isFirstMessage.value) {
    success = wsChat.value.startChat(text, userInfo);
    isFirstMessage.value = false;
  } else {
    success = wsChat.value.sendUserResponse(text, userInfo);
  }

  if (success) {
    isWaitingForResponse.value = true;
  }

  return success;
};

const initTask = () => { // For task threads, ensure init_prompt is the first message
  if (props.task?.init_prompt) {
    const initPromptMessage = {
      type: 'text',
      text: `Task: ${
        typeof props.task.init_prompt === 'object' && props.task.init_prompt !== null && 'prompt' in props.task.init_prompt ?
            (props.task.init_prompt as any).prompt :
            JSON.stringify(props.task.init_prompt)
      }`,
      isUser: true,
      id: props.task.id,
    };

    // Add init_prompt as the first message
    messageStream.value = [initPromptMessage, ...messageStream.value];

    // If task has generated_content, add it as the second message
    if (props.task.generated_content) {
      const generatedContentMessage = {
        ...props.task.generated_content,
        isUser: false,
        id: `generated-content-${props.task.id}`,
        isTaskGenerated: true
      };
      // Insert generated content after init prompt but before other messages
      const otherMessages = messageStream.value.slice(1); // Remove the init prompt we just added
      messageStream.value = [initPromptMessage, generatedContentMessage, ...otherMessages];
    }
  }

  clearPendingMessage();

  nextTick(() => {
    if (props.task && props.task.init_prompt && !props.task.generated_content) {
      startTaskGeneration();
    }
  });
};

// Start task generation via WebSocket
const startTaskGeneration = async () => {
  console.log('Starting task generation via WebSocket for task:', props.task);
  if (!wsChat.value?.isConnected || !props.task?.init_prompt) {
    console.warn('Cannot start task generation: WebSocket not connected or no task data');
    return false;
  }
  const character = props.character;
  const subjectForBackend = character?.subject?.toLowerCase() || 'general';

  const userInfo = {
    subject: subjectForBackend,
    level: meStore.level_type,
    country: meStore.country_code,
    character_slug: character?.slug,
    personality_prompt: character?.personality_prompt
  };

  const prompt = (props.task.init_prompt as any).prompt;
  const success = wsChat.value.startTaskGeneration(prompt, userInfo);

  if (success) {
    isFirstMessage.value = false;
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

    // Add to global state and local stream
    const newUuid = crypto.randomUUID();
    addMessage(message, 'json', false, newUuid);
    messageStream.value.push({ ...message, id: newUuid });

    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;

    // If this is a response to task generation, update the task's generated_content
    if (props.task && !props.task.generated_content && message.slides.length > 0) {
      updateTaskGeneratedContent(props.task.id, message);

      // Mark the message as task-generated for proper ordering
      messageStream.value[messageStream.value.length - 1].isTaskGenerated = true;
    }

    // The watcher will automatically handle slides and scrolling
    // For messages without slides, scroll to bottom
    if (!message.slides || !Array.isArray(message.slides) || message.slides.length === 0) {
      nextTick(() => {
        bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
      });
    }
    return;
  }

  if (['timeout', 'cancelled', 'error'].includes(message.status)) {
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
};

// Flatten the entire messageStream into an ordered array of playback units
const flattenedPlaybackUnits = computed(() => {
  console.log('Flattening message stream into playback units:', messageStream.value);
  const units: any[] = [];
  messageStream.value.forEach((block, blockIndex) => {
    // Add text messages
    if (block.text) {
      units.push({
        component: TextBubble,
        props: {
          text: block.text,
          isFirst: blockIndex === 0,
          isUser: block.isUser,
          messageId: block.id?.toString(),
        },
      });
    }

    // Add message text (but only if no slides, to avoid duplication)
    if (block.message && !Array.isArray(block.slides)) {
      units.push({
        component: TextBubble,
        props: {
          text: block.message,
          isFirst: blockIndex === 0,
          isUser: block.isUser,
          messageId: block.id?.toString(),
        },
      });
    }

    // Add slides as a single placeholder card in stream view
    if (Array.isArray(block.slides) && block.slides.length > 0) {
      // First add the message if it exists
      if (block.message) {
        units.push({
          component: TextBubble,
          props: {
            text: block.message,
            isFirst: blockIndex === 0,
            isUser: block.isUser,
            messageId: block.id?.toString(),
          },
        });
      }

      // Then add the slides placeholder card
      units.push({
        component: SlidesPlaceholderCard,
        props: {
          slides: block.slides,
          slidesTitle: `${block.slides.length} Learning Slides`,
          showThumbnails: true,
          startPlayback: false,
          messageId: block.id?.toString(),
        },
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
    addMessage(JSON.stringify(mockQuizData), 'json', false);
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
    console.log('Mock playback data loaded:', mockPlaybackData);
    messageStream.value = mockPlaybackData;

    console.log('MessageStream after setting:', messageStream.value);

    isPlayingAllowed.value = true;

    // The watcher will automatically detect slides and open split view
    // No need to manually trigger split view here
    return;
  }

  isPlayingAllowed.value = false;
  await nextTick();
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

  // Add user message to UI immediately and global state
  const userMessage = {
    type: 'text',
    isUser: true,
    content: text,
    id: crypto.randomUUID()
  };

  addMessage(userMessage.content, userMessage.type, userMessage.isUser, userMessage.id);
  messageStream.value.push({ type: 'text', text: userMessage.content, isUser: true, id: userMessage.id });

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

const handleSlideChanged = (index: number) => {
  currentSlideIndex.value = index;
};

const handleOpenSplitView = (slides: any[], messageId?: string) => {
  // Store the selected slides and switch to split view
  selectedSlides.value = slides;
  viewMode.value = 'split';
  nextTick(() => {
    if (typeof messageId === 'string') {
      // Scroll to the specific message that contains the slides
      scrollToMessage(messageId);
    } else {
      // Fallback to bottom scroll if no index provided
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    }
  });
};

const handleCloseSplitView = () => {
  // Close split view and return to stream view
  viewMode.value = 'stream';
  selectedSlides.value = [];
  nextTick(() => {
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

// Helper function to set message refs
const setMessageRef = (el: HTMLElement | null, messageId: string) => {
  if (el) {
    messageRefs.value[messageId] = el;
  } else {
    // Use Reflect.deleteProperty to avoid ESLint error
    Reflect.deleteProperty(messageRefs.value, messageId);
  }
};

// Helper function to scroll to a specific message
const scrollToMessage = (messageId: string) => {
  const element = messageRefs.value[messageId];

  if (element) {
    console.log('Scrolling to message at index:', messageId);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } else {
    console.warn('Message element not found for index:', messageId);
    // Fallback to bottom scroll
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  }
};

// Clear chat method to reset all chat state
const clearChat = () => {
  messageStream.value = [];
  currentPlaybackIndex.value = 0;
  currentSlideIndex.value = 0;
  isPlayingAllowed.value = false;
  isWaitingForResponse.value = false;
  messageQueue.value = [];
  selectedSlides.value = [];
  messageRefs.value = {};
  // Reset to stream view (default)
  viewMode.value = 'stream';
  if (import.meta.client) {
    localStorage.removeItem('chatViewMode');
  }

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

onUnmounted(() => {
  if (wsChat.value) {
    wsChat.value.disconnect();
  }
  clearChat();
});
</script>
