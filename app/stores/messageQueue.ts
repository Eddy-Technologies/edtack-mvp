import { defineStore } from 'pinia';
import { watch, effectScope, type EffectScope } from 'vue';
import { useChatConnection } from '~/composables/useChat';
import type { ChatResponse } from '~/composables/chat.types';
import {
  type ThreadState,
  type ThreadStatus,
  type QueuedMessage,
  type CachedMessage,
  getAllThreadStates,
  setThreadState as persistThreadState,
  removeThreadState,
  getPendingMessages,
  addPendingMessage,
  updatePendingMessage,
  removePendingMessage,
  getCachedMessages,
  addCachedMessage,
  clearCachedMessages,
  initPersistenceService,
} from '~/services/persistenceService';
import { saveMessageToDB } from '~/utils/messageApi';

export type { ThreadState, ThreadStatus, QueuedMessage, CachedMessage };

// Connection pool types
interface PooledConnection {
  threadId: string;
  mode: 'websocket' | 'sse';
  chat: ReturnType<typeof useChatConnection>;
  createdAt: number;
  lastActivity: number;
}

const MAX_CONNECTIONS = 50;
const CONNECTION_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes idle timeout
const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes processing timeout (for silent failures)
const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes grace period after timeout for late responses
const CANCEL_WAIT_MS = 2 * 60 * 1000; // 2 minutes to wait for cancel response

// Store connections OUTSIDE Pinia state to avoid ref unwrapping issues
// Pinia's reactivity unwraps refs, which breaks the WebSocket chat refs
const connectionPool: Record<string, PooledConnection> = {};
const pendingConnectionPromises: Record<string, Promise<boolean>> = {};

// Store watcher scopes outside Pinia state - these need to be detached from component lifecycle
// so watchers continue running even when the chat component unmounts
const watcherScopes: Record<string, EffectScope> = {};

export const useMessageQueueStore = defineStore('messageQueue', {
  state: () => ({
    // Thread states (memory cache, backed by localStorage)
    threadStates: {} as Record<string, ThreadState>,

    // Message cache per thread (memory cache)
    messageCache: {} as Record<string, CachedMessage[]>,

    // Trigger for connection reactivity (increment to force re-render)
    connectionVersion: 0,

    // Trigger for response reactivity per thread (increment when responses arrive)
    // Key is threadId, value is version counter
    responseVersions: {} as Record<string, number>,

    // Track locally-sent message UUIDs for deduplication (non-reactive, internal use)
    localMessageIds: new Set<string>(),

    // Processing timeout timers per thread (non-reactive, internal use)
    processingTimeouts: {} as Record<string, ReturnType<typeof setTimeout>>,

    // Grace period cancel check timers per thread (non-reactive, internal use)
    graceCheckTimeouts: {} as Record<string, ReturnType<typeof setTimeout>>,

    // Track saved AI response UUIDs per thread to prevent duplicate saves
    // Key is threadId, value is Set of response timestamps (as strings)
    savedResponseUuids: {} as Record<string, Set<string>>,

    // Initialization flag
    initialized: false,
  }),

  getters: {
    getThreadState: (state) => (threadId: string): ThreadState | null => {
      return state.threadStates[threadId] || null;
    },

    isProcessing: (state) => (threadId: string): boolean => {
      const ts = state.threadStates[threadId];
      return ts?.status === 'processing' || ts?.status === 'connecting';
    },

    getCachedMessages: (state) => (threadId: string): CachedMessage[] => {
      return state.messageCache[threadId] || [];
    },

    getConnection: (state) => (threadId: string): PooledConnection | undefined => {
      // Access connectionVersion to ensure reactivity when connections change
      void state.connectionVersion;
      return connectionPool[threadId];
    },

    activeConnectionCount: (state): number => {
      void state.connectionVersion;
      return Object.keys(connectionPool).length;
    },

    // Expose connectionPool for direct access in components
    connections: (state) => {
      void state.connectionVersion;
      return connectionPool;
    },
  },

  actions: {
    /**
     * Initialize the store - load from localStorage
     */
    init() {
      if (this.initialized) return;

      initPersistenceService();

      // Load thread states from localStorage
      const persistedStates = getAllThreadStates();
      this.threadStates = persistedStates;

      // Load cached messages for threads that are processing
      for (const threadId of Object.keys(persistedStates)) {
        const state = persistedStates[threadId];
        if (state.status === 'processing') {
          this.messageCache[threadId] = getCachedMessages(threadId);
        }
      }

      this.initialized = true;
    },

    /**
     * Set thread state and persist to localStorage
     */
    setThreadState(threadId: string, updates: Partial<ThreadState>) {
      const current = this.threadStates[threadId] || {
        threadId,
        status: 'idle' as ThreadStatus,
        lastUpdated: Date.now(),
        pendingMessageCount: 0,
      };

      const newState: ThreadState = {
        ...current,
        ...updates,
        lastUpdated: Date.now(),
      };

      this.threadStates[threadId] = newState;
      persistThreadState(newState);

      // Manage processing timeout
      this.manageProcessingTimeout(threadId, current.status, newState.status);
    },

    /**
     * Manage processing timeout for a thread
     * Starts timeout when entering 'processing', clears on end states
     */
    manageProcessingTimeout(threadId: string, oldStatus: ThreadStatus, newStatus: ThreadStatus) {
      const endStates: ThreadStatus[] = ['idle', 'completed', 'cancelled', 'error'];

      // Clear existing timeout if moving to end state
      if (endStates.includes(newStatus)) {
        const existingTimeout = this.processingTimeouts[threadId];
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          Reflect.deleteProperty(this.processingTimeouts, threadId);
        }
        return;
      }

      // Start timeout when entering 'processing' (not when already processing)
      if (newStatus === 'processing' && oldStatus !== 'processing') {
        // Clear any existing timeout first
        const existingTimeout = this.processingTimeouts[threadId];
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Start new timeout
        const timeoutId = setTimeout(() => {
          this.handleProcessingTimeout(threadId);
        }, PROCESSING_TIMEOUT_MS);

        this.processingTimeouts[threadId] = timeoutId;
      }
    },

    /**
     * Handle processing timeout - set to error state with grace period
     */
    handleProcessingTimeout(threadId: string) {
      const state = this.threadStates[threadId];
      if (!state || state.status !== 'processing') {
        // Already completed or not processing
        return;
      }

      console.warn(`[MessageQueue] Processing timeout for thread ${threadId}`);

      // Set error state with grace deadline for late response recovery
      const graceDeadline = Date.now() + GRACE_PERIOD_MS;
      this.setThreadState(threadId, {
        status: 'error',
        error: 'Request timed out - no response received',
        errorGraceDeadline: graceDeadline,
      });

      // Clean up timeout reference
      Reflect.deleteProperty(this.processingTimeouts, threadId);

      // Schedule cancel health check after grace period
      const graceCheckId = setTimeout(() => {
        this.sendCancelHealthCheck(threadId);
      }, GRACE_PERIOD_MS);
      this.graceCheckTimeouts[threadId] = graceCheckId;
    },

    /**
     * Reset processing timeout (call on any activity like slide batches)
     */
    resetProcessingTimeout(threadId: string) {
      const existingTimeout = this.processingTimeouts[threadId];
      if (existingTimeout) {
        clearTimeout(existingTimeout);

        const newTimeoutId = setTimeout(() => {
          this.handleProcessingTimeout(threadId);
        }, PROCESSING_TIMEOUT_MS);

        this.processingTimeouts[threadId] = newTimeoutId;
      }
    },

    /**
     * Send cancel request as health check after grace period.
     * If no 'cancelled' response is received, connection is assumed dead.
     */
    sendCancelHealthCheck(threadId: string) {
      const state = this.threadStates[threadId];

      // Already recovered or cleaned up
      if (!state || state.status !== 'error') {
        Reflect.deleteProperty(this.graceCheckTimeouts, threadId);
        return;
      }

      const conn = connectionPool[threadId];
      if (!conn) {
        // Connection already cleaned up
        Reflect.deleteProperty(this.graceCheckTimeouts, threadId);
        return;
      }

      console.log(`[MessageQueue] Sending cancel health check for thread ${threadId}`);

      // Send cancel request
      conn.chat.cancelRequest();

      // Wait for cancel response
      setTimeout(() => {
        const currentState = this.threadStates[threadId];

        // If still in error state after cancel wait, connection is dead
        if (currentState?.status === 'error') {
          console.error(`[MessageQueue] Connection dead for thread ${threadId} - no cancel response received`);

          // Close the dead connection
          this.closeConnection(threadId);

          // Update error message to indicate connection loss
          this.setThreadState(threadId, {
            status: 'error',
            error: 'Connection lost - response may have been lost',
            errorGraceDeadline: undefined, // Clear grace deadline
          });
        }

        // Clean up grace check timer reference
        Reflect.deleteProperty(this.graceCheckTimeouts, threadId);
      }, CANCEL_WAIT_MS);
    },

    /**
     * Clear grace check timeout for a thread (call when state recovers)
     */
    clearGraceCheckTimeout(threadId: string) {
      const existingTimeout = this.graceCheckTimeouts[threadId];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        Reflect.deleteProperty(this.graceCheckTimeouts, threadId);
      }
    },

    /**
     * Clear thread state
     */
    clearThreadState(threadId: string) {
      Reflect.deleteProperty(this.threadStates, threadId);
      Reflect.deleteProperty(this.messageCache, threadId);
      removeThreadState(threadId);
    },

    /**
     * Check if a message ID originated from this device
     */
    isLocalMessage(messageId: string): boolean {
      return this.localMessageIds.has(messageId);
    },

    /**
     * Track a local message ID for deduplication
     */
    trackLocalMessage(messageId: string) {
      this.localMessageIds.add(messageId);
      // Clean up old IDs after 1 hour
      setTimeout(() => {
        this.localMessageIds.delete(messageId);
      }, 60 * 60 * 1000);
    },

    /**
     * Add message to cache (from WebSocket/SSE or Realtime)
     */
    addMessageToCache(threadId: string, message: CachedMessage) {
      if (!this.messageCache[threadId]) {
        this.messageCache[threadId] = [];
      }

      // Check for duplicates
      if (this.messageCache[threadId].some((m) => m.id === message.id)) {
        return;
      }

      this.messageCache[threadId].push(message);
      addCachedMessage(message);
    },

    /**
     * Add message from Supabase Realtime (cross-device sync)
     */
    addMessageFromRealtime(threadId: string, dbMessage: any) {
      // Skip if this message was sent from this device
      if (this.isLocalMessage(dbMessage.id)) {
        return;
      }

      const cached: CachedMessage = {
        id: dbMessage.id,
        threadId: threadId,
        content: typeof dbMessage.content === 'string' ? dbMessage.content : JSON.stringify(dbMessage.content),
        type: dbMessage.type || 'text',
        isUser: dbMessage.is_user ?? false,
        createdAt: new Date(dbMessage.created_at).getTime(),
      };

      this.addMessageToCache(threadId, cached);
    },

    /**
     * Clear message cache for a thread
     */
    clearMessageCache(threadId: string) {
      Reflect.deleteProperty(this.messageCache, threadId);
      clearCachedMessages(threadId);
    },

    /**
     * Save an AI response to the database.
     * Called from handleChatResponse to persist responses even when ChatContent is unmounted.
     *
     * IMPORTANT: Uses synchronous check-and-mark pattern to prevent race conditions.
     * Multiple watcher triggers can call this simultaneously, so we must mark as
     * "saving" BEFORE the async save to prevent duplicates.
     */
    async saveAIResponse(threadId: string, response: ChatResponse): Promise<boolean> {
      // Create dedup key from timestamp - this is our unique identifier
      const key = response.timestamp?.toString();
      if (!key) {
        console.warn('[MessageQueue] Cannot save AI response without timestamp');
        return false;
      }

      // Initialize Set if needed
      if (!this.savedResponseUuids[threadId]) {
        this.savedResponseUuids[threadId] = new Set();
      }

      // SYNCHRONOUS CHECK: Already saved or save in progress?
      // This prevents race conditions where multiple watcher triggers try to save
      if (this.savedResponseUuids[threadId].has(key)) {
        console.log('[MessageQueue] Response already saved/saving, skipping:', key);
        return true; // Already handled
      }

      // SYNCHRONOUS MARK: Reserve this key BEFORE async save
      // This ensures other concurrent calls see this response is being handled
      this.savedResponseUuids[threadId].add(key);

      console.log('[MessageQueue] Saving AI response to DB:', { threadId, key });

      // Generate UUID for the database record
      const uuid = crypto.randomUUID();
      this.trackLocalMessage(uuid); // Prevent Realtime sync from re-adding this message

      const content = {
        message: response.message,
        status: 'user_message',
        timestamp: response.timestamp,
      };

      const result = await saveMessageToDB({
        thread_id: threadId,
        content,
        type: 'json',
        isUser: false,
        uuid,
      });

      if (!result.success) {
        // Remove from tracking on failure so retry can work
        this.savedResponseUuids[threadId].delete(key);
        console.error('[MessageQueue] Failed to save AI response:', result.error);
        return false;
      }

      console.log('[MessageQueue] AI response saved successfully:', { threadId, key });
      return true;
    },

    /**
     * Mark pending user messages as 'sent' for a thread.
     * Called when we receive a meaningful response (slides or AI message).
     */
    markUserMessageSent(threadId: string) {
      const pending = getPendingMessages(threadId);
      if (!pending || pending.length === 0) return;

      let hasUpdates = false;
      for (const msg of pending) {
        if (msg.status === 'sending') {
          updatePendingMessage(threadId, msg.uuid, { status: 'sent' });
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        console.log('[MessageQueue] Marked user messages as sent for thread:', threadId);
      }
    },

    /**
     * Check if an AI response has already been saved to DB by the store.
     * Used by ChatContent to avoid duplicate saves.
     */
    isResponseSaved(threadId: string, timestamp: number | string | undefined): boolean {
      if (!timestamp) return false;
      const saved = this.savedResponseUuids[threadId];
      if (!saved) return false;
      return saved.has(timestamp.toString());
    },

    /**
     * Mark a response as "being saved" to prevent duplicate saves.
     * This MUST be called synchronously BEFORE any async save operation.
     *
     * Used by ChatContent when it saves a response (prevents store from also saving).
     * Returns true if successfully marked (caller should proceed with save),
     * returns false if already marked (caller should skip save).
     */
    markResponseAsSaving(threadId: string, timestamp: number | string | undefined): boolean {
      if (!timestamp) return false;

      const key = timestamp.toString();

      // Initialize Set if needed
      if (!this.savedResponseUuids[threadId]) {
        this.savedResponseUuids[threadId] = new Set();
      }

      // Already marked? Return false so caller knows to skip
      if (this.savedResponseUuids[threadId].has(key)) {
        console.log('[MessageQueue] markResponseAsSaving: already marked, returning false for:', key);
        return false;
      }

      // Mark synchronously
      this.savedResponseUuids[threadId].add(key);
      console.log('[MessageQueue] markResponseAsSaving: marked for:', key);
      return true;
    },

    /**
     * Stop RAG processing for a thread to conserve tokens.
     * Called when errors occur during processing.
     */
    async doStopRAGProcessing(threadId: string): Promise<boolean> {
      const conn = connectionPool[threadId];
      if (!conn) {
        console.log('[MessageQueue] No connection to stop for thread:', threadId);
        return false;
      }

      console.log('[MessageQueue] Stopping RAG processing for thread:', threadId);

      // Call cancelRequest which handles both client-side abort and server-side /stop endpoint
      const result = await conn.chat.cancelRequest();
      console.log('[MessageQueue] RAG processing stop result:', result);

      return result;
    },

    /**
     * Get or create a connection from the pool
     */
    async getOrCreateConnection(threadId: string): Promise<PooledConnection> {
      // Check if connection exists
      let conn = connectionPool[threadId];
      if (conn) {
        conn.lastActivity = Date.now();
        return conn;
      }

      // Enforce connection limit
      const connectionCount = Object.keys(connectionPool).length;
      if (connectionCount >= MAX_CONNECTIONS) {
        this.cleanupIdleConnections();

        // If still at limit, remove oldest
        if (Object.keys(connectionPool).length >= MAX_CONNECTIONS) {
          const oldest = this.findOldestConnection();
          if (oldest) {
            await this.closeConnection(oldest);
          }
        }
      }

      // Create new connection using useChatConnection (handles mode selection internally)
      const config = useRuntimeConfig();
      const mode = (config.public.chatMode as 'websocket' | 'sse') || 'websocket';
      const chat = useChatConnection(threadId, {});

      conn = {
        threadId,
        mode,
        chat,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      // Store in external pool (not Pinia state) to preserve refs
      connectionPool[threadId] = conn;
      this.connectionVersion++; // Trigger reactivity

      // Set up message handler
      this.setupMessageHandler(threadId, chat);

      return conn;
    },

    /**
     * Set up message handler for a connection
     * IMPORTANT: Uses a detached effectScope so watchers persist even when the
     * component that created the connection unmounts (e.g., user navigates away)
     */
    setupMessageHandler(threadId: string, chat: ReturnType<typeof useChatConnection>) {
      // Stop any existing watcher scope for this thread
      if (watcherScopes[threadId]) {
        watcherScopes[threadId].stop();
      }

      // Create a DETACHED effect scope (true = detached from component lifecycle)
      // This ensures watchers continue running even when ChatContent unmounts
      const scope = effectScope(true);
      watcherScopes[threadId] = scope;

      scope.run(() => {
        // Watch for responses
        watch(
          () => chat.response.value,
          (responses) => {
            if (!responses.length) return;

            const latest = responses[responses.length - 1];
            if (!latest) return;
            this.handleChatResponse(threadId, latest);
          },
          { deep: true }
        );

        // Watch for phase updates
        watch(
          () => chat.responsePhase.value,
          (phase) => {
            if (phase) {
              this.setThreadState(threadId, { responsePhase: phase });
            }
          }
        );

        // Watch for errors
        watch(
          () => chat.error.value,
          (error) => {
            if (error) {
              this.setThreadState(threadId, {
                status: 'error',
                error,
              });
            }
          }
        );
      });
    },

    /**
     * Handle chat response from WebSocket/SSE
     */
    handleChatResponse(threadId: string, response: ChatResponse) {
      // Increment response version to trigger reactivity for watchers
      this.responseVersions[threadId] = (this.responseVersions[threadId] || 0) + 1;

      const currentState = this.threadStates[threadId];

      // Check if this is a late response during grace period (error recovery)
      const isLateResponse = currentState?.status === 'error' &&
        currentState.errorGraceDeadline &&
        Date.now() < currentState.errorGraceDeadline;

      // Reset timeout on any meaningful activity (slide batches, status updates)
      if (response.type === 'slide_batch_ready' || response.status === 'status_update') {
        this.resetProcessingTimeout(threadId);

        // Recover from error if this is a late response
        if (isLateResponse) {
          console.log(`[MessageQueue] Recovered late response for thread ${threadId}`);
          this.clearGraceCheckTimeout(threadId);
          this.setThreadState(threadId, {
            status: 'processing',
            error: undefined,
            errorGraceDeadline: undefined,
          });
        }
      }

      // Handle different response types
      if (response.type === 'slide_batch_ready') {
        this.setThreadState(threadId, { hasPartialSlides: true });
        // Mark user message as sent when we receive slide content
        this.markUserMessageSent(threadId);
      }

      // Save AI text responses to DB immediately (even if user not on page)
      // This ensures responses are persisted even when ChatContent.vue is unmounted
      if (response.status === 'user_message' && response.message) {
        console.log('[MessageQueue] Received user_message response, saving to DB');
        this.saveAIResponse(threadId, response);
        // Mark user message as sent when we get AI response
        this.markUserMessageSent(threadId);
      }

      // Handle completion states
      if (['completed', 'timeout', 'cancelled', 'error', 'validation_error'].includes(response.status)) {
        const status: ThreadStatus = response.status === 'completed' ?
          'completed' :
          response.status === 'cancelled' ?
            'cancelled' :
            'error';

        // Clear grace check timeout on any terminal state
        this.clearGraceCheckTimeout(threadId);

        // On error or timeout: Stop RAG processing to conserve tokens
        if (response.status === 'error' || response.status === 'timeout') {
          console.log('[MessageQueue] Error/timeout detected, stopping RAG to conserve tokens');
          this.doStopRAGProcessing(threadId);
        }

        this.setThreadState(threadId, {
          status,
          responsePhase: '',
          error: response.error,
          errorGraceDeadline: undefined, // Clear grace deadline on terminal state
        });
      }
    },

    /**
     * Connect to chat for a thread
     */
    async connect(threadId: string): Promise<boolean> {
      console.log('[MessageQueue] connect() called for threadId:', threadId);

      // Check if already connected
      const existingConn = connectionPool[threadId];
      if (existingConn?.chat.isConnected.value) {
        console.log('[MessageQueue] Already connected, reusing existing connection');
        return true;
      }

      // Check if connection is already in progress - return existing promise
      if (pendingConnectionPromises[threadId]) {
        console.log('[MessageQueue] Connection already in progress, waiting...');
        return pendingConnectionPromises[threadId];
      }

      // Create a new connection promise
      const connectionPromise = this.doConnect(threadId);
      pendingConnectionPromises[threadId] = connectionPromise;

      try {
        return await connectionPromise;
      } finally {
        // Clean up pending connection reference
        Reflect.deleteProperty(pendingConnectionPromises, threadId);
      }
    },

    /**
     * Internal connect implementation
     */
    async doConnect(threadId: string): Promise<boolean> {
      try {
        this.setThreadState(threadId, { status: 'connecting' });

        console.log('[MessageQueue] Getting or creating connection...');
        const conn = await this.getOrCreateConnection(threadId);
        console.log('[MessageQueue] Connection obtained, mode:', conn.mode);

        // Connect (useChatConnection handles auth token fetching internally)
        console.log('[MessageQueue] Calling conn.chat.connect()...');
        await conn.chat.connect();
        console.log('[MessageQueue] conn.chat.connect() completed');

        // Wait for connection
        console.log('[MessageQueue] Waiting for connection (5s timeout)...');
        await conn.chat.waitForConnection(5000);
        console.log('[MessageQueue] Connection established successfully');

        // IMPORTANT: Only reset to 'idle' if not already 'processing'.
        // When user returns to a thread that's still processing in background,
        // we must preserve the 'processing' state so the loading indicator shows.
        const currentState = this.threadStates[threadId];
        if (currentState?.status !== 'processing') {
          this.setThreadState(threadId, { status: 'idle', error: undefined });
        } else {
          // Clear any error but preserve processing status
          console.log('[MessageQueue] Preserving processing state for thread:', threadId);
          this.setThreadState(threadId, { error: undefined });
        }
        return true;
      } catch (err) {
        console.error('[MessageQueue] Connection failed:', err);
        this.setThreadState(threadId, {
          status: 'error',
          error: 'Failed to connect',
        });
        return false;
      }
    },

    /**
     * Disconnect from a thread
     */
    async closeConnection(threadId: string) {
      console.log('[MessageQueue] closeConnection() called for threadId:', threadId);
      const conn = connectionPool[threadId];
      if (conn) {
        console.log('[MessageQueue] Disconnecting and removing from pool');
        conn.chat.disconnect();
        Reflect.deleteProperty(connectionPool, threadId);

        // Stop watcher scope for this connection
        if (watcherScopes[threadId]) {
          watcherScopes[threadId].stop();
          Reflect.deleteProperty(watcherScopes, threadId);
        }

        this.connectionVersion++; // Trigger reactivity
        console.log('[MessageQueue] Connection removed, connectionVersion:', this.connectionVersion);
      } else {
        console.log('[MessageQueue] No connection found in pool to close');
      }
    },

    /**
     * Clean up idle connections
     */
    cleanupIdleConnections() {
      const now = Date.now();
      let hasDeleted = false;
      for (const [threadId, conn] of Object.entries(connectionPool)) {
        const state = this.threadStates[threadId];

        // Don't close connections for threads that are processing
        if (state?.status === 'processing') continue;

        // Don't close connections for error threads within grace period
        // (they may receive late responses)
        if (
          state?.status === 'error' &&
          state.errorGraceDeadline &&
          now < state.errorGraceDeadline
        ) {
          continue;
        }

        if (now - conn.lastActivity > CONNECTION_IDLE_TIMEOUT_MS) {
          conn.chat.disconnect();
          Reflect.deleteProperty(connectionPool, threadId);
          hasDeleted = true;
        }
      }
      if (hasDeleted) {
        this.connectionVersion++; // Trigger reactivity
      }
    },

    /**
     * Find the oldest connection
     */
    findOldestConnection(): string | null {
      let oldest: string | null = null;
      let oldestTime = Infinity;
      const now = Date.now();

      for (const [threadId, conn] of Object.entries(connectionPool)) {
        const state = this.threadStates[threadId];

        // Skip connections that are processing
        if (state?.status === 'processing') continue;

        // Skip error connections within grace period
        if (
          state?.status === 'error' &&
          state.errorGraceDeadline &&
          now < state.errorGraceDeadline
        ) {
          continue;
        }

        if (conn.lastActivity < oldestTime) {
          oldestTime = conn.lastActivity;
          oldest = threadId;
        }
      }

      return oldest;
    },

    /**
     * Get pending messages for a thread from localStorage
     */
    getPendingMessages(threadId: string): QueuedMessage[] {
      return getPendingMessages(threadId);
    },

    /**
     * Add a pending message
     */
    enqueuePendingMessage(message: QueuedMessage) {
      addPendingMessage(message);
      this.trackLocalMessage(message.uuid);
    },

    /**
     * Update pending message status
     */
    updatePendingMessage(threadId: string, uuid: string, updates: Partial<QueuedMessage>) {
      updatePendingMessage(threadId, uuid, updates);
    },

    /**
     * Remove a pending message
     */
    removePendingMessage(threadId: string, uuid: string) {
      removePendingMessage(threadId, uuid);
    },

    /**
     * Replay pending messages after reconnection
     */
    async replayPendingMessages(threadId: string) {
      const pending = this.getPendingMessages(threadId);
      const conn = connectionPool[threadId];

      if (!conn || !pending.length) return;

      for (const msg of pending) {
        if (msg.status === 'failed' && msg.retryCount >= 3) continue;

        try {
          this.updatePendingMessage(threadId, msg.uuid, { status: 'sending' });

          // Attempt to resend
          // This would integrate with the chat.sendMessage or similar
          // For now, we mark as sent if connection is active
          if (conn.chat.isConnected.value) {
            this.updatePendingMessage(threadId, msg.uuid, { status: 'sent' });
          }
        } catch {
          this.updatePendingMessage(threadId, msg.uuid, {
            status: 'failed',
            retryCount: msg.retryCount + 1,
          });
        }
      }
    },

    /**
     * Check for late responses from DB when returning to a thread.
     * If thread was marked as error/timeout but DB has newer messages,
     * recover the state to 'completed'.
     *
     * @param threadId - The thread to check
     * @param dbMessages - Messages fetched from DB
     * @param lastUserMessageTime - Timestamp of the last user message
     * @returns true if state was recovered
     */
    checkForLateResponses(
      threadId: string,
      dbMessages: Array<{ is_user: boolean; created_at: string }>,
      lastUserMessageTime?: number
    ): boolean {
      const state = this.threadStates[threadId];

      // Only check if thread is in error state (could be from timeout)
      if (!state || state.status !== 'error') {
        return false;
      }

      // Find the last non-user message (AI response) in DB
      const aiMessages = dbMessages.filter((m) => !m.is_user);
      if (aiMessages.length === 0) {
        return false;
      }

      // Get the latest AI message
      const latestAiMessage = aiMessages.reduce((latest, msg) => {
        const msgTime = new Date(msg.created_at).getTime();
        const latestTime = new Date(latest.created_at).getTime();
        return msgTime > latestTime ? msg : latest;
      });

      const latestAiTime = new Date(latestAiMessage.created_at).getTime();

      // If we have a reference point (last user message), check if AI responded after
      if (lastUserMessageTime && latestAiTime > lastUserMessageTime) {
        console.log('[MessageQueue] Recovered late response from DB for thread:', threadId);

        // Clear error and set to completed
        this.setThreadState(threadId, {
          status: 'completed',
          error: undefined,
          responsePhase: '',
        });

        // Clear the message cache since DB has the complete data
        this.clearMessageCache(threadId);

        return true;
      }

      // Alternative: check if AI message is newer than the error timestamp
      if (latestAiTime > state.lastUpdated) {
        console.log('[MessageQueue] Recovered late response (newer than error) for thread:', threadId);

        this.setThreadState(threadId, {
          status: 'completed',
          error: undefined,
          responsePhase: '',
        });

        this.clearMessageCache(threadId);

        return true;
      }

      return false;
    },
  },
});
