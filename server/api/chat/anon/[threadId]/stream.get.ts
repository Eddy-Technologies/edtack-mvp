/**
 * SSE Stream Endpoint for Anonymous Chat
 *
 * GET /api/chat/anon/[threadId]/stream
 *
 * Clients connect to this endpoint to receive chat events.
 * Same behavior as authenticated stream, but verifies anonymous session ownership.
 */

import { chatStreamManager } from '~~/server/utils/chatStreamManager';
import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';
import { getAnonymousSessionId } from '~~/server/utils/anonymousSession';

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  // Get anonymous session
  const sessionId = getAnonymousSessionId(event);

  if (!sessionId) {
    throw createError({
      statusCode: 401,
      message: 'No anonymous session found',
    });
  }

  // Verify thread belongs to this anonymous session
  const supabase = getPrivilegedSupabaseClient(event);
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id, anon_session_id, is_anonymous')
    .eq('id', threadId)
    .single();

  if (threadError || !thread) {
    throw createError({
      statusCode: 404,
      message: 'Thread not found',
    });
  }

  // Verify ownership
  if (!thread.is_anonymous || thread.anon_session_id !== sessionId) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    });
  }

  // Optional: start index for resuming (skip already-received events)
  const query = getQuery(event);
  const fromIndex = parseInt(query.fromIndex as string) || 0;

  // Generate unique client ID
  const clientId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[Anon SSE Stream] Client ${clientId} connecting to thread ${threadId}, fromIndex: ${fromIndex}`);

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Create readable stream for client
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE event
      const sendEvent = (eventType: string, data: any) => {
        const sseMessage = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      };

      // 1. Send buffered events immediately (for reconnecting clients)
      const buffer = chatStreamManager.getBuffer(threadId);
      const eventsToSend = buffer.slice(fromIndex);

      if (eventsToSend.length > 0) {
        console.log(`[Anon SSE Stream] Sending ${eventsToSend.length} buffered events to client ${clientId}`);
        for (const evt of eventsToSend) {
          sendEvent(evt.type, evt);
        }
      }

      // 2. Check if stream exists
      const streamInfo = chatStreamManager.getStreamInfo(threadId);

      if (!streamInfo) {
        // No active stream - try to fetch from Python state API
        console.log(`[Anon SSE Stream] No active stream for ${threadId}, fetching from Python state`);

        chatStreamManager.fetchPythonState(threadId, '').then((events) => {
          if (events.length > 0) {
            console.log(`[Anon SSE Stream] Got ${events.length} events from Python state`);
            for (const evt of events) {
              sendEvent(evt.type, evt);
            }
          }
          // Send completed event since stream is not active
          sendEvent('completed', { status: 'completed', timestamp: new Date().toISOString() });
          controller.close();
        }).catch((err) => {
          console.error(`[Anon SSE Stream] Error fetching Python state:`, err);
          sendEvent('error', { status: 'error', error: 'Failed to fetch chat state' });
          controller.close();
        });

        return;
      }

      // 3. If stream is already completed, send completed event
      if (streamInfo.status !== 'active') {
        console.log(`[Anon SSE Stream] Stream ${threadId} already ${streamInfo.status}`);
        sendEvent(streamInfo.status, { status: streamInfo.status, timestamp: new Date().toISOString() });
        controller.close();
        return;
      }

      // 4. Subscribe to new events
      const wrappedController = {
        enqueue: (data: string) => {
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            // Stream closed, will be cleaned up
          }
        },
        close: () => controller.close(),
        error: (err: any) => controller.error(err),
      };

      chatStreamManager.addClient(threadId, clientId, wrappedController as any);

      // Send connection confirmation
      sendEvent('connected', {
        status: 'connected',
        clientId,
        bufferedEvents: eventsToSend.length,
        timestamp: new Date().toISOString(),
      });
    },

    cancel() {
      // Client disconnected
      console.log(`[Anon SSE Stream] Client ${clientId} disconnected from ${threadId}`);
      chatStreamManager.removeClient(threadId, clientId);
    },
  });

  // Handle request abort (client disconnect)
  event.node.req.on('close', () => {
    console.log(`[Anon SSE Stream] Request closed for client ${clientId}`);
    chatStreamManager.removeClient(threadId, clientId);
  });

  return sendStream(event, stream);
});
