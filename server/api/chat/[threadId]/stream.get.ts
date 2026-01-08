/**
 * SSE Stream Endpoint for Chat
 *
 * GET /api/chat/[threadId]/stream
 *
 * Clients connect to this endpoint to receive chat events.
 * On connect, buffered events are sent first (for reconnecting clients),
 * then new events are streamed as they arrive.
 *
 * Headers:
 * - Authorization: Bearer <token> (required if auth enabled)
 *
 * Query params:
 * - fromIndex: Start sending events from this index (optional, for resuming)
 */

import { chatStreamManager } from '~~/server/utils/chatStreamManager';

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  // Get auth token from header
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Optional: start index for resuming (skip already-received events)
  const query = getQuery(event);
  const fromIndex = parseInt(query.fromIndex as string) || 0;

  // Generate unique client ID
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[SSE Stream] Client ${clientId} connecting to thread ${threadId}, fromIndex: ${fromIndex}`);

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
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
        console.log(`[SSE Stream] Sending ${eventsToSend.length} buffered events to client ${clientId}`);
        for (const evt of eventsToSend) {
          sendEvent(evt.type, evt);
        }
      }

      // 2. Check if stream exists
      const streamInfo = chatStreamManager.getStreamInfo(threadId);

      if (!streamInfo) {
        // No active stream - try to fetch from Python state API
        console.log(`[SSE Stream] No active stream for ${threadId}, fetching from Python state`);

        chatStreamManager.fetchPythonState(threadId, token).then((events) => {
          if (events.length > 0) {
            console.log(`[SSE Stream] Got ${events.length} events from Python state`);
            for (const evt of events) {
              sendEvent(evt.type, evt);
            }
          }
          // Send completed event since stream is not active
          sendEvent('completed', { status: 'completed', timestamp: new Date().toISOString() });
          controller.close();
        }).catch((err) => {
          console.error(`[SSE Stream] Error fetching Python state:`, err);
          sendEvent('error', { status: 'error', error: 'Failed to fetch chat state' });
          controller.close();
        });

        return;
      }

      // 3. If stream is already completed, send completed event
      if (streamInfo.status !== 'active') {
        console.log(`[SSE Stream] Stream ${threadId} already ${streamInfo.status}`);
        sendEvent(streamInfo.status, { status: streamInfo.status, timestamp: new Date().toISOString() });
        controller.close();
        return;
      }

      // 4. Subscribe to new events
      // Create a wrapper controller that handles text encoding
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
      console.log(`[SSE Stream] Client ${clientId} disconnected from ${threadId}`);
      chatStreamManager.removeClient(threadId, clientId);
    },
  });

  // Handle request abort (client disconnect)
  event.node.req.on('close', () => {
    console.log(`[SSE Stream] Request closed for client ${clientId}`);
    chatStreamManager.removeClient(threadId, clientId);
  });

  return sendStream(event, stream);
});
