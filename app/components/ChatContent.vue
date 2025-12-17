<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Messages Stream -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto pt-8 py-6 px-24 pb-32 space-y-8">
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
import { useWebSocketChat } from '~/composables/useWebSocketChat';
import { useMeStore } from '~/stores/me';
import { useThreads } from '~/composables/useThreads';

// Props interface - simplified
interface ChatContentProps {
  threadId: string;
  character: any;
  threadData: any;
}

// Component props
const props = defineProps<ChatContentProps>();

// Component events
const emit = defineEmits<{
  (e: 'responseReceived'): void;
  (e: 'openSlides', slides: any[], messageId?: string): void;
}>();

// Use global thread state instead of local state
const { messageHistory, addMessage, getPendingMessage, clearPendingMessage } = useThreads();
const messageStream = ref<any[]>([]);

const bottomAnchor = ref<HTMLElement | null>(null);
const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);
const tokenCount = ref(0);

// Streaming state management
const activeStreamingMessage = ref<{
  id: string;
  messageIndex: number;
  totalSlides: number;
  contentType: 'lesson' | 'quiz' | null;
  startTime: number;
} | null>(null);

const streamingProgress = ref<{
  slidesReceived: number;
  totalExpected: number | null;
  estimatedTimeRemaining: number | null;
} | null>(null);

// Message refs for scrolling
const messageRefs = ref<Record<string, HTMLElement>>({});

// WebSocket integration
const useWebSocket = ref(true); // WebSocket-only mode
const wsChat = ref<ReturnType<typeof useWebSocketChat> | null>(null);
const isFirstMessage = ref(true);
const isWaitingForResponse = ref(false);
const currentThreadId = ref<string>(''); // Track initialized thread to prevent re-init
const messageQueue = ref<{ text: string; messageId: string }[]>([]); // Queue for messages waiting to be sent

if (import.meta.client) {
  tokenCount.value = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
}

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

      // Check for pending message
      const pendingMessage = getPendingMessage();

      if (pendingMessage) {
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

  // Watch for new slides being added to messageStream - emit to parent
  watch(
    () => messageStream.value,
    (newMessages, oldMessages) => {
      // Check if new messages were added
      if (newMessages?.length > (oldMessages?.length || 0)) {
        // Check the latest message for slides
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage?.slides && Array.isArray(latestMessage.slides) && latestMessage.slides.length > 0) {
          console.log('Auto-opening slides for new message:', latestMessage.slides);
          // Emit to parent to open slides panel with messageId for marking persistence
          emit('openSlides', latestMessage.slides, latestMessage.id);

          // Scroll to the message with slides
          nextTick(() => {
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

// Helper to update message status by ID
const updateMessageStatus = (messageId: string, status: 'queued' | 'sending' | 'sent' | 'failed') => {
  const msgIndex = messageStream.value.findIndex((m) => m.id === messageId);
  if (msgIndex !== -1) {
    messageStream.value[msgIndex] = {
      ...messageStream.value[msgIndex],
      status,
    };
  }
};

// Process queued messages when WebSocket connects
const processMessageQueue = () => {
  if (wsChat.value?.isConnected && messageQueue.value.length > 0) {
    console.log('Processing queued messages:', messageQueue.value.length);
    const messages = [...messageQueue.value];
    messageQueue.value = [];

    messages.forEach((queuedMsg) => {
      nextTick(() => {
        // Update status to 'sending' before actually sending
        if (queuedMsg.messageId) {
          updateMessageStatus(queuedMsg.messageId, 'sending');
        }
        const success = sendMessage(queuedMsg.text);
        if (!success && queuedMsg.messageId) {
          updateMessageStatus(queuedMsg.messageId, 'failed');
        }
      });
    });
  }
};

// Async save helper - fire and forget, no blocking UI
const saveMessageAsync = (obj: { thread_id: string; content: any; type: string; isUser: boolean; uuid: string }) => {
  addMessage(obj).catch((err) => {
    console.error('[saveMessageAsync] Failed:', err);
  });
};

// Handle slide batch streaming
const handleSlideBatch = (batchMessage: any) => {
  const { batch } = batchMessage;

  if (!batch || !batch.slides || !Array.isArray(batch.slides)) {
    console.warn('Invalid batch message:', batchMessage);
    return;
  }

  const { slides, batch_size, total_slides_so_far } = batch;

  // Case 1: First batch - initialize streaming message
  if (!activeStreamingMessage.value) {
    // Detect content type from first slide
    const contentType = slides[0]?.type === 'question' ? 'quiz' : 'lesson';

    // Create the streaming message structure
    const newMessageId = crypto.randomUUID();
    const newMessage = {
      status: 'streaming',
      slides: [...slides],
      contentType,
      isStreaming: true,
      id: newMessageId,
    };

    // Add to message stream
    messageStream.value.push(newMessage);
    const messageIndex = messageStream.value.length - 1;

    // Initialize streaming state
    activeStreamingMessage.value = {
      id: newMessageId,
      messageIndex,
      totalSlides: total_slides_so_far,
      contentType,
      startTime: Date.now(),
    };

    streamingProgress.value = {
      slidesReceived: total_slides_so_far,
      totalExpected: null, // Unknown until completion
      estimatedTimeRemaining: null,
    };

    // Emit to parent to open slides panel with messageId for marking persistence
    emit('openSlides', [...slides], newMessageId);

    isWaitingForResponse.value = true;

    // SAVE immediately (incremental save pattern)
    saveMessageAsync({
      thread_id: props.threadId,
      content: newMessage,
      type: 'json',
      isUser: false,
      uuid: newMessageId
    });

    return;
  }

  // Case 2: Subsequent batches - append to existing message
  console.log(`Batch received: ${batch_size} slides (total: ${total_slides_so_far})`);

  const messageIndex = activeStreamingMessage.value.messageIndex;
  const existingMessage = messageStream.value[messageIndex];

  if (!existingMessage) {
    console.error('Streaming message not found at index:', messageIndex);
    return;
  }

  // Append new slides to existing message
  existingMessage.slides = [...existingMessage.slides, ...slides];

  // Update streaming state
  activeStreamingMessage.value.totalSlides = total_slides_so_far;

  if (streamingProgress.value) {
    streamingProgress.value.slidesReceived = total_slides_so_far;

    // Calculate estimated time remaining
    const elapsed = Date.now() - activeStreamingMessage.value.startTime;
    const slidesPerMs = total_slides_so_far / elapsed;
    // Rough estimate: assume 10-15 slides typical
    const estimatedTotal = Math.max(total_slides_so_far + 2, 10);
    const remaining = (estimatedTotal - total_slides_so_far) / slidesPerMs;
    streamingProgress.value.estimatedTimeRemaining = remaining;
  }

  // Emit updated slides to parent with messageId for marking persistence
  emit('openSlides', [...existingMessage.slides], activeStreamingMessage.value?.id);

  // Trigger reactivity
  messageStream.value = [...messageStream.value];

  // SAVE updated message (upsert - incremental save pattern)
  saveMessageAsync({
    thread_id: props.threadId,
    content: existingMessage,
    type: 'json',
    isUser: false,
    uuid: existingMessage.id
  });
};

// Handle streaming completion
const handleStreamingComplete = (completionMessage: any) => {
  if (!activeStreamingMessage.value) {
    console.warn('Received completion but no active streaming message');
    return;
  }

  const messageIndex = activeStreamingMessage.value.messageIndex;
  const streamingMessage = messageStream.value[messageIndex];

  if (streamingMessage) {
    // Update message to final state
    streamingMessage.status = 'completed';
    streamingMessage.isStreaming = false;
    streamingMessage.message = completionMessage.message || streamingMessage.message;

    // Trigger final update
    messageStream.value = [...messageStream.value];

    // Final save with updated status (slides already saved incrementally)
    saveMessageAsync({
      thread_id: props.threadId,
      content: streamingMessage,
      type: 'json',
      isUser: false,
      uuid: streamingMessage.id
    });
  }

  // Clear streaming state
  activeStreamingMessage.value = null;
  streamingProgress.value = null;
  isWaitingForResponse.value = false;

  // Scroll to ensure content is visible
  nextTick(() => {
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

// Mark the most recent user message as 'sent'
const markLastUserMessageSent = () => {
  // Find the last user message and mark it as sent
  for (let i = messageStream.value.length - 1; i >= 0; i--) {
    const msg = messageStream.value[i];
    if (msg.isUser && (msg.status === 'sending' || msg.status === 'queued')) {
      messageStream.value[i] = { ...msg, status: 'sent' };
      break;
    }
  }
};

// Handle incoming WebSocket messages
const handleWebSocketMessage = (message: any) => {
  // Any valid response means our message was received - mark as sent and notify parent
  if (message.status && !['heartbeat', 'status_update'].includes(message.status)) {
    markLastUserMessageSent();
    emit('responseReceived');
  }

  // Route slide batch messages
  if (message.type === 'slide_batch_ready') {
    handleSlideBatch(message);
    return;
  }

  // Handle streaming completion
  if (message.status === 'completed' && activeStreamingMessage.value) {
    handleStreamingComplete(message);
    return;
  }

  // Display summary message from user_message status
  if (message.status === 'user_message') {
    // NOTE: Save only the message text, ignore slides array
    // The slides were already saved via handleStreamingComplete()
    const newUuid = crypto.randomUUID();

    // Create clean message object WITHOUT slides for database
    const cleanMessage = {
      message: message.message,
      status: 'user_message',
      timestamp: message.timestamp
      // Explicitly exclude slides - they're already saved
    };

    // Save clean message to database (text only, no slides)
    const addMessageObj = {
      thread_id: props.threadId,
      content: cleanMessage,
      type: 'json',
      isUser: false,
      uuid: newUuid
    };
    addMessage(addMessageObj);

    // Display in UI
    messageStream.value.push({ ...cleanMessage, id: newUuid });

    // Update state flags
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;

    // Scroll to bottom
    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });

    return;
  }

  if (['timeout', 'cancelled', 'error'].includes(message.status)) {
    // Clear streaming state - slides already saved incrementally, no error message needed
    if (activeStreamingMessage.value) {
      const messageIndex = activeStreamingMessage.value.messageIndex;
      const streamingMessage = messageStream.value[messageIndex];
      if (streamingMessage) {
        streamingMessage.status = 'completed';
        streamingMessage.isStreaming = false;
      }
      activeStreamingMessage.value = null;
      streamingProgress.value = null;
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
          isUser: !!block.isUser,
          messageId: block.id?.toString(),
          status: block.status, // Pass message status for visual indicators
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
          isUser: !!block.isUser,
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
            isUser: !!block.isUser,
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
          isStreaming: activeStreamingMessage.value?.id === block.id,
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

  isPlayingAllowed.value = false;
  await nextTick();
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

  const messageUuid = crypto.randomUUID();
  const addMessageObj = {
    thread_id: props.threadId,
    content: text,
    type: 'text',
    isUser: true,
    uuid: messageUuid
  };
  addMessage(addMessageObj);

  // Determine initial status based on connection state
  const initialStatus = wsChat.value?.isConnected ? 'sending' : 'queued';
  messageStream.value.push({ type: 'text', text, isUser: true, id: messageUuid, status: initialStatus });

  // Since we connect immediately in initializeChat, just try to send
  if (wsChat.value?.isConnected) {
    const success = sendMessage(text);
    if (!success) {
      // Handle send failure - update message status
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        ...messageStream.value[lastIdx],
        status: 'failed',
      };
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    }
  } else {
    // Queue the message for later sending (fallback)
    console.log('WebSocket not connected, queuing message:', text);
    messageQueue.value.push({ text, messageId: messageUuid });
  }
};

const handleOpenSplitView = (slides: any[], messageId?: string) => {
  // Emit to parent to open slides panel with messageId for marking persistence
  emit('openSlides', slides, messageId);
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
  isPlayingAllowed.value = false;
  isWaitingForResponse.value = false;
  messageQueue.value = [];
  messageRefs.value = {};

  // Clear streaming state
  activeStreamingMessage.value = null;
  streamingProgress.value = null;

  // Disconnect current WebSocket
  if (wsChat.value) {
    wsChat.value.disconnect();
    wsChat.value = null;
  }

  // Reset flags
  isFirstMessage.value = true;
  currentThreadId.value = '';
};

// Expose methods and state to parent component
defineExpose({
  handleSend,
  clearChat,
  wsChat,
  isWaitingForResponse,
});

onUnmounted(() => {
  if (wsChat.value) {
    wsChat.value.disconnect();
  }
  clearChat();
});
</script>
