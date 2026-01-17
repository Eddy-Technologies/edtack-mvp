/**
 * Chat Stream Manager
 *
 * Manages SSE connections to Python RAG backend and buffers events for client reconnection.
 * This enables seamless page refresh during chat streaming without losing content.
 *
 * Architecture:
 * Browser ←──SSE──→ Nuxt Server (this) ←──SSE──→ Python RAG Backend
 *
 * Key features:
 * - Maintains SSE connection to Python backend even when browser disconnects
 * - Buffers events in memory for reconnecting clients
 * - Supports multiple browser clients per thread (e.g., multiple tabs)
 * - Falls back to Python /state API if buffer is empty
 * - **CRITICAL**: Saves slides to DB when generation completes, ensuring no data loss
 *   even if client disconnects during streaming
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~~/types/supabase';

export interface ChatEvent {
  type: string;
  status?: string;
  data?: any;
  message?: string;
  phase?: string;
  batch?: {
    slides: any[];
    batch_size: number;
    total_slides_so_far: number;
  };
  timestamp?: string;
  error?: string;
  [key: string]: any;
}

export interface StreamClient {
  id: string;
  controller: ReadableStreamDefaultController<string>;
  connectedAt: number;
}

export interface ActiveStream {
  threadId: string;
  pythonAbortController: AbortController | null;
  buffer: ChatEvent[];
  clients: Map<string, StreamClient>;
  status: 'active' | 'completed' | 'error' | 'cancelled';
  lastActivity: number;
  startedAt: number;
  userInfo?: any;
  initialMessage?: string;
  queryId?: string; // ID of the message this stream is generating content for
}

// Configuration
const MAX_BUFFER_SIZE = 1000; // Maximum events to buffer per thread
const BUFFER_TTL_MS = 60 * 60 * 1000; // 1 hour TTL for inactive streams
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

class ChatStreamManager {
  private activeStreams: Map<string, ActiveStream> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private supabaseClient: SupabaseClient<Database> | null = null;
  private savedSlideQueries: Set<string> = new Set(); // Track which queries have been saved

  constructor() {
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Get or create Supabase service role client for server-side DB operations
   */
  private getSupabaseClient(): SupabaseClient<Database> | null {
    if (this.supabaseClient) return this.supabaseClient;

    try {
      const config = useRuntimeConfig();
      if (!config.private?.supabaseUrl || !config.private?.supabaseServiceRoleKey) {
        console.error('[ChatStreamManager] Missing Supabase config for server-side saving');
        return null;
      }

      this.supabaseClient = createClient<Database>(
        config.private.supabaseUrl,
        config.private.supabaseServiceRoleKey
      );
      return this.supabaseClient;
    } catch (err) {
      console.error('[ChatStreamManager] Failed to create Supabase client:', err);
      return null;
    }
  }

  /**
   * Save slides to database server-side.
   * Called when slide_generation_complete arrives or on terminal state.
   * This ensures slides are persisted even if client is disconnected.
   */
  private async saveSlidesToDatabase(threadId: string): Promise<boolean> {
    const stream = this.activeStreams.get(threadId);
    if (!stream || !stream.queryId) {
      console.log('[ChatStreamManager] saveSlidesToDatabase: No stream or queryId for:', threadId);
      return false;
    }

    // Deduplication: Skip if already saved for this query
    const dedupKey = `${threadId}_${stream.queryId}`;
    if (this.savedSlideQueries.has(dedupKey)) {
      console.log('[ChatStreamManager] Slides already saved for query:', dedupKey);
      return true;
    }

    // Collect all slides from buffer
    const allSlides: any[] = [];
    let contentType: 'lesson' | 'quiz' | null = null;
    let summaryMessage: string | null = null;
    let timestamp: string | null = null;

    for (const event of stream.buffer) {
      if (event.type === 'slide_batch_ready' && event.batch?.slides) {
        allSlides.push(...event.batch.slides);
        if (!contentType && event.batch.slides[0]) {
          contentType = event.batch.slides[0].type === 'question' ? 'quiz' : 'lesson';
        }
      }
      // Capture user_message summary if present
      if (event.status === 'user_message' && event.message) {
        summaryMessage = event.message;
        timestamp = event.timestamp || null;
      }
    }

    // Nothing to save if no slides AND no summary message
    if (allSlides.length === 0 && !summaryMessage) {
      console.log('[ChatStreamManager] saveSlidesToDatabase: No content to save for:', threadId);
      return true;
    }

    const supabase = this.getSupabaseClient();
    if (!supabase) {
      console.error('[ChatStreamManager] Cannot save message: No Supabase client');
      return false;
    }

    // Build the message content - slides + summary OR standalone text
    const messageContent = allSlides.length > 0 ?
        {
          slides: allSlides,
          contentType: contentType || 'lesson',
          status: 'completed',
          isStreaming: false,
          ...(summaryMessage && { message: summaryMessage }),
          ...(timestamp && { timestamp }),
        } :
        {
        // Standalone text message (no slides)
          message: summaryMessage,
          status: 'user_message',
          ...(timestamp && { timestamp }),
        };

    console.log('[ChatStreamManager] Saving AI response to DB:', {
      threadId,
      queryId: stream.queryId,
      slidesCount: allSlides.length,
      hasTextOnly: allSlides.length === 0 && !!summaryMessage,
      contentType: allSlides.length > 0 ? contentType : 'text',
    });

    try {
      const { error } = await supabase
        .from('thread_messages')
        .upsert({
          id: stream.queryId,
          thread_id: threadId,
          sender: null, // AI message
          content: JSON.stringify(messageContent),
          type: 'json',
        }, { onConflict: 'id' });

      if (error) {
        console.error('[ChatStreamManager] Failed to save slides:', error);
        return false;
      }

      // Mark as saved
      this.savedSlideQueries.add(dedupKey);
      console.log('[ChatStreamManager] AI response saved successfully:', dedupKey);

      // CRITICAL: Clear buffer after successful save to prevent duplicate messages on reconnect
      // Reconnecting clients will get messages from DB instead of buffer
      if (stream) {
        console.log('[ChatStreamManager] Clearing buffer after successful save (had', stream.buffer.length, 'events)');
        stream.buffer = [];
      }

      // Clean up old entries periodically (keep last 1000)
      if (this.savedSlideQueries.size > 1000) {
        const entries = Array.from(this.savedSlideQueries);
        entries.slice(0, entries.length - 500).forEach((key) => this.savedSlideQueries.delete(key));
      }

      return true;
    } catch (err) {
      console.error('[ChatStreamManager] Error saving slides:', err);
      return false;
    }
  }

  /**
   * Start periodic cleanup of stale streams
   */
  private startCleanup() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [threadId, stream] of this.activeStreams) {
        // Remove streams that are completed/error and have no clients and are old
        const isStale = now - stream.lastActivity > BUFFER_TTL_MS;
        const isTerminal = ['completed', 'error', 'cancelled'].includes(stream.status);
        const hasNoClients = stream.clients.size === 0;

        if (isStale && isTerminal && hasNoClients) {
          console.log(`[ChatStreamManager] Cleaning up stale stream: ${threadId}`);
          this.activeStreams.delete(threadId);
        }
      }
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Check if a stream is currently active for a thread
   */
  isActive(threadId: string): boolean {
    const stream = this.activeStreams.get(threadId);
    return stream?.status === 'active';
  }

  /**
   * Get stream info for a thread
   */
  getStreamInfo(threadId: string): {
    active: boolean;
    status: string;
    bufferedEvents: number;
    connectedClients: number;
  } | null {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return null;

    return {
      active: stream.status === 'active',
      status: stream.status,
      bufferedEvents: stream.buffer.length,
      connectedClients: stream.clients.size,
    };
  }

  /**
   * Get buffered events for a thread
   */
  getBuffer(threadId: string): ChatEvent[] {
    const stream = this.activeStreams.get(threadId);
    return stream?.buffer || [];
  }

  /**
   * Start a new stream to Python backend
   */
  async startStream(
    threadId: string,
    message: string,
    token: string,
    userInfo?: any,
    queryId?: string
  ): Promise<boolean> {
    // Check if stream already exists and is active
    const existing = this.activeStreams.get(threadId);
    if (existing?.status === 'active') {
      // If queryId is different, this is a NEW query - clear old buffer and update queryId
      if (queryId && existing.queryId !== queryId) {
        console.log(`[ChatStreamManager] Stream active for ${threadId} but queryId changed from ${existing.queryId} to ${queryId} - clearing buffer`);
        existing.buffer = [];
        existing.queryId = queryId;
      } else {
        console.log(`[ChatStreamManager] Stream already active for ${threadId}`);
      }
      return true;
    }

    // If existing stream is not active (completed/error/cancelled), clear it before creating new
    // This prevents old events from leaking into new queries
    if (existing) {
      console.log(`[ChatStreamManager] Clearing old ${existing.status} stream for ${threadId} (had ${existing.buffer.length} buffered events)`);
    }

    // Create new stream entry with fresh buffer
    const stream: ActiveStream = {
      threadId,
      pythonAbortController: new AbortController(),
      buffer: [], // Always start with empty buffer for new query
      clients: new Map(),
      status: 'active',
      lastActivity: Date.now(),
      startedAt: Date.now(),
      userInfo,
      initialMessage: message,
      queryId, // Store queryId to include in events
    };

    this.activeStreams.set(threadId, stream);

    // Start SSE connection to Python backend
    this.connectToPythonBackend(threadId, message, token, userInfo);

    return true;
  }

  /**
   * Connect to Python backend SSE endpoint
   */
  private async connectToPythonBackend(
    threadId: string,
    message: string,
    token: string,
    userInfo?: any
  ) {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return;

    const config = useRuntimeConfig();
    const pythonApiUrl = config.public.pythonApiUrl;
    const apiUrl = `${pythonApiUrl}/api/v1/chat/${threadId}`;

    console.log(`[ChatStreamManager] Connecting to Python backend: ${apiUrl}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };

      if (token && config.public.chatAuthEnabled) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input: message,
          user_info: userInfo,
        }),
        signal: stream.pythonAbortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body from Python backend');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log(`[ChatStreamManager] Python stream ended for ${threadId}`);
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const events = this.parseSSEBuffer(buffer);
        buffer = events.remaining;

        for (const event of events.parsed) {
          this.handlePythonEvent(threadId, event);
        }
      }

      // Stream ended normally
      if (stream.status === 'active') {
        stream.status = 'completed';
      }

      // Save slides when stream ends (final fallback)
      console.log('[ChatStreamManager] Stream ended naturally, ensuring slides are saved');
      await this.saveSlidesToDatabase(threadId);
    } catch (err: any) {
      console.error(`[ChatStreamManager] Python connection error for ${threadId}:`, err);

      if (err.name === 'AbortError') {
        console.log(`[ChatStreamManager] Stream aborted for ${threadId}`);
        stream.status = 'cancelled';
      } else {
        stream.status = 'error';
        this.pushEvent(threadId, {
          type: 'error',
          status: 'error',
          error: err.message || 'Connection to backend failed',
          timestamp: new Date().toISOString(),
        });
      }

      // Save any slides that were received before error/abort
      console.log('[ChatStreamManager] Stream ended with error/abort, saving any partial slides');
      await this.saveSlidesToDatabase(threadId);
    }
  }

  /**
   * Parse SSE buffer and return complete events
   */
  private parseSSEBuffer(buffer: string): { parsed: ChatEvent[]; remaining: string } {
    const events: ChatEvent[] = [];
    const blocks = buffer.split('\n\n');

    // Last block might be incomplete
    const remaining = blocks.pop() || '';

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n');
      let eventType = '';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataLines.push(line.slice(6));
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5));
        }
      }

      if (eventType && dataLines.length > 0) {
        try {
          const data = JSON.parse(dataLines.join('\n'));
          events.push({ type: eventType, ...data });
        } catch {
          events.push({ type: eventType, data: dataLines.join('\n') });
        }
      }
    }

    return { parsed: events, remaining };
  }

  /**
   * Handle event from Python backend
   */
  private handlePythonEvent(threadId: string, event: ChatEvent) {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return;

    stream.lastActivity = Date.now();

    // Skip heartbeats - don't buffer
    if (event.type === 'heartbeat') {
      return;
    }

    // Convert to standardized format
    const normalizedEvent = this.normalizeEvent(event);

    // Add queryId to ALL events for message association and filtering
    // This allows clients to filter out events from previous queries on the same thread
    if (stream.queryId) {
      normalizedEvent.queryId = stream.queryId;
    }

    // Buffer the event
    this.pushEvent(threadId, normalizedEvent);

    // CRITICAL: Save slides to DB when generation completes
    // This ensures slides are persisted even if client disconnects
    if (event.type === 'slide_generation_complete') {
      console.log('[ChatStreamManager] slide_generation_complete received, saving to DB');
      this.saveSlidesToDatabase(threadId).catch((err) => {
        console.error('[ChatStreamManager] Error in slide save:', err);
      });
    }

    // Update stream status on terminal events
    if (['completed', 'cancelled', 'error'].includes(event.type)) {
      stream.status = event.type as 'completed' | 'cancelled' | 'error';

      // Also save slides on terminal state as fallback
      // (in case slide_generation_complete was missed or stream ended abruptly)
      console.log('[ChatStreamManager] Terminal state', event.type, '- ensuring slides are saved');
      this.saveSlidesToDatabase(threadId).catch((err) => {
        console.error('[ChatStreamManager] Error in terminal state slide save:', err);
      });
    }
  }

  /**
   * Normalize event to match frontend ChatResponse format
   */
  private normalizeEvent(event: ChatEvent): ChatEvent {
    const type = event.type;

    // Status events
    if (type === 'status') {
      return {
        type: 'status',
        status: 'status_update',
        phase: event.status,
        generation_intent_type: event.generation_intent_type,
        timestamp: event.timestamp,
      };
    }

    // Slide batches
    if (type === 'slide_batch_ready') {
      return {
        type: 'slide_batch_ready',
        status: 'streaming',
        batch: {
          slides: event.slides || [],
          batch_size: event.slides?.length || 0,
          total_slides_so_far: event.batch_index !== undefined ?
              (event.batch_index + 1) * (event.slides?.length || 0) :
            event.slides?.length || 0,
        },
      };
    }

    // Quiz batches
    if (type === 'quiz_batch_ready') {
      return {
        type: 'slide_batch_ready', // Use same type for compatibility
        status: 'streaming',
        batch: {
          slides: event.quiz_items || [],
          batch_size: event.quiz_items?.length || 0,
          total_slides_so_far: event.batch_index !== undefined ?
              (event.batch_index + 1) * (event.quiz_items?.length || 0) :
            event.quiz_items?.length || 0,
        },
      };
    }

    // User messages
    if (type === 'user_message') {
      return {
        type: 'user_message',
        status: 'user_message',
        message: event.message,
        timestamp: event.timestamp,
      };
    }

    // Terminal events
    if (type === 'completed' || type === 'cancelled' || type === 'error') {
      return {
        type,
        status: type,
        error: event.message || event.error,
        timestamp: event.timestamp,
      };
    }

    // Pass through other events (node_output, slide_generation_start, etc.)
    return event;
  }

  /**
   * Push event to buffer and broadcast to connected clients
   */
  pushEvent(threadId: string, event: ChatEvent) {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return;

    // Add to buffer (with size limit)
    stream.buffer.push(event);
    if (stream.buffer.length > MAX_BUFFER_SIZE) {
      stream.buffer.shift(); // Remove oldest
    }

    // Broadcast to all connected clients
    const sseData = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;

    for (const [clientId, client] of stream.clients) {
      try {
        client.controller.enqueue(sseData);
      } catch {
        console.log(`[ChatStreamManager] Client ${clientId} disconnected, removing`);
        stream.clients.delete(clientId);
      }
    }
  }

  /**
   * Add a browser client to receive events
   */
  addClient(threadId: string, clientId: string, controller: ReadableStreamDefaultController<string>) {
    const stream = this.activeStreams.get(threadId);
    if (!stream) {
      console.log(`[ChatStreamManager] No stream found for ${threadId}, client ${clientId} cannot subscribe`);
      return false;
    }

    stream.clients.set(clientId, {
      id: clientId,
      controller,
      connectedAt: Date.now(),
    });

    console.log(`[ChatStreamManager] Client ${clientId} subscribed to ${threadId}, total clients: ${stream.clients.size}`);
    return true;
  }

  /**
   * Remove a browser client
   */
  removeClient(threadId: string, clientId: string) {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return;

    stream.clients.delete(clientId);
    console.log(`[ChatStreamManager] Client ${clientId} unsubscribed from ${threadId}, remaining clients: ${stream.clients.size}`);
  }

  /**
   * Stop a stream (cancel Python backend request)
   */
  async stopStream(threadId: string): Promise<boolean> {
    const stream = this.activeStreams.get(threadId);
    if (!stream) return false;

    // Abort the Python connection
    stream.pythonAbortController?.abort();
    stream.status = 'cancelled';

    // Notify all clients
    this.pushEvent(threadId, {
      type: 'cancelled',
      status: 'cancelled',
      timestamp: new Date().toISOString(),
    });

    // Also call Python stop endpoint
    const config = useRuntimeConfig();
    try {
      await fetch(`${config.public.pythonApiUrl}/api/v1/chat/${threadId}/stop`, {
        method: 'POST',
      });
    } catch (err) {
      console.error(`[ChatStreamManager] Error calling Python stop endpoint:`, err);
    }

    return true;
  }

  /**
   * Fetch state from Python backend (fallback when buffer is empty)
   */
  async fetchPythonState(threadId: string, token?: string): Promise<ChatEvent[]> {
    const config = useRuntimeConfig();

    try {
      const headers: Record<string, string> = {};
      if (token && config.public.chatAuthEnabled) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${config.public.pythonApiUrl}/api/v1/chat/${threadId}/state`,
        { headers }
      );

      if (!response.ok) {
        return [];
      }

      const state = await response.json();

      if (state.has_state && state.slides?.length > 0) {
        // Convert slides to events
        return state.slides.map((slide: any, index: number) => ({
          type: 'slide_batch_ready',
          status: 'streaming',
          batch: {
            slides: [slide],
            batch_size: 1,
            total_slides_so_far: index + 1,
          },
        }));
      }

      return [];
    } catch (err) {
      console.error(`[ChatStreamManager] Error fetching Python state:`, err);
      return [];
    }
  }
}

// Export singleton instance
export const chatStreamManager = new ChatStreamManager();
