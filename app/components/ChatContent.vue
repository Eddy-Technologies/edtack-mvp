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
          @open-split-view="(slides, startIndex) => handleOpenSplitView(slides, unit.props.messageId, startIndex)"
          @cancel="handleCancelRequest"
          @retry="handleRetry"
        />
      </div>

      <!-- Loading indicator when waiting for response -->
      <LoadingIndicator
        v-if="chatIsWaitingForResponse"
        :character="character"
        :is-loading="true"
        @cancel="handleCancelRequest"
      />

      <div ref="bottomAnchor" />
    </div>

    <!-- Scroll to bottom button -->
    <Transition name="fade">
      <button
        v-if="!isAtBottom && flattenedPlaybackUnits.length > 0"
        class="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-white/90 transition-colors border border-gray-200/50 z-10"
        title="Scroll to bottom"
        @click="scrollToBottom"
      >
        <Icon name="i-heroicons-arrow-down" class="w-5 h-5 text-gray-600" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlidesPlaceholderCard from '@/components/playback/SlidesPlaceholderCard.vue';
import LoadingIndicator from '@/components/chat/LoadingIndicator.vue';
import { useChat, type UseChatReturn } from '~/composables/useChat';
import { useMeStore } from '~/stores/me';
import { useThreads } from '~/composables/useThreads';
import { useMessageQueueStore } from '~/stores/messageQueue';

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
  (e: 'openSlides', slides: any[], messageId?: string, startIndex?: number): void;
}>();

// Use global thread state instead of local state
const { messageHistory, addMessage, getPendingMessage, clearPendingMessage } = useThreads();
const messageStream = ref<any[]>([]);

const bottomAnchor = ref<HTMLElement | null>(null);
const scrollArea = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
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

// Flag to track when syncing from threadData (prevents slides auto-open on thread switch)
const isSyncingFromThreadData = ref(false);

// Chat integration (supports both WebSocket and SSE modes via env config)
// CRITICAL: Must use shallowRef here. Using ref() causes Vue to auto-unwrap nested refs,
// so chat.value?.isConnected returns a boolean instead of a Ref, breaking .value access.
const chat = shallowRef<UseChatReturn | null>(null);
const isFirstMessage = ref(true);
const isWaitingForResponse = ref(false);

// Computed properties for connection status (exposed to parent)
const chatIsConnected = computed(() => chat.value?.isConnected.value || false);
const chatIsConnecting = computed(() => chat.value?.isConnecting.value || false);
const chatError = computed(() => chat.value?.error.value || null);
const chatResponsePhase = computed(() => chat.value?.responsePhase.value || '');
// Loading indicator should hide on: error, completed, cancelled, timeout (even if socket stays alive)
const threadStatus = computed(() => messageQueueStore.getThreadState(props.threadId)?.status || 'idle');
const isTerminalStatus = computed(() => ['error', 'completed', 'cancelled', 'timeout'].includes(threadStatus.value));
const chatIsWaitingForResponse = computed(() => {
  // Hide loading if thread reached terminal state (e.g., timeout)
  if (isTerminalStatus.value) return false;
  return chat.value?.isWaitingForResponse.value || isWaitingForResponse.value;
});
const currentThreadId = ref<string>(''); // Track initialized thread to prevent re-init
const isInitializing = ref(false); // Prevent concurrent initialization
const isSendingMessage = ref(false); // Prevent initializeChat from disconnecting during send
const messageQueue = ref<{ text: string; messageId: string }[]>([]); // Queue for messages waiting to be sent

if (import.meta.client) {
  tokenCount.value = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
}

const meStore = useMeStore();
const supabaseUser = useSupabaseUser();

// Global message queue store for background processing
const messageQueueStore = useMessageQueueStore();

// Initialize chat - simplified approach
const initializeChat = async () => {
  // Skip if 'new' thread ID (invalid)
  if (!props.threadId || props.threadId === 'new') {
    return;
  }

  // Prevent concurrent initialization - this is critical to avoid spam
  if (isInitializing.value) {
    return;
  }

  // Don't interfere if we're actively sending a message (reconnecting)
  if (isSendingMessage.value) {
    console.log('[ChatContent] initializeChat skipped - message send in progress');
    return;
  }

  // If we already have this thread initialized and connected/connecting, skip re-initialization
  const alreadyConnected = chat.value?.isConnected.value;
  const alreadyConnecting = chat.value?.isConnecting.value;
  if (currentThreadId.value === props.threadId && (alreadyConnected || alreadyConnecting)) {
    return;
  }

  // Also check store-level connection status (connected OR connecting)
  const storeConnection = messageQueueStore.getConnection(props.threadId);
  if (storeConnection?.chat.isConnected.value || storeConnection?.chat.isConnecting?.value) {
    console.log('[ChatContent] Store has active connection, reusing');
    currentThreadId.value = props.threadId;
    chat.value = useChat(props.threadId);

    // Populate messageStream even when reusing connection (fixes empty messages on thread switch)
    // Preserve existing statuses (failed, cancelled, etc.)
    const existingStatuses = new Map<string, string>();
    for (const msg of messageStream.value) {
      if (msg.id && msg.status) {
        existingStatuses.set(msg.id, msg.status);
      }
    }
    messageStream.value = messageHistory.value.map(({ content, id, sender }) => {
      const preservedStatus = existingStatuses.get(id);
      if (!sender) {
        return { ...JSON.parse(content), isUser: false, id };
      }
      return { text: content, isUser: true, id, ...(preservedStatus && { status: preservedStatus }) };
    });

    return;
  }

  // Check if thread was processing in background (user returning to active thread)
  // Cached messages will be loaded from the store automatically via computed properties

  const userId = meStore.user_info_id || meStore.id;

  // Wait for profile to load
  if (!meStore.user_role && meStore.isLoading) {
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

  // Mark as initializing to prevent concurrent calls
  isInitializing.value = true;

  // Track the current thread ID early to prevent re-entry
  currentThreadId.value = props.threadId;

  // Always treat as new chat since we have no history
  isFirstMessage.value = true;

  // Insert messageHistory to messageStream
  messageStream.value = messageHistory.value.map(({ content, id, sender }) => {
    if (!sender) {
      return { ...JSON.parse(content), isUser: false, id };
    }
    return { text: content, isUser: true, id };
  });

  // Only disconnect if switching to a different thread
  // Don't disconnect if we're re-initializing the same thread (e.g., from token refresh)
  if (chat.value && currentThreadId.value !== props.threadId) {
    console.log('[ChatContent] Switching threads, disconnecting old connection');
    chat.value.disconnect();
    chat.value = null;
  } else if (chat.value) {
    // Same thread - just reuse existing chat instance, don't reconnect
    console.log('[ChatContent] Same thread, reusing existing chat instance');
    return;
  }

  if (props.threadId) {
    // Use useChat which manages the store connection internally
    // This ensures the connection is stored in the pool and accessible via getConnection
    try {
      chat.value = useChat(props.threadId);
      // store.connect() already waits for connection internally via doConnect()
      // so we don't need to call waitForConnection() separately
      const connected = await chat.value.connect();
      console.log('[ChatContent] initializeChat connect() result:', connected);

      // Check for pending message
      const pendingMessage = getPendingMessage();

      if (pendingMessage) {
        clearPendingMessage();

        // Send immediately since we're already connected
        nextTick(() => {
          handleSend(pendingMessage);
        });
      }
    } catch (err) {
      console.error('[ChatContent] Connection failed:', err);
      // Connection might still succeed after timeout - don't block the UI
    } finally {
      // Always reset initializing flag
      isInitializing.value = false;
    }
  } else {
    isInitializing.value = false;
  }
};

onMounted(() => {
  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollArea.value) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollArea.value;
    // Consider "at bottom" if within 100px of bottom
    isAtBottom.value = scrollHeight - scrollTop - clientHeight < 100;
  };

  if (scrollArea.value) {
    scrollArea.value.addEventListener('scroll', handleScroll);
  }

  // Single watcher for chat responses (WebSocket and SSE)
  // Note: Must watch response.value (the array), not response (the Ref),
  // otherwise .length check fails since Refs don't have a length property
  watch(
    () => chat.value?.response.value,
    (newMessages) => {
      if (newMessages && newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        handleWebSocketMessage(lastMessage);
      }
    },
    { deep: true }
  );

  // Single watcher for connection state - process queue when connected
  watch(
    () => chat.value?.isConnected.value,
    (connected: boolean | undefined, wasConnected: boolean | undefined) => {
      if (connected) {
        processMessageQueue();
      }

      // Detect connection loss while waiting for response (e.g., RAG restart)
      if (wasConnected && !connected && isWaitingForResponse.value) {
        console.log('[ChatContent] Connection lost while waiting for response - resetting loading state');
        isWaitingForResponse.value = false;
        isPlayingAllowed.value = true;

        // Mark the last user message as failed (response was interrupted)
        // Check for 'sending', 'queued', OR 'sent' - since RAG may have started responding before crashing
        for (let i = messageStream.value.length - 1; i >= 0; i--) {
          const msg = messageStream.value[i];
          if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
            console.log('[ChatContent] Marking message as failed:', i, 'previous status:', msg.status);
            messageStream.value[i] = { ...msg, status: 'failed' };
            // Force reactivity update
            messageStream.value = [...messageStream.value];
            break;
          }
        }
      }
    }
  );

  // Watch for new slides being added to messageStream - emit to parent
  watch(
    () => messageStream.value,
    (newMessages, oldMessages) => {
      // Skip auto-open during initial thread data sync (prevents slides opening on thread switch)
      if (isSyncingFromThreadData.value) {
        return;
      }
      // Check if new messages were added
      if (newMessages?.length > (oldMessages?.length || 0)) {
        // Check the latest message for slides
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage?.slides && Array.isArray(latestMessage.slides) && latestMessage.slides.length > 0) {
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
  // Watch for boolean presence (not object reference) to avoid re-triggering on token refresh
  watch(
    () => ({
      hasUser: !!supabaseUser.value, // Boolean to avoid triggering on token refresh
      profileLoaded: !!meStore.user_role,
      threadId: props.threadId,
      character: props.character?.id, // Watch ID, not full object
    }),
    (state) => {
      if (state.hasUser && state.profileLoaded && state.threadId && state.character) {
        initializeChat();
      }
    },
    { immediate: true }
  );

  // Watch threadData prop for changes - syncs messageStream when switching threads
  // This fixes the issue where initializeChat() returns early (reusing connection)
  // but messageStream is never populated with the new thread's messages
  watch(
    () => props.threadData,
    (newThreadData) => {
      if (newThreadData?.thread_messages && props.threadId !== 'new') {
        console.log('[ChatContent] Syncing messageStream from threadData prop');
        // Set flag to prevent slides auto-open during sync
        isSyncingFromThreadData.value = true;

        // Build a map of existing message statuses to preserve them
        const existingStatuses = new Map<string, string>();
        for (const msg of messageStream.value) {
          if (msg.id && msg.status) {
            existingStatuses.set(msg.id, msg.status);
          }
        }

        messageStream.value = newThreadData.thread_messages.map((msg: any) => {
          const preservedStatus = existingStatuses.get(msg.id);
          if (!msg.sender) {
            return { ...JSON.parse(msg.content), isUser: false, id: msg.id };
          }
          // Preserve status for user messages (failed, cancelled, etc.)
          return { text: msg.content, isUser: true, id: msg.id, ...(preservedStatus && { status: preservedStatus }) };
        });
        // Reset flag after sync completes and scroll to bottom
        nextTick(() => {
          isSyncingFromThreadData.value = false;
          // Scroll to bottom on initial load with instant behavior
          bottomAnchor.value?.scrollIntoView({ behavior: 'instant' });
        });
      }
    },
    { immediate: true }
  );
});

// Send message directly to WebSocket
// skipConnectionCheck: trust caller's connection state (avoids Vue reactivity timing issues)
const sendMessage = async (text: string, skipConnectionCheck = false) => {
  console.log('[ChatContent] sendMessage called, isConnected:', chat.value?.isConnected.value, 'skipCheck:', skipConnectionCheck);
  const isConnected = chat.value?.isConnected.value;
  if ((!isConnected && !skipConnectionCheck) || !text.trim()) {
    console.log('[ChatContent] sendMessage early return - not connected or empty text');
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
    console.log('[ChatContent] Calling startChat (isFirstMessage=true)');
    success = await chat.value.startChat(text, userInfo);
    isFirstMessage.value = false;
  } else {
    console.log('[ChatContent] Calling sendUserResponse (isFirstMessage=false)');
    success = await chat.value.sendUserResponse(text, userInfo);
  }

  console.log('[ChatContent] sendMessage success:', success);

  if (success) {
    isWaitingForResponse.value = true;
    // Note: useChat handles thread state updates internally
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
  if (chat.value?.isConnected.value && messageQueue.value.length > 0) {
    const messages = [...messageQueue.value];
    messageQueue.value = [];

    messages.forEach((queuedMsg) => {
      nextTick(() => {
        // Update status to 'sending' before actually sending
        if (queuedMsg.messageId) {
          updateMessageStatus(queuedMsg.messageId, 'sending');
        }
        // Skip connection check - we verified isConnected at start of processMessageQueue
        const success = sendMessage(queuedMsg.text, true);
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

  const { slides, total_slides_so_far } = batch;

  // Update thread state to indicate we have partial slides (for background processing UI)
  messageQueueStore.setThreadState(props.threadId, { hasPartialSlides: true });

  // Case 1: First batch - initialize streaming message
  if (!activeStreamingMessage.value) {
    // Detect content type from first slide
    const contentType = slides[0]?.type === 'question' ? 'quiz' : 'lesson';

    // Create the streaming message structure
    const newMessageId = crypto.randomUUID();
    // Track this UUID locally for deduplication with Realtime
    messageQueueStore.trackLocalMessage(newMessageId);
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

  // Reset for next conversation - allows new messages to use startChat
  isFirstMessage.value = true;

  // Update global thread state to completed
  messageQueueStore.setThreadState(props.threadId, {
    status: 'completed',
    hasPartialSlides: false,
    responsePhase: '',
  });

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
    // Track this UUID locally for deduplication with Realtime
    messageQueueStore.trackLocalMessage(newUuid);

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

  if (['completed', 'timeout', 'cancelled', 'error'].includes(message.status)) {
    console.log('[ChatContent] Terminal state received:', message.status, '- resetting isFirstMessage and closing connection');
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

    // Mark user message status for error/timeout/cancelled (allows retry)
    // This handles: SSE connection failures, RAG timeouts, network errors, user cancellation
    if (message.status === 'error' || message.status === 'timeout' || message.status === 'cancelled') {
      const newStatus = message.status === 'cancelled' ? 'cancelled' : 'failed';
      for (let i = messageStream.value.length - 1; i >= 0; i--) {
        const msg = messageStream.value[i];
        if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
          console.log('[ChatContent] Marking message as', newStatus, 'due to', message.status);
          messageStream.value[i] = { ...msg, status: newStatus };
          messageStream.value = [...messageStream.value];
          break;
        }
      }
    }

    // Reset for next conversation - allows new messages to use startChat
    isFirstMessage.value = true;

    // Close the WebSocket connection - RAG cleans up task after terminal states,
    // so we need a fresh connection for the next message
    if (chat.value) {
      console.log('[ChatContent] Disconnecting stale connection after terminal state');
      chat.value.disconnect();
    }

    // Update global thread state
    const status = message.status === 'cancelled' ? 'cancelled' : message.status === 'error' ? 'error' : 'completed';
    messageQueueStore.setThreadState(props.threadId, {
      status,
      hasPartialSlides: false,
      responsePhase: '',
      error: message.error,
    });
    return;
  }
};

// Flatten the entire messageStream into an ordered array of playback units
const flattenedPlaybackUnits = computed(() => {
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
  console.log('[ChatContent] handleSend called, text:', text.substring(0, 50));
  if (!text.trim()) return;

  // Set flag to prevent initializeChat from interfering during reconnection
  isSendingMessage.value = true;

  isPlayingAllowed.value = false;
  await nextTick();
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

  const messageUuid = crypto.randomUUID();
  // Track this UUID locally for deduplication with Realtime
  messageQueueStore.trackLocalMessage(messageUuid);

  const addMessageObj = {
    thread_id: props.threadId,
    content: text,
    type: 'text',
    isUser: true,
    uuid: messageUuid
  };
  addMessage(addMessageObj);

  // Determine initial status based on connection state
  const isConnectedNow = chat.value?.isConnected.value || false;
  console.log('[ChatContent] isConnectedNow:', isConnectedNow, 'chat.value:', !!chat.value, 'isFirstMessage:', isFirstMessage.value);

  const initialStatus = isConnectedNow ? 'sending' : 'queued';
  messageStream.value.push({ type: 'text', text, isUser: true, id: messageUuid, status: initialStatus });

  // Helper to update message status by index
  const updateStatus = (status: 'sending' | 'sent' | 'failed') => {
    const idx = messageStream.value.findIndex((m: { id?: string }) => m.id === messageUuid);
    if (idx !== -1) {
      messageStream.value[idx] = { ...messageStream.value[idx], status };
    }
  };

  // Try to send, reconnecting if needed
  if (isConnectedNow) {
    console.log('[ChatContent] Already connected, sending directly');
    const sendResult = await sendMessage(text);
    console.log('[ChatContent] sendMessage result:', sendResult);
    if (!sendResult) {
      updateStatus('failed');
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    }
  } else {
    // Not connected - try to reconnect and send
    console.log('[ChatContent] Not connected, attempting reconnection...');
    updateStatus('sending'); // Show as sending while reconnecting
    try {
      console.log('[ChatContent] Calling chat.value?.connect()...');
      // store.connect() already waits for connection internally via doConnect()
      // so we don't need to call waitForConnection() separately
      const connected = await chat.value?.connect();
      console.log('[ChatContent] connect() result:', connected);

      if (!connected) {
        throw new Error('Connection failed');
      }

      // Now try to send - skip connection check since we just verified it
      const sendResult = await sendMessage(text, true);
      console.log('[ChatContent] sendMessage result after reconnect:', sendResult);
      if (!sendResult) {
        updateStatus('failed');
        isPlayingAllowed.value = true;
        isWaitingForResponse.value = false;
      }
    } catch (err) {
      // Reconnection failed - mark message as failed
      console.error('[ChatContent] Reconnection failed:', err);
      updateStatus('failed');
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    } finally {
      // Always reset the sending flag
      isSendingMessage.value = false;
    }
  }

  // Reset flag for the already-connected path (if branch at line 763)
  if (isConnectedNow) {
    isSendingMessage.value = false;
  }
};

// Handle cancel/stop request
const handleCancelRequest = async () => {
  if (chat.value?.cancelRequest) {
    await chat.value.cancelRequest();
    isWaitingForResponse.value = false;
  }
};

// Handle retry for failed messages
const handleRetry = async (text: string) => {
  // Find and remove the failed message from stream (will be re-added by handleSend)
  const failedIndex = messageStream.value.findIndex(
    (m: { isUser?: boolean; text?: string; status?: string }) => m.isUser && m.text === text && m.status === 'failed'
  );
  if (failedIndex !== -1) {
    messageStream.value.splice(failedIndex, 1);
  }

  // Clear error state from store before retrying
  messageQueueStore.setThreadState(props.threadId, { status: 'idle', error: undefined });

  // Resend the message
  await handleSend(text);
};

const handleOpenSplitView = (slides: any[], messageId?: string, startIndex?: number) => {
  // Emit to parent to open slides panel with messageId for marking persistence
  emit('openSlides', slides, messageId, startIndex);
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
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } else {
    // Fallback to bottom scroll
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  }
};

// Scroll to the bottom of the chat
const scrollToBottom = () => {
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
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

  // Clear thread state from global store
  if (currentThreadId.value) {
    messageQueueStore.clearThreadState(currentThreadId.value);
    messageQueueStore.clearMessageCache(currentThreadId.value);
  }

  // Disconnect current WebSocket (only on explicit clear, not on navigation)
  if (chat.value) {
    chat.value.disconnect();
    chat.value = null;
  }

  // Reset flags
  isFirstMessage.value = true;
  currentThreadId.value = '';
  isInitializing.value = false;
};

// Expose methods and state to parent component
defineExpose({
  handleSend,
  clearChat,
  scrollToBottom,
  chat,
  isWaitingForResponse,
  // Connection status computed properties for parent
  chatIsConnected,
  chatIsConnecting,
  chatError,
  chatResponsePhase,
  chatIsWaitingForResponse,
});

onUnmounted(() => {
  // NOTE: We intentionally do NOT disconnect the chat connection here.
  // The connection stays alive in the global pool for background processing.
  // When the user navigates away, chat can continue in the background.
  // The connection will be cleaned up by the pool's idle timeout.

  // Clear local component state only (not the global connection)
  messageStream.value = [];
  currentPlaybackIndex.value = 0;
  isPlayingAllowed.value = false;
  isWaitingForResponse.value = false;
  messageQueue.value = [];
  messageRefs.value = {};
  activeStreamingMessage.value = null;
  streamingProgress.value = null;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
