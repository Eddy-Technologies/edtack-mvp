<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Messages Stream -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto pt-8 py-6 px-4 sm:px-8 md:px-16 lg:px-24 pb-20 md:pb-32 space-y-8">
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
const { messageHistory, addMessage, updateMessageStatus: persistMessageStatus, getPendingMessage, clearPendingMessage } = useThreads();
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
// IMPORTANT: This is per-thread to prevent cross-thread response skipping when switching threads
// Bug fix: If Thread A has 5 responses (index=4) and Thread B has 10, a single index would skip B's first 5
const lastProcessedResponseIndexMap = ref<Map<string, number>>(new Map());

// Helper to get/set the index for current thread
const getLastProcessedIndex = (threadId: string): number => {
  return lastProcessedResponseIndexMap.value.get(threadId) ?? -1;
};

const setLastProcessedIndex = (threadId: string, index: number): void => {
  lastProcessedResponseIndexMap.value.set(threadId, index);
};

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

  // CRITICAL: Show loading if thread is in 'processing' state (from store).
  // This ensures loading shows even when returning to a thread that's still processing,
  // because the SSE connection's isWaitingForResponse might be false (stream ended but
  // backend still generating) and local state might not be set yet.
  if (threadStatus.value === 'processing') return true;

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
    lastProcessedIndex: getLastProcessedIndex(props.threadId),
    messageStreamLength: messageStream.value.length,
  });

  if (!responses || responses.length === 0) {
    console.log('[ChatContent] No responses to process');
    return;
  }

  // Collect timestamps of AI messages already in messageStream (loaded from DB)
  // This allows us to skip only responses that were already saved and displayed,
  // while still processing NEW responses that arrived during navigation
  const existingTimestamps = new Set(
    messageStream.value
      .filter((m: any) => !m.isUser && m.timestamp)
      .map((m: any) => m.timestamp?.toString())
  );

  console.log('[ChatContent] Existing message timestamps:', existingTimestamps.size);

  // Process responses from where we left off, but skip any already in messageStream
  const startIndex = getLastProcessedIndex(props.threadId) + 1;
  if (startIndex >= responses.length) {
    console.log('[ChatContent] All responses already processed');
    return;
  }

  let processedCount = 0;
  for (let i = startIndex; i < responses.length; i++) {
    const resp = responses[i];
    if (!resp) continue;

    const respTimestamp = resp.timestamp?.toString();

    // Skip responses already displayed (by timestamp match)
    if (respTimestamp && existingTimestamps.has(respTimestamp)) {
      console.log('[ChatContent] Skipping response with existing timestamp:', respTimestamp);
      continue;
    }

    // Process this response
    handleWebSocketMessage(resp);
    processedCount++;
  }

  setLastProcessedIndex(props.threadId, responses.length - 1);

  console.log('[ChatContent] Processed pending responses:', {
    startIndex,
    totalResponses: responses.length,
    processedCount,
    skipped: responses.length - startIndex - processedCount,
  });
};

/**
 * Check server-side status and reconnect to active stream if needed.
 * Used after page refresh when local Pinia state may be lost but server still has an active stream.
 */
const checkAndReconnectToActiveStream = async () => {
  try {
    const statusResponse = await $fetch<{ active: boolean; status: string; bufferedEvents: number }>(`/api/chat/${props.threadId}/status`);
    // ONLY reconnect when stream is ACTIVE. For completed streams, data is already in DB.
    // Don't reconnect just because there are buffered events - that causes duplicate messages.
    if (statusResponse?.active) {
      console.log('[ChatContent] Server reports ACTIVE stream with', statusResponse.bufferedEvents, 'buffered events - reconnecting');
      isWaitingForResponse.value = true;
      isPlayingAllowed.value = false;
      messageQueueStore.setThreadState(props.threadId, { status: 'processing' });

      // CRITICAL: Call reconnectToStream() to actually receive the buffered events.
      // The SSE connect() is a no-op - it just sets isConnected=true without reading the stream.
      // reconnectToStream() creates the actual EventSource connection to receive events.
      const conn = messageQueueStore.getConnection(props.threadId);
      if (conn?.chat.reconnectToStream) {
        console.log('[ChatContent] Calling reconnectToStream to receive buffered events');
        const reconnected = await conn.chat.reconnectToStream();
        console.log('[ChatContent] reconnectToStream result:', reconnected);

        // CRITICAL: reconnectToStream adds events to response.value but doesn't increment
        // responseVersions, so the watcher won't trigger. Manually process pending responses.
        if (reconnected) {
          nextTick(() => {
            processPendingResponses();
          });
        }
      } else {
        console.log('[ChatContent] No reconnectToStream available on connection');
      }
    }
  } catch (err) {
    // Status endpoint may not exist or stream may not be active - that's fine
    console.log('[ChatContent] Could not check server stream status:', err);
  }
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
  const threadStateForReuse = messageQueueStore.getThreadState(props.threadId);
  console.log('[ChatContent] initializeChat - checking reuse:', {
    threadId: props.threadId,
    hasStoreConnection: !!storeConnection,
    isConnected: storeConnection?.chat.isConnected?.value,
    isConnecting: storeConnection?.chat.isConnecting?.value,
    threadStatus: threadStateForReuse?.status,
    needsFreshStart: messageQueueStore.getNeedsFreshStart(props.threadId),
  });

  // Clean up stale connection if thread is in error state
  // This ensures fresh reconnection after timeout/error
  // NOTE: Don't clear error state here - preserve it so message shows as 'failed'
  // Error state will be cleared when user clicks retry
  if (threadStateForReuse?.status === 'error' && storeConnection && !storeConnection.chat.isConnected.value) {
    console.log('[ChatContent] Thread in error state with stale connection - cleaning up');
    await messageQueueStore.closeConnection(props.threadId);
  }

  // Re-check connection after potential cleanup
  const currentStoreConnection = messageQueueStore.getConnection(props.threadId);
  if (currentStoreConnection?.chat.isConnected.value || currentStoreConnection?.chat.isConnecting?.value) {
    console.log('[ChatContent] Store has active connection, reusing');
    currentThreadId.value = props.threadId;
    chat.value = useChat(props.threadId);
    // Note: Per-thread lastProcessedResponseIndexMap preserves index for this thread
    // No reset needed - returning to a thread should not reprocess already-handled responses

    // Populate messageStream even when reusing connection (fixes empty messages on thread switch)
    // Preserve existing statuses (failed, cancelled, etc.)
    const existingStatuses = new Map<string, string>();
    for (const msg of messageStream.value) {
      if (msg.id && msg.status) {
        existingStatuses.set(msg.id, msg.status);
      }
    }
    // Check thread state - processing, error, etc.
    const threadState = messageQueueStore.getThreadState(props.threadId);
    const isThreadProcessing = threadState?.status === 'processing';
    const isThreadError = threadState?.status === 'error';

    messageStream.value = messageHistory.value.map(({ content, id, sender, status: dbStatus }: { content: string; id: string; sender: string | null; status?: string }, index: number) => {
      const preservedStatus = existingStatuses.get(id);
      if (!sender) {
        return { ...JSON.parse(content), isUser: false, id };
      }
      // For user messages: determine status based on:
      // 1. Preserved status (local changes not yet in DB)
      // 2. DB status (persisted from previous session - cancelled, failed, etc.)
      // 3. If not last message, force 'sent' (has response after it = succeeded)
      // 4. Thread state fallback for last user message (processing/error state)
      const isLastMessage = index === messageHistory.value.length - 1;
      let status = preservedStatus || dbStatus;

      // If message is NOT last (has response after it), it definitely succeeded
      // Override any stale 'sending'/'queued' status from DB
      if (!isLastMessage) {
        status = 'sent';
      } else if (!status) {
        // Last message without status - check thread state
        if (isThreadProcessing) {
          status = 'sent';
        } else if (isThreadError) {
          // Thread is in error state (timeout, etc.) - show failed status with retry option
          status = 'failed';
        }
        // If none of the above, leave status undefined (shows no indicator)
      }
      return { text: content, isUser: true, id, ...(status && { status }) };
    });

    // If thread was processing, check if SSE is still active before resuming loading state
    if (isThreadProcessing) {
      const conn = messageQueueStore.getConnection(props.threadId);
      const isStillStreaming = conn?.chat.isWaitingForResponse?.value || conn?.chat.isStreaming?.value;

      if (isStillStreaming) {
        console.log('[ChatContent] Synced thread data while processing - SSE still active, resuming loading state');
        isWaitingForResponse.value = true;
        isPlayingAllowed.value = false;
        // NOTE: Do NOT restore activeStreamingMessage from DB slides here.
        // The slide_generation_start event from RAG will reset it when a new
        // slide session begins, ensuring new slides don't merge with old ones.
      } else {
        // SSE stream ended but thread state wasn't updated (stale state)
        // Reset to idle/completed to avoid stuck loading indicator
        console.log('[ChatContent] Thread marked as processing but SSE not active - resetting to completed');
        messageQueueStore.setThreadState(props.threadId, {
          status: 'completed',
          responsePhase: '',
        });
        isWaitingForResponse.value = false;
        isPlayingAllowed.value = true;
      }
    } else {
      // Thread state is NOT processing locally (e.g., after page refresh).
      // Check server-side status endpoint to detect active streams we don't know about.
      await checkAndReconnectToActiveStream();
    }

    // Process any responses that arrived while user was away (e.g., slide batches)
    // This ensures messages received during background processing are displayed
    // If threadData has messages, the threadData watcher will sync them instead.
    // This avoids the race condition where processPendingResponses runs in nextTick
    // but threadData watcher has already synced the messages.
    const hasThreadData = props.threadData?.thread_messages?.length > 0;
    if (!hasThreadData) {
      console.log('[ChatContent] No threadData yet, processing pending responses');
      nextTick(() => {
        processPendingResponses();
      });
    } else if (isThreadProcessing) {
      // Thread is still processing - there might be NEW slide batches in chat.response
      // that aren't in DB yet. processPendingResponses() uses timestamp deduplication
      // to skip responses already in messageStream while processing new ones.
      console.log('[ChatContent] threadData available but thread still processing, checking for new responses');
      nextTick(() => {
        processPendingResponses();
      });
    } else {
      // Thread is complete and we have all messages from DB - skip processing
      // Set lastProcessedResponseIndex to prevent the response watcher from
      // re-processing ALL historical responses.
      const responseCount = storeConnection?.chat.response.value?.length || 0;
      setLastProcessedIndex(props.threadId, responseCount - 1);
      console.log('[ChatContent] Thread complete with threadData, skipping processPendingResponses. Set lastProcessedResponseIndex to:', getLastProcessedIndex(props.threadId));
    }

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

  // CRITICAL: Initialize store before reading thread state
  // This loads persisted thread states from localStorage (including 'processing' status for page refresh recovery)
  messageQueueStore.init();

  // Check thread state early - this affects how we display messages
  const threadStateBefore = messageQueueStore.getThreadState(props.threadId);
  const isThreadError = threadStateBefore?.status === 'error';
  const isThreadProcessing = threadStateBefore?.status === 'processing';

  // Insert messageHistory to messageStream with proper status
  messageStream.value = messageHistory.value.map(({ content, id, sender, status: dbStatus }: { content: string; id: string; sender: string | null; status?: string }, index: number) => {
    if (!sender) {
      return { ...JSON.parse(content), isUser: false, id };
    }
    // For user messages: determine status based on:
    // 1. DB status (persisted from previous session - cancelled, failed, etc.)
    // 2. If not last message, force 'sent' (has response after it = succeeded)
    // 3. Thread state fallback for last user message (processing/error state)
    const isLastMessage = index === messageHistory.value.length - 1;
    let status: string | undefined = dbStatus;

    // If message is NOT last (has response after it), it definitely succeeded
    // Override any stale 'sending'/'queued' status from DB
    if (!isLastMessage) {
      status = 'sent';
    } else if (!status) {
      // Last message without status - check thread state
      if (isThreadProcessing) {
        status = 'sent';
      } else if (isThreadError) {
        status = 'failed';
      }
      // If none of the above, leave status undefined (shows no indicator)
    }
    return { text: content, isUser: true, id, ...(status && { status }) };
  });

  // When switching to a different thread, just release our local reference
  // Do NOT disconnect - the old thread's connection stays in the pool for background processing
  if (chat.value && currentThreadId.value !== props.threadId) {
    console.log('[ChatContent] Switching threads, releasing local chat reference (NOT disconnecting)');
    chat.value = null;
    // Note: Per-thread lastProcessedResponseIndexMap handles thread-specific tracking
    // New threads start at -1 automatically via getLastProcessedIndex default
  } else if (chat.value) {
    // Same thread - just reuse existing chat instance, don't reconnect
    console.log('[ChatContent] Same thread, reusing existing chat instance');
    return;
  }

  if (props.threadId) {
    // Use useChat which manages the store connection internally
    // This ensures the connection is stored in the pool and accessible via getConnection
    try {
      // threadStateBefore and isThreadProcessing already captured above
      console.log('[ChatContent] initializeChat - thread state before connect:', threadStateBefore?.status);

      chat.value = useChat(props.threadId);
      // store.connect() already waits for connection internally via doConnect()
      // so we don't need to call waitForConnection() separately
      const connected = await chat.value.connect();
      console.log('[ChatContent] initializeChat connect() result:', connected);

      // CRITICAL: If connection failed, don't process old buffer from previous session
      // This prevents showing old slides when auth fails (expired JWT)
      // The buffer is preserved - it will be processed when connection eventually succeeds
      if (!connected) {
        console.log('[ChatContent] Connection failed, NOT processing pending responses (buffer preserved)');
        // Thread state already set to error by store's doConnect()
        return;
      }

      // Check if thread was processing in background (user returning to active thread)
      // If so, resume the loading state so user sees the indicator
      // Use the state we captured BEFORE connect, as state might have changed during async call
      const threadStateAfter = messageQueueStore.getThreadState(props.threadId);
      const isProcessing = isThreadProcessing || threadStateAfter?.status === 'processing';
      console.log('[ChatContent] initializeChat - thread state after connect:', threadStateAfter?.status, 'wasProcessing:', isThreadProcessing);

      if (isProcessing) {
        console.log('[ChatContent] Resuming processing state - backend may still be generating');
        isWaitingForResponse.value = true;
        isPlayingAllowed.value = false;
      } else {
        // Thread state is NOT processing locally (possibly after page refresh where Pinia state was lost).
        // Check server-side status endpoint to detect active streams.
        await checkAndReconnectToActiveStream();
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
      return { responses: resp, version, length: resp?.length || 0 };
    },
    ({ responses: newMessages, length: newLength }: { responses: any[] | undefined; version: number; length: number }) => {
      const threadId = props.threadId;
      const currentIndex = getLastProcessedIndex(threadId);

      // Detect buffer reset: if array is smaller than expected, reset tracking
      // This happens when clearMessages() is called before a new request
      if (newLength <= currentIndex) {
        console.log('[ChatContent] Buffer was reset (length', newLength, '<= lastProcessedIndex', currentIndex, '), resetting index for thread:', threadId);
        setLastProcessedIndex(threadId, -1);
      }

      if (newMessages && newMessages.length > 0) {
        // Process only messages we haven't processed yet
        const startIndex = getLastProcessedIndex(threadId) + 1;
        if (startIndex < newMessages.length) {
          console.log('[ChatContent] Processing messages from index:', startIndex, 'to:', newMessages.length - 1, 'for thread:', threadId);
          for (let i = startIndex; i < newMessages.length; i++) {
            handleWebSocketMessage(newMessages[i]);
            // CRITICAL: Update index IMMEDIATELY after each message to prevent duplicates.
            // If watcher triggers again mid-loop, we won't reprocess already-handled messages.
            setLastProcessedIndex(threadId, i);
          }
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

  // CRITICAL: Watch for thread state changes from the store (e.g., timeout, error, completed, cancelled)
  // This ensures the local isWaitingForResponse is reset when the store detects a terminal state,
  // allowing the user to retry after a timeout instead of being stuck.
  watch(
    () => messageQueueStore.getThreadState(props.threadId),
    (newState: { status?: string } | undefined) => {
      const terminalStates = ['error', 'completed', 'cancelled'];
      if (newState?.status && terminalStates.includes(newState.status) && isWaitingForResponse.value) {
        console.log('[ChatContent] Thread state changed to terminal state:', newState.status, '- resetting isWaitingForResponse');
        isWaitingForResponse.value = false;
        isPlayingAllowed.value = true;
        // Also reset activeStreamingMessage if still set
        if (activeStreamingMessage.value) {
          activeStreamingMessage.value = null;
          streamingProgress.value = null;
        }
      }
    },
    { deep: true }
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
  // This handles edge cases where processPendingResponses adds a message before
  // threadData arrives, preventing the watcher from losing that message.
  watch(
    () => props.threadData,
    (newThreadData) => {
      if (newThreadData?.thread_messages && props.threadId !== 'new') {
        console.log('[ChatContent] Syncing messageStream from threadData prop');
        // Set flag to prevent slides auto-open during sync
        isSyncingFromThreadData.value = true;

        // Build a set of DB message IDs for quick lookup
        const dbMessageIds = new Set(newThreadData.thread_messages.map((m: any) => m.id));

        // Build a set of DB timestamps for AI messages (to detect duplicates by timestamp)
        const dbTimestamps = new Set(
          newThreadData.thread_messages
            .filter((m: any) => !m.sender) // AI messages only
            .map((m: any) => {
              try {
                const content = JSON.parse(m.content);
                return content.timestamp?.toString();
              } catch { return null; }
            })
            .filter(Boolean)
        );

        // Collect local-only messages (failed/retried/cancelled that never made it to DB)
        const localOnlyMessages = messageStream.value.filter(
          (msg: any) => msg.isUser && ['failed', 'retried', 'cancelled'].includes(msg.status) && !dbMessageIds.has(msg.id)
        );

        // Find AI messages added by processPendingResponses that aren't in DB yet
        // These could be from chat.response but not yet persisted to DB
        const pendingAiMessages = messageStream.value.filter((msg: any) => {
          if (msg.isUser) return false; // Only AI messages
          if (dbMessageIds.has(msg.id)) return false; // Already in DB by ID
          const msgTimestamp = msg.timestamp?.toString();
          if (msgTimestamp && dbTimestamps.has(msgTimestamp)) return false; // Already in DB by timestamp
          return true; // Keep this message - it's from chat.response but not in DB yet
        });

        // Build a map of existing message statuses to preserve them
        const existingStatuses = new Map<string, string>();
        for (const msg of messageStream.value) {
          if (msg.id && msg.status) {
            existingStatuses.set(msg.id, msg.status);
          }
        }

        // Map DB messages
        const dbMessages = newThreadData.thread_messages.map((msg: any, index: number) => {
          // Priority: local status > DB status (local might be more recent)
          let status = existingStatuses.get(msg.id) || msg.status;
          if (!msg.sender) {
            return { ...JSON.parse(msg.content), isUser: false, id: msg.id };
          }
          // For user messages: force 'sent' for non-last messages (they have responses = succeeded)
          // This overrides any stale 'sending'/'queued' status from DB
          const isLastMessage = index === newThreadData.thread_messages.length - 1;
          if (!isLastMessage) {
            status = 'sent';
          }
          // Last message keeps its status (could be in progress, failed, etc.)
          // Include status from DB or local state for user messages
          return { text: msg.content, isUser: true, id: msg.id, ...(status && { status }) };
        });

        // Merge: local-only failed messages + DB messages + pending AI messages
        // Order: local failures first, then DB messages, then pending AI at end (newest)
        messageStream.value = [...localOnlyMessages, ...dbMessages, ...pendingAiMessages];

        if (pendingAiMessages.length > 0) {
          console.log('[ChatContent] Preserved', pendingAiMessages.length, 'AI messages not yet in DB');
        }

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

  // CRITICAL: Reset activeStreamingMessage when sending a NEW message.
  // This ensures new slide batches create a fresh card instead of merging with old slides.
  activeStreamingMessage.value = null;

  // Check if we need a fresh start (after cancel/timeout/error).
  // The server task context is gone after these states, so we must use startChat
  // to create a new task instead of sendUserResponse which assumes task exists.
  const needsFreshStart = messageQueueStore.getNeedsFreshStart(props.threadId);
  const shouldUseStart = isFirstMessage.value || needsFreshStart;
  const threadState = messageQueueStore.getThreadState(props.threadId);
  const storeConn = messageQueueStore.getConnection(props.threadId);

  console.log('[ChatContent] sendMessage debug:', {
    threadId: props.threadId,
    needsFreshStart,
    isFirstMessage: isFirstMessage.value,
    shouldUseStart,
    threadState: threadState?.status,
    isConnected: storeConn?.chat.isConnected.value,
    isConnecting: storeConn?.chat.isConnecting?.value,
  });

  let success: boolean;
  if (shouldUseStart) {
    console.log('[ChatContent] Calling startChat (isFirstMessage=true OR needsFreshStart=true)');
    // Clear the needsFreshStart flag before sending
    if (needsFreshStart) {
      messageQueueStore.setNeedsFreshStart(props.threadId, false);
    }
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
  } else {
    // CRITICAL: Only set 'processing' if not already in a terminal state.
    // SSE mode processes synchronously during await, so by the time startChat returns,
    // the terminal state may already be set (completed/cancelled/error).
    // Don't overwrite it with 'processing' or the loading indicator will stay visible.
    const currentState = messageQueueStore.getThreadState(props.threadId);
    const isTerminal = currentState?.status && ['completed', 'cancelled', 'error', 'timeout'].includes(currentState.status);
    if (!isTerminal) {
      messageQueueStore.setThreadState(props.threadId, { status: 'processing' });
    }
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
  console.log('[ChatContent] handleSlideBatch called with:', batchMessage);
  const { batch } = batchMessage;

  if (!batch || !batch.slides || !Array.isArray(batch.slides)) {
    console.warn('[ChatContent] Invalid batch message - missing batch or slides:', batchMessage);
    return;
  }
  console.log('[ChatContent] handleSlideBatch - valid batch with', batch.slides.length, 'slides');

  const { slides, total_slides_so_far } = batch;

  // Update thread state to indicate we have partial slides (for background processing UI)
  messageQueueStore.setThreadState(props.threadId, { hasPartialSlides: true });

  // Case 1: First batch - initialize streaming message
  if (!activeStreamingMessage.value) {
    // FIX: Check if there's already a streaming slide message in messageStream
    // This happens after page refresh - DB sync loaded the existing message but
    // activeStreamingMessage was reset by slide_generation_start event

    // First, determine the queryId for this batch to match against existing messages
    const eventQueryId = batchMessage.queryId;
    const storeQueryId = messageQueueStore.getCurrentQueryId(props.threadId);
    const queryId = eventQueryId || storeQueryId;

    // DEBUG: Log all messages to understand their structure
    console.log('[ChatContent] handleSlideBatch - no activeStreamingMessage, queryId:', queryId, 'checking existing messages:');
    messageStream.value.forEach((m: any, idx: number) => {
      console.log(`  [${idx}] id=${m.id}, isUser=${m.isUser}, isStreaming=${m.isStreaming}, status=${m.status}, hasSlides=${!!m.slides}, slidesCount=${m.slides?.length || 0}`);
    });

    // Look for existing slide message to link to (must match current queryId)
    // After page refresh, the DB-loaded message may have status=completed but we should
    // still append new slides to it instead of creating a duplicate
    // CRITICAL: Only match if the message ID equals the current queryId, otherwise
    // we might link new slides to a completely different message's slide card!
    const existingSlideIndex = messageStream.value.findIndex(
      (m: any) => {
        // Must be an AI message with slides
        if (m.isUser) return false;
        if (!m.slides || m.slides.length === 0) return false;
        // Must match the current query's ID (if we have one)
        if (queryId && m.id !== queryId) return false;
        return true;
      }
    );

    if (existingSlideIndex !== -1) {
      // Found existing slide message - link to it instead of creating new
      const existingMessage = messageStream.value[existingSlideIndex] as any;
      console.log('[ChatContent] Found existing slide message at index:', existingSlideIndex, 'with', existingMessage.slides?.length, 'slides - linking instead of creating new');

      // Initialize activeStreamingMessage to point to existing
      activeStreamingMessage.value = {
        id: existingMessage.id,
        messageIndex: existingSlideIndex,
        totalSlides: existingMessage.slides?.length || 0,
        contentType: existingMessage.contentType || (slides[0]?.type === 'question' ? 'quiz' : 'lesson'),
        startTime: Date.now(),
      };

      // Mark existing message as streaming again since we're appending
      existingMessage.isStreaming = true;
      existingMessage.status = 'streaming';
      isWaitingForResponse.value = true;

      // IMPORTANT: Don't return here! Fall through to Case 2 to process this batch.
      // The batch might contain NEW slides that weren't saved to DB yet (e.g., user
      // clicked away while streaming and came back - buffered events have new slides).
      // Case 2's deduplication logic will skip slides already in the message.
    } else {
      // No existing slide message - create new one (original logic)
      const contentType = slides[0]?.type === 'question' ? 'quiz' : 'lesson';

      // Use queryId (already determined above) as the message ID
      const newMessageId = queryId || crypto.randomUUID();
      console.log('[ChatContent] Creating new slide message with queryId:', { eventQueryId, storeQueryId, final: newMessageId });
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
      console.log('[ChatContent] Added new slide message to messageStream at index:', messageIndex, 'total messages:', messageStream.value.length, 'slides in message:', newMessage.slides.length);

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

      return;
    }
  }

  // Case 2: Subsequent batches - append to existing message

  const messageIndex = activeStreamingMessage.value.messageIndex;
  const existingMessage = messageStream.value[messageIndex];

  if (!existingMessage) {
    console.error('Streaming message not found at index:', messageIndex);
    return;
  }

  // DEDUPLICATION: Only append slides that are truly new
  // After page refresh, the existing message may already have some slides from DB.
  // Buffered events may include slides we already have, so skip them.
  const existingCount = existingMessage.slides?.length || 0;
  if (total_slides_so_far <= existingCount) {
    console.log('[ChatContent] Skipping slide batch - already have', existingCount, 'slides, batch total_slides_so_far:', total_slides_so_far);
    return;
  }

  // Calculate how many slides from this batch are actually new
  // For example: existing has 2 slides, batch has 1 slide with total_so_far=3 → append 1 slide
  // Or: existing has 1 slide, batch has 1 slide with total_so_far=1 → append 0 slides (skip)
  let slidesToAdd = slides.slice(-(total_slides_so_far - existingCount));
  if (slidesToAdd.length === 0) {
    console.log('[ChatContent] No new slides to add after count-based deduplication');
    return;
  }

  // CONTENT-BASED DEDUPLICATION: Filter out slides that already exist by title
  // This catches edge cases where count-based dedup passes but content is duplicated
  const existingTitles = new Set(
    (existingMessage.slides || []).map((s: any) => s.title?.toLowerCase().trim())
  );
  const originalCount = slidesToAdd.length;
  slidesToAdd = slidesToAdd.filter((slide: any) => {
    const title = slide.title?.toLowerCase().trim();
    if (!title) return true; // Keep slides without titles
    if (existingTitles.has(title)) {
      console.log('[ChatContent] Skipping duplicate slide by title:', title);
      return false;
    }
    existingTitles.add(title); // Prevent duplicates within the batch too
    return true;
  });

  if (slidesToAdd.length === 0) {
    console.log('[ChatContent] No new slides to add after content-based deduplication (filtered', originalCount, 'slides)');
    return;
  }

  console.log('[ChatContent] Appending', slidesToAdd.length, 'new slides (existing:', existingCount, ', batch total:', total_slides_so_far, ', filtered:', originalCount - slidesToAdd.length, ')');

  // Append only new slides to existing message
  existingMessage.slides = [...existingMessage.slides, ...slidesToAdd];

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

    // Check dedup before saving - slides may have been saved by slide_generation_complete
    const queryId = messageQueueStore.getCurrentQueryId(props.threadId);
    if (queryId) {
      const dedupKey = `slides_${props.threadId}_${queryId}`;
      const shouldSave = messageQueueStore.markResponseAsSaving(props.threadId, dedupKey);
      if (!shouldSave) {
        console.log('[ChatContent] handleStreamingComplete: Slides already saved, skipping');
      } else {
        // Save with updated status (slides already saved incrementally)
        saveMessageAsync({
          thread_id: props.threadId,
          content: streamingMessage,
          type: 'json',
          isUser: false,
          uuid: streamingMessage.id
        });
      }
    } else {
      // No queryId - fallback save (shouldn't happen normally)
      console.warn('[ChatContent] handleStreamingComplete: No queryId, saving anyway');
      saveMessageAsync({
        thread_id: props.threadId,
        content: streamingMessage,
        type: 'json',
        isUser: false,
        uuid: streamingMessage.id
      });
    }
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
  console.log('[ChatContent] handleWebSocketMessage:', message.status || message.type, 'type:', message.type, 'status:', message.status, 'isSendingMessage:', isSendingMessage.value);

  // Any valid response means our message was received - mark as sent and notify parent
  // Include status_update because it proves the server received our message and is processing
  if (message.status && message.status !== 'heartbeat') {
    markLastUserMessageSent();
    emit('responseReceived');
  }

  // Handle slide generation start - reset streaming state for new session
  // Since slides are only saved to DB on completion, no need to delete anything.
  // Just reset the activeStreamingMessage so new batches create a fresh card.
  if (message.type === 'slide_generation_start') {
    console.log('[ChatContent] New slide generation session starting');
    activeStreamingMessage.value = null;
    isWaitingForResponse.value = true;
    return;
  }

  // Handle slide generation complete - mark streaming as done and save to DB
  if (message.type === 'slide_generation_complete') {
    console.log('[ChatContent] Slide generation complete');

    // Mark active streaming message as complete and SAVE to DB (bundled)
    if (activeStreamingMessage.value) {
      const messageIndex = activeStreamingMessage.value.messageIndex;
      const streamingMessage = messageStream.value[messageIndex];
      if (streamingMessage) {
        streamingMessage.isStreaming = false;
        streamingMessage.status = 'completed';

        // CRITICAL: Mark slides as saved BEFORE saving to prevent duplicates from:
        // 1. The 'completed' status handler (handleStreamingComplete)
        // 2. messageQueue.saveSlidesFromBuffer (background save)
        // Use the current queryId as dedup key (same as messageQueue uses)
        const queryId = messageQueueStore.getCurrentQueryId(props.threadId);
        if (queryId) {
          const dedupKey = `slides_${props.threadId}_${queryId}`;
          messageQueueStore.markResponseAsSaving(props.threadId, dedupKey);
          console.log('[ChatContent] Marked slides as saved with dedupKey:', dedupKey);
        }

        // Save the bundled slides to DB (only on completion)
        console.log('[ChatContent] Saving bundled slides to DB:', streamingMessage.id, 'slides:', streamingMessage.slides?.length);
        saveMessageAsync({
          thread_id: props.threadId,
          content: streamingMessage,
          type: 'json',
          isUser: false,
          uuid: streamingMessage.id
        });

        messageStream.value = [...messageStream.value]; // Trigger reactivity
      }

      // CRITICAL: Clear streaming state so 'completed' handler doesn't save again
      activeStreamingMessage.value = null;
      streamingProgress.value = null;
    }

    return;
  }

  // Route slide batch messages
  if (message.type === 'slide_batch_ready') {
    console.log('[ChatContent] slide_batch_ready received, batch:', message.batch, 'slides count:', message.batch?.slides?.length);

    // Determine if this batch should be processed or skipped.
    // We skip ONLY if it's truly a historical replay of already-displayed slides.
    const isActivelyProcessing = isWaitingForResponse.value || activeStreamingMessage.value;
    console.log('[ChatContent] isActivelyProcessing:', isActivelyProcessing, 'isWaitingForResponse:', isWaitingForResponse.value, 'activeStreamingMessage:', !!activeStreamingMessage.value);

    if (!isActivelyProcessing) {
      // Not actively processing - check if this batch's slides already exist
      const batchSlides = message.batch?.slides || [];
      const firstSlideId = batchSlides[0]?.id;

      // Check if this slide is already in messageStream
      const slideAlreadyExists = firstSlideId && messageStream.value.some(
        (m: any) => m.slides?.some((s: any) => s.id === firstSlideId)
      );

      if (slideAlreadyExists) {
        console.log('[ChatContent] Skipping historical slide_batch_ready - slide already in messageStream:', firstSlideId);
        return;
      }

      // New slides arriving while not "actively processing" - this can happen when
      // returning to a thread where a second request is still processing on backend.
      // Process these slides and set isWaitingForResponse to show loading indicator.
      console.log('[ChatContent] Processing NEW slide batch (not actively processing but slides are new)');
      isWaitingForResponse.value = true;
    }

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
    // CRITICAL: Use markResponseAsSaving() to atomically check-and-mark before saving.
    // This prevents race conditions where both store watcher and ChatContent watcher
    // try to save the same response simultaneously.
    const shouldSave = messageQueueStore.markResponseAsSaving(props.threadId, message.timestamp);

    if (!shouldSave) {
      console.log('[ChatContent] Response already marked for saving, skipping DB save');
    }

    // MERGE summary text into slides message from CURRENT streaming session only.
    // Only merge if we have an active streaming session - this prevents overwriting
    // seeded lesson messages when the AI responds with just text (no new slides).
    const activeId = activeStreamingMessage.value?.id;
    const existingSlidesMessage = activeId ?
        messageStream.value.find((msg: any) => msg.id === activeId) :
      null;

    if (existingSlidesMessage && existingSlidesMessage.id) {
      // Merge: add summary text to existing slides message
      console.log('[ChatContent] Merging user_message into existing slides message:', existingSlidesMessage.id);
      existingSlidesMessage.message = message.message;
      existingSlidesMessage.status = 'user_message';
      existingSlidesMessage.timestamp = message.timestamp;

      // Trigger reactivity
      messageStream.value = [...messageStream.value];

      // Update the existing DB record with the merged content (upsert by id)
      if (shouldSave) {
        saveMessageAsync({
          thread_id: props.threadId,
          content: existingSlidesMessage,
          type: 'json',
          isUser: false,
          uuid: existingSlidesMessage.id
        });
      }
    } else {
      // No slides message to merge with - create standalone text message
      console.log('[ChatContent] No slides message found, creating standalone text message');
      const cleanMessage = {
        message: message.message,
        status: 'user_message',
        timestamp: message.timestamp
      };

      if (shouldSave) {
        const newUuid = crypto.randomUUID();
        messageQueueStore.trackLocalMessage(newUuid);

        addMessage({
          thread_id: props.threadId,
          content: JSON.stringify(cleanMessage),
          type: 'json',
          isUser: false,
          uuid: newUuid
        });
        messageStream.value.push({ ...cleanMessage, id: newUuid });
      } else {
        const displayUuid = crypto.randomUUID();
        messageStream.value.push({ ...cleanMessage, id: displayUuid });
      }
    }

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
    console.log('[ChatContent] Terminal state received:', message.status, '- resetting isFirstMessage and closing connection', {
      ready_for_new_message: message.ready_for_new_message,
      tokens_saved: message.tokens_saved,
    });
    // If we have streaming slides, mark as complete and SAVE to DB
    // This handles the case where slides were received but slide_generation_complete never arrived
    if (activeStreamingMessage.value) {
      const messageIndex = activeStreamingMessage.value.messageIndex;
      const streamingMessage = messageStream.value[messageIndex];
      if (streamingMessage && streamingMessage.slides?.length > 0) {
        streamingMessage.status = 'completed';
        streamingMessage.isStreaming = false;

        // Check dedup before saving - slides may have been saved by slide_generation_complete
        const queryId = messageQueueStore.getCurrentQueryId(props.threadId);
        if (queryId) {
          const dedupKey = `slides_${props.threadId}_${queryId}`;
          const shouldSave = messageQueueStore.markResponseAsSaving(props.threadId, dedupKey);
          if (!shouldSave) {
            console.log('[ChatContent] Terminal state: Slides already saved, skipping');
          } else {
            console.log('[ChatContent] Saving slides on terminal state:', streamingMessage.id, 'slides:', streamingMessage.slides.length);
            saveMessageAsync({
              thread_id: props.threadId,
              content: streamingMessage,
              type: 'json',
              isUser: false,
              uuid: streamingMessage.id
            });
          }
        } else {
          // No queryId - fallback save
          console.log('[ChatContent] Saving slides on terminal state (no queryId):', streamingMessage.id, 'slides:', streamingMessage.slides.length);
          saveMessageAsync({
            thread_id: props.threadId,
            content: streamingMessage,
            type: 'json',
            isUser: false,
            uuid: streamingMessage.id
          });
        }
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

    // CRITICAL: Close the WebSocket connection on terminal state.
    // The server closes its end after sending terminal status (completed/cancelled/timeout/error).
    // If we don't close the client side, the WebSocket enters a "half-open" state where
    // ws.readyState === OPEN but the server won't receive any messages we send.
    // By closing here, the next message will create a fresh connection.
    console.log('[ChatContent] Terminal state received, closing connection to prevent zombie state');
    messageQueueStore.closeConnection(props.threadId);
    chat.value = null;

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

    // CRITICAL: Reset local isWaitingForResponse so loading indicator stops.
    // The showLoading computed checks this local ref, not just the store's state.
    isWaitingForResponse.value = false;
    isPlayingAllowed.value = true;

    // Reset lastProcessedResponseIndex so future responses can be processed
    // Note: Response buffer is cleared when connection is closed above
    setLastProcessedIndex(props.threadId, -1);
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

  // SAFETY: If thread is in a terminal state, reset stuck flags before the guard.
  // This handles cases where the watcher didn't trigger (e.g., hot reload, race conditions).
  const currentThreadState = messageQueueStore.getThreadState(props.threadId);
  if (currentThreadState?.status && ['error', 'completed', 'cancelled'].includes(currentThreadState.status)) {
    if (isWaitingForResponse.value || isSendingMessage.value) {
      console.log('[ChatContent] Thread in terminal state, resetting stuck flags:', currentThreadState.status);
      isWaitingForResponse.value = false;
      isSendingMessage.value = false;
    }
  }

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
    uuid: messageUuid,
    status: 'sending' as const
  };
  addMessage(addMessageObj);

  // Determine initial status based on connection state
  const isConnectedNow = chat.value?.isConnected.value || false;
  console.log('[ChatContent] isConnectedNow:', isConnectedNow, 'chat.value:', !!chat.value, 'isFirstMessage:', isFirstMessage.value);

  const initialStatus = isConnectedNow ? 'sending' : 'queued';
  messageStream.value.push({ type: 'text', text, isUser: true, id: messageUuid, status: initialStatus });

  // Helper to update message status by index (also persists to DB for failed status)
  const updateStatus = (status: 'sending' | 'sent' | 'failed') => {
    const idx = messageStream.value.findIndex((m: { id?: string }) => m.id === messageUuid);
    if (idx !== -1) {
      messageStream.value[idx] = { ...messageStream.value[idx], status };
    }
    // Persist failed status to database so it shows after page refresh
    if (status === 'failed') {
      persistMessageStatus(messageUuid, 'failed').catch((err: Error) => {
        console.error('[ChatContent] Failed to persist message status:', err);
      });
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
    let sendResult = await sendMessage(text);
    console.log('[ChatContent] sendMessage result:', sendResult);

    // If send failed, connection might be stale - try to reconnect and resend
    if (!sendResult && !wasAlreadyCancelled()) {
      console.log('[ChatContent] Send failed, connection might be stale - trying reconnect');
      try {
        // Close stale connection and recreate
        await messageQueueStore.closeConnection(props.threadId);
        chat.value = null;
        chat.value = useChat(props.threadId);

        const reconnected = await chat.value?.connect();
        if (reconnected) {
          console.log('[ChatContent] Reconnected, retrying send');
          sendResult = await sendMessage(text, true);
        }
      } catch (err) {
        console.error('[ChatContent] Reconnect attempt failed:', err);
      }

      // If still failed after reconnect attempt
      if (!sendResult && !wasAlreadyCancelled()) {
        updateStatus('failed');
        isPlayingAllowed.value = true;
        isWaitingForResponse.value = false;
      }
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
      // If thread is in terminal state (error, cancelled, completed), close old connection first
      // to ensure fresh reconnect. Without this, stale WebSocket connections block new messages.
      const threadState = messageQueueStore.getThreadState(props.threadId);
      const staleConn = messageQueueStore.getConnection(props.threadId);
      const isTerminalState = threadState?.status && ['error', 'cancelled', 'completed'].includes(threadState.status);
      if (isTerminalState && staleConn && !staleConn.chat.isConnected.value) {
        console.log('[ChatContent] Closing stale connection before reconnect (thread in terminal state):', threadState?.status);
        await messageQueueStore.closeConnection(props.threadId);
        chat.value = null;
      }

      // CRITICAL: Recreate chat reference if it's null/falsy
      // This happens after first message completes and connection is closed
      if (!chat.value) {
        console.log('[ChatContent] Recreating chat reference (was null after connection closed)');
        chat.value = useChat(props.threadId);
      }

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
  let cancelledMessageId: string | null = null;
  for (let i = messageStream.value.length - 1; i >= 0; i--) {
    const msg = messageStream.value[i];
    if (msg.isUser && ['sending', 'queued', 'sent'].includes(msg.status)) {
      console.log('[ChatContent] Marking message as cancelled via handleCancelRequest, id:', msg.id);
      messageStream.value[i] = { ...msg, status: 'cancelled' };
      messageStream.value = [...messageStream.value];
      cancelledMessageId = msg.id;
      break;
    }
  }

  // CRITICAL: Persist cancelled status to database so it survives page refresh
  // Without this, returning to the chat shows "Sending..." forever
  if (cancelledMessageId) {
    persistMessageStatus(cancelledMessageId, 'cancelled').catch((err) => {
      console.error('[ChatContent] Failed to persist cancelled status:', err);
    });
  }

  // Reset loading state immediately
  isWaitingForResponse.value = false;

  // CRITICAL: Reset activeStreamingMessage immediately to stop "generating more slides" indicator.
  // The server may close the WebSocket before the 'cancelled' response arrives,
  // so we can't rely on handleWebSocketMessage to reset this.
  if (activeStreamingMessage.value) {
    const messageIndex = activeStreamingMessage.value.messageIndex;
    const streamingMessage = messageStream.value[messageIndex];
    if (streamingMessage) {
      // Mark as cancelled (not completed) and stop streaming indicator
      streamingMessage.isStreaming = false;
      streamingMessage.status = 'cancelled';
      messageStream.value = [...messageStream.value]; // Trigger reactivity

      // CRITICAL: Save any slides that were already generated to DB
      // Without this, slides are lost when user navigates away after cancel
      if (streamingMessage.slides?.length > 0) {
        console.log('[ChatContent] Saving cancelled slides to DB:', streamingMessage.id, 'slides:', streamingMessage.slides.length);
        saveMessageAsync({
          thread_id: props.threadId,
          content: streamingMessage,
          type: 'json',
          isUser: false,
          uuid: streamingMessage.id
        });
      }
    }
    activeStreamingMessage.value = null;
    streamingProgress.value = null;
  }

  // CRITICAL: Update thread state to 'cancelled' IMMEDIATELY
  // This ensures the state persists even if:
  // 1. User navigates away before cancel response arrives
  // 2. WebSocket closes before cancel response arrives
  // 3. HMR/page reload happens
  // Without this, returning to the thread would show "processing" forever
  messageQueueStore.setThreadState(props.threadId, {
    status: 'cancelled',
    responsePhase: '',
  });

  // Mark that next message needs fresh start (task context is gone after cancel)
  messageQueueStore.setNeedsFreshStart(props.threadId, true);

  // Then call the actual cancel on the chat connection (best effort)
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

  // IMPORTANT: Close the old connection before retrying to ensure fresh reconnect
  // After timeout/error, the old connection may be in a bad state
  const existingConn = messageQueueStore.getConnection(props.threadId);
  if (existingConn && !existingConn.chat.isConnected.value) {
    console.log('[ChatContent] Closing stale connection before retry');
    await messageQueueStore.closeConnection(props.threadId);
    chat.value = null;
  }

  // CRITICAL: Recreate chat reference before calling handleSend
  // If chat.value is null (we just closed stale connection), handleSend's
  // chat.value?.connect() would fail since chat.value is null
  if (!chat.value) {
    console.log('[ChatContent] Recreating chat reference for retry');
    chat.value = useChat(props.threadId);
  }

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

  // Reset response tracking for current thread
  setLastProcessedIndex(props.threadId, -1);

  // NOTE: We intentionally do NOT clear thread state or disconnect here.
  // When switching threads or starting new chat, the old thread's connection
  // should stay alive in the pool for background processing.
  // The connection pool handles cleanup via idle timeout.
  // Thread state is preserved so user can return and see processing status.

  // Just reset the local chat reference (don't disconnect - pool manages it)
  chat.value = null;

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
