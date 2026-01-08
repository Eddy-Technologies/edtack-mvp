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
 */

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
}

// Configuration
const MAX_BUFFER_SIZE = 1000; // Maximum events to buffer per thread
const BUFFER_TTL_MS = 60 * 60 * 1000; // 1 hour TTL for inactive streams
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

class ChatStreamManager {
  private activeStreams: Map<string, ActiveStream> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup
    this.startCleanup();
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
    userInfo?: any
  ): Promise<boolean> {
    // Check if stream already exists and is active
    const existing = this.activeStreams.get(threadId);
    if (existing?.status === 'active') {
      console.log(`[ChatStreamManager] Stream already active for ${threadId}`);
      return true;
    }

    // Create new stream entry
    const stream: ActiveStream = {
      threadId,
      pythonAbortController: new AbortController(),
      buffer: [],
      clients: new Map(),
      status: 'active',
      lastActivity: Date.now(),
      startedAt: Date.now(),
      userInfo,
      initialMessage: message,
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

    // Buffer the event
    this.pushEvent(threadId, normalizedEvent);

    // Update stream status on terminal events
    if (['completed', 'cancelled', 'error'].includes(event.type)) {
      stream.status = event.type as 'completed' | 'cancelled' | 'error';
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
