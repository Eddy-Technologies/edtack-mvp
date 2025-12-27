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

// Track how many responses we've processed to avoid re-processing on return
const lastProcessedResponseIndex = ref(-1);

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

/**
 * Process any pending responses that arrived while user was away.
 * Called when returning to a thread with an active connection.
 *
 * IMPORTANT: This function must be careful not to re-process responses that were already
 * handled before the user navigated away. We check if messageStream already has content
 * from messageHistory (loaded from DB) to avoid creating duplicate messages.
 */
const processPendingResponses = () => {
  // Access response from store connection directly to ensure we get the actual pooled data
  // (chat.value?.response might have reactivity issues with computed refs)
  const storeConn = messageQueueStore.getConnection(props.threadId);
  const responses = storeConn?.chat.response.value;

  console.log('[ChatContent] processPendingResponses called:', {
    hasStoreConn: !!storeConn,
    responsesLength: responses?.length || 0,
    lastProcessedIndex: lastProcessedResponseIndex.value,
    messageStreamLength: messageStream.value.length,
  });

  if (!responses || responses.length === 0) {
    console.log('[ChatContent] No responses to process');
    return;
  }

  // If messageStream already has non-user messages (AI responses loaded from DB),
  // the responses were likely already processed and saved before user navigated away.
  // In this case, just update the index to prevent re-processing.
  const hasExistingAIMessages = messageStream.value.some((msg: any) => !msg.isUser);
  if (hasExistingAIMessages && lastProcessedResponseIndex.value === -1) {
    console.log('[ChatContent] messageStream has AI messages from DB - skipping re-processing');
    lastProcessedResponseIndex.value = responses.length - 1;
    return;
  }

  // Process all responses from where we left off
  const startIndex = lastProcessedResponseIndex.value + 1;
  if (startIndex >= responses.length) {
    console.log('[ChatContent] All responses already processed');
    return;
  }

  console.log('[ChatContent] Processing pending responses:', {
    startIndex,
    totalResponses: responses.length,
    pendingCount: responses.length - startIndex,
    responseTypes: responses.slice(startIndex).map((r: any) => r.status || r.type),
  });

  for (let i = startIndex; i < responses.length; i++) {
    handleWebSocketMessage(responses[i]);
  }
  lastProcessedResponseIndex.value = responses.length - 1;
};

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
    // Reset response tracking for this thread (will be set properly in processPendingResponses)
    lastProcessedResponseIndex.value = -1;

    // Populate messageStream even when reusing connection (fixes empty messages on thread switch)
    // Preserve existing statuses (failed, cancelled, etc.)
    const existingStatuses = new Map<string, string>();
    for (const msg of messageStream.value) {
      if (msg.id && msg.status) {
        existingStatuses.set(msg.id, msg.status);
      }
    }
    // Check if thread was processing in background
    const threadState = messageQueueStore.getThreadState(props.threadId);
    const isThreadProcessing = threadState?.status === 'processing';

    messageStream.value = messageHistory.value.map(({ content, id, sender }, index: number) => {
      const preservedStatus = existingStatuses.get(id);
      if (!sender) {
        return { ...JSON.parse(content), isUser: false, id };
      }
      // For user messages: use preserved status, or 'sent' if this is the last message and thread is processing
      const isLastUserMessage = index === messageHistory.value.length - 1 && sender;
      const status = preservedStatus || (isLastUserMessage && isThreadProcessing ? 'sent' : undefined);
      return { text: content, isUser: true, id, ...(status && { status }) };
    });

    // If thread was processing, resume the loading state
    if (isThreadProcessing) {
      console.log('[ChatContent] Synced thread data while processing - resuming loading state');
      isWaitingForResponse.value = true;
      isPlayingAllowed.value = false;
    }

    // Process any responses that arrived while user was away (e.g., slide batches)
    // This ensures messages received during background processing are displayed
    nextTick(() => {
      processPendingResponses();
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
    // Reset response tracking for new thread
    lastProcessedResponseIndex.value = -1;
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

      // Check if thread was processing in background (user returning to active thread)
      // If so, resume the loading state so user sees the indicator
      const threadState = messageQueueStore.getThreadState(props.threadId);
      if (threadState?.status === 'processing') {
        console.log('[ChatContent] Resuming processing state - backend may still be generating');
        isWaitingForResponse.value = true;
        isPlayingAllowed.value = false;
      }

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
  // IMPORTANT: Watch the store's responseVersions counter for this thread.
  // The connectionPool is stored outside Pinia state for ref preservation,
  // so we use responseVersions (incremented on each response) to trigger reactivity.
  // We track lastProcessedResponseIndex to avoid re-processing messages on thread return.
  watch(
    () => {
      // Access responseVersions to establish reactive dependency (incremented on each response)
      const version = messageQueueStore.responseVersions[props.threadId] || 0;
      // Also access connectionVersion for connection state changes
      void messageQueueStore.connectionVersion;
      // Get response directly from store's connection pool
      const conn = messageQueueStore.getConnection(props.threadId);
      const resp = conn?.chat.response.value;
      // Log for debugging
      console.log('[ChatContent] Watcher getter called, version:', version, 'responses:', resp?.length || 0);
      return { responses: resp, version };
    },
    ({ responses: newMessages }: { responses: any[] | undefined; version: number }) => {
      if (newMessages && newMessages.length > 0) {
        // Process only messages we haven't processed yet
        const startIndex = lastProcessedResponseIndex.value + 1;
        if (startIndex < newMessages.length) {
          console.log('[ChatContent] Processing messages from index:', startIndex, 'to:', newMessages.length - 1);
          for (let i = startIndex; i < newMessages.length; i++) {
            handleWebSocketMessage(newMessages[i]);
          }
          lastProcessedResponseIndex.value = newMessages.length - 1;
        }
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

      // Detect connection loss while waiting for response
      // NOTE: We intentionally do NOT mark messages as 'failed' on disconnect.
      // The backend may still be processing (e.g., browser closed, network hiccup).
      // When the user returns, thread data from Supabase will show the actual result.
      // Messages are only marked 'failed' when the backend explicitly returns an error.
      if (wasConnected && !connected && isWaitingForResponse.value) {
        console.log('[ChatContent] Connection lost while waiting for response - resetting loading state (message stays as-is, backend may still be processing)');
        isWaitingForResponse.value = false;
        isPlayingAllowed.value = true;
        // Message stays in 'sent' status - will be synced from Supabase when user returns
      }
    }
  );

  // Watch for new messages being added to messageStream - auto-scroll and emit slides
  watch(
    () => messageStream.value.length,
    (newLength: number, oldLength: number | undefined) => {
      // Skip during initial thread data sync
      if (isSyncingFromThreadData.value) {
        return;
      }

      // Check if new messages were added
      if (newLength > (oldLength || 0)) {
        const latestMessage = messageStream.value[newLength - 1];

        // Auto-scroll to bottom when new messages arrive (if user was already at bottom)
        if (isAtBottom.value) {
          nextTick(() => {
            bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
          });
        }

        // Check the latest message for slides - emit to parent to open slides panel
        if (latestMessage?.slides && Array.isArray(latestMessage.slides) && latestMessage.slides.length > 0) {
          emit('openSlides', latestMessage.slides, latestMessage.id);
          nextTick(() => {
            scrollToMessage(latestMessage.id);
          });
        }
      }
    }
  );

  // Auto-scroll when loading indicator appears (ensures it's visible)
  watch(
    () => chatIsWaitingForResponse.value,
    (isWaiting: boolean) => {
      if (isWaiting && isAtBottom.value) {
        nextTick(() => {
          bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
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

        // Build a set of DB message IDs for quick lookup
        const dbMessageIds = new Set(newThreadData.thread_messages.map((m: any) => m.id));

        // Collect local-only messages (failed/retried/cancelled that never made it to DB)
        const localOnlyMessages = messageStream.value.filter(
          (msg: any) => msg.isUser && ['failed', 'retried', 'cancelled'].includes(msg.status) && !dbMessageIds.has(msg.id)
        );

        // Build a map of existing message statuses to preserve them
        const existingStatuses = new Map<string, string>();
        for (const msg of messageStream.value) {
          if (msg.id && msg.status) {
            existingStatuses.set(msg.id, msg.status);
          }
        }

        // Map DB messages
        const dbMessages = newThreadData.thread_messages.map((msg: any) => {
          const preservedStatus = existingStatuses.get(msg.id);
          if (!msg.sender) {
            return { ...JSON.parse(msg.content), isUser: false, id: msg.id };
          }
          // Preserve status for user messages (failed, cancelled, etc.)
          return { text: msg.content, isUser: true, id: msg.id, ...(preservedStatus && { status: preservedStatus }) };
        });

        // Merge: local-only failed messages first (in order), then DB messages
        // This keeps retry history visible above the successful retry
        messageStream.value = [...localOnlyMessages, ...dbMessages];

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

  // Set waiting state BEFORE the async call, not after.
  // For SSE, the response is processed synchronously during the await,
  // so by the time startChat returns, the terminal state may have already
  // reset isWaitingForResponse to false. Setting it after would re-enable it incorrectly.
  isWaitingForResponse.value = true;

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

  // If send failed, reset the waiting state since no response will come
  if (!success) {
    isWaitingForResponse.value = false;
  }
  // If success, the response handlers will reset isWaitingForResponse
  // when a terminal state is received. Don't set it again here -
  // that would cause a race condition with SSE where the response
  // is fully processed before startChat returns.

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
  console.log('[ChatContent] handleWebSocketMessage:', message.status || message.type, 'isSendingMessage:', isSendingMessage.value);

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
    // BUT only if no content was received - if slides were received, message succeeded
    if (message.status === 'error' || message.status === 'timeout' || message.status === 'cancelled') {
      // Check if we received any content (slides) before the error
      // If slides exist, the message actually succeeded - don't mark as failed
      const hasReceivedContent = messageStream.value.some((msg: any) =>
        !msg.isUser && Array.isArray(msg.slides) && msg.slides.length > 0
      );

      if (!hasReceivedContent) {
        const newStatus = message.status === 'cancelled' ? 'cancelled' : 'failed';
        for (let i = messageStream.value.length - 1; i >= 0; i--) {
          const msg = messageStream.value[i];
          if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
            console.log('[ChatContent] Marking message as', newStatus, 'due to', message.status, '(no content received)');
            messageStream.value[i] = { ...msg, status: newStatus };
            messageStream.value = [...messageStream.value];
            break;
          }
        }
      } else {
        console.log('[ChatContent] Ignoring', message.status, 'status - content was already received');
        // Mark user message as completed since content was received
        for (let i = messageStream.value.length - 1; i >= 0; i--) {
          const msg = messageStream.value[i];
          if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
            messageStream.value[i] = { ...msg, status: 'completed' };
            messageStream.value = [...messageStream.value];
            break;
          }
        }
      }
    }

    // Reset for next conversation - allows new messages to use startChat
    isFirstMessage.value = true;

    // NOTE: We do NOT disconnect here anymore. The old approach caused a race condition:
    // Vue watchers are deferred (flush: 'pre'), so by the time this terminal state handler runs,
    // isSendingMessage may already be false even though the SSE stream just completed.
    // Calling disconnect() would abort the SSE fetch mid-stream, losing the response.
    //
    // Instead, the connection stays open and will be:
    // 1. Reused for the next message (isFirstMessage=true will call startChat)
    // 2. Cleaned up by idle timeout (CONNECTION_IDLE_TIMEOUT_MS)
    // 3. Closed when user navigates away
    console.log('[ChatContent] Terminal state received, keeping connection open for reuse');

    // Update global thread state
    // If content was received, treat as completed even if error/timeout occurred after
    const contentReceived = messageStream.value.some((msg: any) =>
      !msg.isUser && Array.isArray(msg.slides) && msg.slides.length > 0
    );
    let status: 'completed' | 'cancelled' | 'error' = 'completed';
    if (!contentReceived) {
      if (message.status === 'cancelled') {
        status = 'cancelled';
      } else if (message.status === 'error') {
        status = 'error';
      }
    }
    messageQueueStore.setThreadState(props.threadId, {
      status,
      hasPartialSlides: false,
      responsePhase: '',
      error: contentReceived ? null : message.error, // Clear error if content received
    });
    return;
  }
};

// Find the index of the last user message with failed or cancelled status (for showRetry logic)
const lastRetryableIndex = computed(() => {
  for (let i = messageStream.value.length - 1; i >= 0; i--) {
    const msg = messageStream.value[i];
    if (msg.isUser && (msg.status === 'failed' || msg.status === 'cancelled')) {
      return i;
    }
  }
  return -1;
});

// Flatten the entire messageStream into an ordered array of playback units
const flattenedPlaybackUnits = computed(() => {
  const units: any[] = [];
  const retryableIdx = lastRetryableIndex.value;

  messageStream.value.forEach((block, blockIndex) => {
    // Add text messages
    if (block.text) {
      // Only show retry button for the most recent failed/cancelled message
      const showRetry = blockIndex === retryableIdx;
      units.push({
        component: TextBubble,
        props: {
          text: block.text,
          isFirst: blockIndex === 0,
          isUser: !!block.isUser,
          messageId: block.id?.toString(),
          status: block.status, // Pass message status for visual indicators
          showRetry, // Only true for most recent retryable message
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
const handleSend = async (text: string, isRetryCall = false) => {
  console.log('[ChatContent] handleSend called, text:', text.substring(0, 50), 'isRetry:', isRetryCall);
  if (!text.trim()) return;

  // Guard: Prevent sending new messages while one is being processed
  // Exception: retry calls are allowed as they replace failed messages
  if (!isRetryCall && (isWaitingForResponse.value || isSendingMessage.value)) {
    console.log('[ChatContent] Blocked send - already processing:', {
      isWaitingForResponse: isWaitingForResponse.value,
      isSendingMessage: isSendingMessage.value
    });
    return;
  }

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

  // Helper to check if message was already cancelled (don't overwrite with 'failed')
  const wasAlreadyCancelled = () => {
    const msg = messageStream.value.find((m: any) => m.id === messageUuid);
    return msg?.status === 'cancelled';
  };

  // Try to send, reconnecting if needed
  if (isConnectedNow) {
    console.log('[ChatContent] Already connected, sending directly');
    const sendResult = await sendMessage(text);
    console.log('[ChatContent] sendMessage result:', sendResult);
    if (!sendResult && !wasAlreadyCancelled()) {
      updateStatus('failed');
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    }
    // IMPORTANT: Wait for Vue watchers to process SSE responses before resetting isSendingMessage.
    // Vue watchers use flush: 'pre' (deferred), so they're scheduled as microtasks.
    // Without this nextTick, isSendingMessage would be false before watchers run,
    // causing the terminal state handler to disconnect() mid-stream (race condition).
    await nextTick();
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
      if (!sendResult && !wasAlreadyCancelled()) {
        updateStatus('failed');
        isPlayingAllowed.value = true;
        isWaitingForResponse.value = false;
      }
      // Wait for watchers to process (same race condition fix as above)
      await nextTick();
    } catch (err) {
      // Reconnection failed - mark message as failed (only if not cancelled)
      console.error('[ChatContent] Reconnection failed:', err);
      if (!wasAlreadyCancelled()) {
        updateStatus('failed');
      }
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    } finally {
      // Always reset the sending flag
      isSendingMessage.value = false;
    }
  }

  // Reset flag for the already-connected path
  if (isConnectedNow) {
    isSendingMessage.value = false;
  }
};

// Handle cancel/stop request
const handleCancelRequest = async () => {
  // Mark the message as 'cancelled' IMMEDIATELY (before async operations)
  // This prevents race conditions with the isConnected watcher marking it as 'failed'
  for (let i = messageStream.value.length - 1; i >= 0; i--) {
    const msg = messageStream.value[i];
    if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
      console.log('[ChatContent] Marking message as cancelled via handleCancelRequest');
      messageStream.value[i] = { ...msg, status: 'cancelled' };
      messageStream.value = [...messageStream.value];
      break;
    }
  }

  // Reset loading state immediately
  isWaitingForResponse.value = false;

  // Then call the actual cancel on the chat connection
  if (chat.value?.cancelRequest) {
    await chat.value.cancelRequest();
  }
};

// Handle retry for failed or cancelled messages
const handleRetry = async (payload: { messageId?: string; text: string }) => {
  const { messageId, text } = payload;
  console.log('[ChatContent] handleRetry called, messageId:', messageId, 'text:', text?.substring(0, 30));
  console.log('[ChatContent] Current messageStream:', messageStream.value.map((m: any) => ({ id: m.id, status: m.status, isUser: m.isUser, text: m.text?.substring(0, 20) })));

  // Mark the failed/cancelled message as 'retried' to show user attempted retry
  // Find by messageId AND status, or fallback to text matching
  const failedIndex = messageStream.value.findIndex(
    (m: { id?: string; isUser?: boolean; text?: string; status?: string }) => {
      const isFailed = m.status === 'failed' || m.status === 'cancelled';
      // Match by messageId + failed status
      if (messageId && m.id === messageId && isFailed) return true;
      // Fallback: match by text + user + failed status
      return m.isUser && m.text === text && isFailed;
    }
  );

  console.log('[ChatContent] failedIndex:', failedIndex);
  if (failedIndex !== -1) {
    const oldMsg = messageStream.value[failedIndex];
    console.log('[ChatContent] Marking message as retried at index:', failedIndex, 'oldStatus:', oldMsg.status);
    messageStream.value[failedIndex] = { ...oldMsg, status: 'retried' };
    messageStream.value = [...messageStream.value]; // Force reactivity
    console.log('[ChatContent] After update, message status:', messageStream.value[failedIndex].status);
  } else {
    console.warn('[ChatContent] Could not find failed message to mark as retried! messageId:', messageId, 'text:', text);
  }

  // Clear error state from store before retrying
  messageQueueStore.setThreadState(props.threadId, { status: 'idle', error: undefined });

  // Send a new message (the retried one stays visible showing retry history)
  // Pass isRetryCall=true to bypass the concurrent send guard
  await handleSend(text, true);
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

  // Reset response tracking
  lastProcessedResponseIndex.value = -1;

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
