/**
 * localStorage persistence service for message queue system.
 * Provides reliable storage with cleanup and quota management.
 */

// Storage keys
const STORAGE_KEYS = {
  THREAD_STATES: 'mq_thread_states',
  LAST_CLEANUP: 'mq_last_cleanup',
  pendingMessages: (threadId: string) => `mq_pending_${threadId}`,
  cachedMessages: (threadId: string) => `mq_cache_${threadId}`,
} as const;

// Limits
const MAX_PENDING_MESSAGES_PER_THREAD = 100;
const MAX_CACHED_MESSAGES_PER_THREAD = 200;
const MAX_THREADS_IN_STORAGE = 50;
const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const COMPLETED_STATE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Types
export type ThreadStatus = 'idle' | 'connecting' | 'processing' | 'completed' | 'cancelled' | 'error';

export interface ThreadState {
  threadId: string;
  status: ThreadStatus;
  lastUpdated: number;
  pendingMessageCount: number;
  error?: string;
  responsePhase?: string;
  hasPartialSlides?: boolean;
  errorGraceDeadline?: number; // Timestamp when grace period ends (for late response recovery)
}

export interface QueuedMessage {
  uuid: string;
  threadId: string;
  content: string;
  type: 'text' | 'json';
  isUser: boolean;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retryCount: number;
  createdAt: number;
  savedToDb?: boolean;
}

export interface CachedMessage {
  id: string;
  threadId: string;
  content: string;
  type: 'text' | 'json';
  isUser: boolean;
  createdAt: number;
}

// Helper to safely access localStorage (SSR-safe)
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

/**
 * Thread State Management
 */
export function getAllThreadStates(): Record<string, ThreadState> {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const data = storage.getItem(STORAGE_KEYS.THREAD_STATES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getThreadState(threadId: string): ThreadState | null {
  const states = getAllThreadStates();
  return states[threadId] || null;
}

export function setThreadState(state: ThreadState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const states = getAllThreadStates();
    states[state.threadId] = {
      ...state,
      lastUpdated: Date.now(),
    };

    // Enforce max threads limit
    const threadIds = Object.keys(states);
    if (threadIds.length > MAX_THREADS_IN_STORAGE) {
      // Remove oldest threads
      const sorted = threadIds.sort((a, b) => states[a].lastUpdated - states[b].lastUpdated);
      const toRemove = sorted.slice(0, threadIds.length - MAX_THREADS_IN_STORAGE);
      for (const id of toRemove) {
        Reflect.deleteProperty(states, id);
        // Also clean up pending messages for removed threads
        storage.removeItem(STORAGE_KEYS.pendingMessages(id));
        storage.removeItem(STORAGE_KEYS.cachedMessages(id));
      }
    }

    storage.setItem(STORAGE_KEYS.THREAD_STATES, JSON.stringify(states));
  } catch (err) {
    console.warn('[PersistenceService] Failed to save thread state:', err);
    handleQuotaError(err);
  }
}

export function removeThreadState(threadId: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const states = getAllThreadStates();
    Reflect.deleteProperty(states, threadId);
    storage.setItem(STORAGE_KEYS.THREAD_STATES, JSON.stringify(states));
    storage.removeItem(STORAGE_KEYS.pendingMessages(threadId));
    storage.removeItem(STORAGE_KEYS.cachedMessages(threadId));
  } catch {
    // Ignore errors on removal
  }
}

/**
 * Pending Message Queue Management
 */
export function getPendingMessages(threadId: string): QueuedMessage[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const data = storage.getItem(STORAGE_KEYS.pendingMessages(threadId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addPendingMessage(message: QueuedMessage): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const messages = getPendingMessages(message.threadId);
    messages.push(message);

    // Enforce limit
    if (messages.length > MAX_PENDING_MESSAGES_PER_THREAD) {
      messages.shift(); // Remove oldest
    }

    storage.setItem(STORAGE_KEYS.pendingMessages(message.threadId), JSON.stringify(messages));
  } catch (err) {
    console.warn('[PersistenceService] Failed to save pending message:', err);
    handleQuotaError(err);
  }
}

export function updatePendingMessage(threadId: string, uuid: string, updates: Partial<QueuedMessage>): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const messages = getPendingMessages(threadId);
    const index = messages.findIndex((m) => m.uuid === uuid);
    if (index >= 0) {
      messages[index] = { ...messages[index], ...updates };
      storage.setItem(STORAGE_KEYS.pendingMessages(threadId), JSON.stringify(messages));
    }
  } catch {
    // Ignore errors on update
  }
}

export function removePendingMessage(threadId: string, uuid: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const messages = getPendingMessages(threadId);
    const filtered = messages.filter((m) => m.uuid !== uuid);
    storage.setItem(STORAGE_KEYS.pendingMessages(threadId), JSON.stringify(filtered));
  } catch {
    // Ignore errors on removal
  }
}

export function clearPendingMessages(threadId: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEYS.pendingMessages(threadId));
  } catch {
    // Ignore errors
  }
}

/**
 * Cached Message Management (for messages received from WebSocket/SSE)
 */
export function getCachedMessages(threadId: string): CachedMessage[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const data = storage.getItem(STORAGE_KEYS.cachedMessages(threadId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addCachedMessage(message: CachedMessage): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const messages = getCachedMessages(message.threadId);

    // Check for duplicates by ID
    if (messages.some((m) => m.id === message.id)) {
      return;
    }

    messages.push(message);

    // Enforce limit
    if (messages.length > MAX_CACHED_MESSAGES_PER_THREAD) {
      messages.shift();
    }

    storage.setItem(STORAGE_KEYS.cachedMessages(message.threadId), JSON.stringify(messages));
  } catch (err) {
    console.warn('[PersistenceService] Failed to cache message:', err);
    handleQuotaError(err);
  }
}

export function clearCachedMessages(threadId: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEYS.cachedMessages(threadId));
  } catch {
    // Ignore errors
  }
}

/**
 * Cleanup and Maintenance
 */
export function runCleanup(): void {
  const storage = getStorage();
  if (!storage) return;

  const now = Date.now();
  const lastCleanup = Number(storage.getItem(STORAGE_KEYS.LAST_CLEANUP) || '0');

  // Skip if cleanup ran recently
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  try {
    const states = getAllThreadStates();

    for (const threadId of Object.keys(states)) {
      const state = states[threadId];

      // Remove completed/cancelled states older than 1 hour
      if (
        (state.status === 'completed' || state.status === 'cancelled') &&
        now - state.lastUpdated > COMPLETED_STATE_TTL_MS
      ) {
        Reflect.deleteProperty(states, threadId);
        storage.removeItem(STORAGE_KEYS.pendingMessages(threadId));
        storage.removeItem(STORAGE_KEYS.cachedMessages(threadId));
        continue;
      }

      // Clean up old pending messages
      const pendingMessages = getPendingMessages(threadId);
      const validMessages = pendingMessages.filter((m) => now - m.createdAt < MESSAGE_TTL_MS);
      if (validMessages.length !== pendingMessages.length) {
        storage.setItem(STORAGE_KEYS.pendingMessages(threadId), JSON.stringify(validMessages));
      }
    }

    storage.setItem(STORAGE_KEYS.THREAD_STATES, JSON.stringify(states));
    storage.setItem(STORAGE_KEYS.LAST_CLEANUP, String(now));
  } catch (err) {
    console.warn('[PersistenceService] Cleanup failed:', err);
  }
}

/**
 * Handle quota exceeded errors with emergency cleanup
 */
function handleQuotaError(err: unknown): void {
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    console.warn('[PersistenceService] Storage quota exceeded, running emergency cleanup');
    emergencyCleanup();
  }
}

function emergencyCleanup(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const states = getAllThreadStates();
    const threadIds = Object.keys(states);

    // Sort by lastUpdated, keep only 10 most recent
    const sorted = threadIds.sort((a, b) => states[b].lastUpdated - states[a].lastUpdated);
    const toKeep = sorted.slice(0, 10);

    // Remove old threads
    for (const id of sorted.slice(10)) {
      Reflect.deleteProperty(states, id);
      storage.removeItem(STORAGE_KEYS.pendingMessages(id));
      storage.removeItem(STORAGE_KEYS.cachedMessages(id));
    }

    // Trim messages for remaining threads
    for (const id of toKeep) {
      const pending = getPendingMessages(id).slice(-10);
      const cached = getCachedMessages(id).slice(-20);
      storage.setItem(STORAGE_KEYS.pendingMessages(id), JSON.stringify(pending));
      storage.setItem(STORAGE_KEYS.cachedMessages(id), JSON.stringify(cached));
    }

    storage.setItem(STORAGE_KEYS.THREAD_STATES, JSON.stringify(states));
  } catch {
    // Last resort: clear all message queue data
    console.error('[PersistenceService] Emergency cleanup failed, clearing all data');
    clearAllData();
  }
}

export function clearAllData(): void {
  const storage = getStorage();
  if (!storage) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith('mq_')) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}

/**
 * Initialize service - run cleanup on load
 */
export function initPersistenceService(): void {
  if (typeof window !== 'undefined') {
    runCleanup();
  }
}
