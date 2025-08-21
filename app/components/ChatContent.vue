<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <!-- Token Count Display and Connection Status -->
    <div class="bg-gray-100 text-gray-700 text-sm p-2 text-center border-b border-gray-300 flex justify-between items-center px-4">
      <div class="flex items-center gap-2">
        <span v-if="useWebSocket && wsChat" class="flex items-center gap-1">
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': wsChat.isConnected,
              'bg-yellow-500': wsChat.isConnecting,
              'bg-blue-500': isNewChatPendingConnection,
              'bg-red-500': !wsChat.isConnected && !wsChat.isConnecting && wsChat.error && !isNewChatPendingConnection,
              'bg-gray-400': !wsChat.isConnected && !wsChat.isConnecting && !wsChat.error && !isNewChatPendingConnection,
            }"
          />
          <span class="text-xs">
            {{
              wsChat.isConnected ? 'Connected' :
              wsChat.isConnecting ? 'Connecting...' :
              isNewChatPendingConnection ? 'Ready to connect' :
              'Disconnected'
            }}
          </span>
        </span>
      </div>
      <!-- <div>
        Token Usage: <span class="font-bold">{{ tokenCount }}</span>
      </div> -->
      <div class="w-20" />
    </div>

    <div ref="scrollArea" class="flex-1 overflow-y-auto p-6 space-y-4">
      <component
        :is="unit.component"
        v-for="(unit, index) in flattenedPlaybackUnits"
        :key="index"
        v-bind="unit.props"
        :start-playback="currentPlaybackIndex === index"
        @finish="handleFinish"
      />

      <!-- Loading indicator when waiting for WebSocket response -->
      <div v-if="wsChat?.isWaitingForResponse || isWaitingForResponse" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <!-- Animated dots -->
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>

        <!-- Backend status message -->
        <span class="text-gray-600 text-sm">
          {{ wsChat?.response[wsChat.response.length - 1]?.status || 'Processing...' }}
        </span>
      </div>

      <div ref="bottomAnchor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import QuestionBubble from '@/components/playback/QuestionBubble.vue';
import { useWebSocketChat } from '~/composables/useWebSocketChat';
// import { useLesson } from '~/composables/useLesson';
import { useMeStore } from '~/stores/me';
import { useCharacters } from '~/composables/useCharacters';

const messageStream = ref<any[]>([]);

const bottomAnchor = ref<HTMLElement | null>(null);

// Use computed conversation summary instead of static ref
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false);
const currentPlaybackIndex = ref(0);
const tokenCount = ref(0);

// WebSocket integration
const route = useRoute();
const router = useRouter();
const useWebSocket = ref(true); // WebSocket-only mode
const threadId = ref<string>('');
const wsChat = ref<ReturnType<typeof useWebSocketChat> | null>(null);
const isFirstMessage = ref(true);
const isWaitingForResponse = ref(false);
const currentThreadId = ref<string>(''); // Track initialized thread to prevent re-init
const isNewChatPendingConnection = ref(false); // Track if this is a new chat waiting for first message

if (import.meta.client) {
  tokenCount.value = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
}

// const { getLessonBundle } = useLesson();
const meStore = useMeStore();
const { selectedCharacter, initializeStore, selectCharacterBySlug, getPendingMessage, clearPendingMessage } = useCharacters();

// Dynamic conversation summary based on selected character
const conversationSummaryComputed = computed(() => {
  const character = selectedCharacter.value;
  if (character?.personality_prompt) {
    return character.personality_prompt;
  }
  return 'Eddy is a lion character that talks and is highly intelligent, he educates with passion.';
});

// Initialize chat with new routing structure
const initializeChat = async () => {
  console.log('Initializing chat...');

  const charSlug = route.params.charSlug as string;
  const routeThreadId = route.params.threadId as string;
  const userId = meStore.user_info_id || meStore.id;

  // If we already have this thread initialized and connected, skip re-initialization
  if (currentThreadId.value === threadId.value && wsChat.value?.isConnected && threadId.value) {
    console.log('Chat already initialized for this thread:', threadId.value);
    return;
  }

  console.log('Character Slug from route:', charSlug);
  console.log('Thread ID from route:', routeThreadId);
  console.log('User ID from store:', userId);

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

  // Ensure character store is initialized
  if (!selectedCharacter.value) {
    await initializeStore();
  }

  // Set character based on route if needed
  if (charSlug && (!selectedCharacter.value || selectedCharacter.value.slug !== charSlug)) {
    await selectCharacterBySlug(charSlug);
  }

  // Handle thread ID based on route
  if (routeThreadId === 'new') {
    // Generate new thread ID (clean format without character)
    threadId.value = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    isFirstMessage.value = true;
    isNewChatPendingConnection.value = true; // Mark as pending connection
  } else {
    // Use existing thread ID from route
    threadId.value = routeThreadId;
    isFirstMessage.value = false;
    isNewChatPendingConnection.value = false;
  }

  console.log('Using thread ID:', threadId.value);

  // Track the current thread ID to prevent unnecessary re-initialization
  currentThreadId.value = threadId.value;

  if (useWebSocket.value && threadId.value) {
    console.log('🚀 Initializing WebSocket chat with thread ID:', threadId.value);
    wsChat.value = useWebSocketChat(threadId.value);

    // Only connect immediately if this is NOT a new chat
    if (!isNewChatPendingConnection.value) {
      wsChat.value?.connect();
    } else {
      console.log('💤 Deferring WebSocket connection for new chat until first message');
    }

    // Watch for incoming WebSocket messages
    if (wsChat.value) {
      watch(() => wsChat.value!.response, (newMessages) => {
        if (newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          handleWebSocketMessage(lastMessage);
        }
      }, { deep: true });
    }

    // Check for pending message after WebSocket connects (only for existing chats)
    if (!isNewChatPendingConnection.value) {
      if (wsChat.value.isConnected) {
        checkAndSendPendingMessage();
      } else {
        // Wait for connection then check
        watch(() => wsChat.value?.isConnected, (connected) => {
          if (connected) {
            checkAndSendPendingMessage();
          }
        }, { immediate: true });
      }
    }
  }
};

onMounted(() => {
  initializeChat();

  // Watch for changes in user login state
  watch(() => meStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn && !wsChat.value) {
      console.log('User logged in, initializing chat...');
      initializeChat();
    }
  });

  // Watch for route changes to handle navigation between different chats
  watch(() => route.params.threadId, (newThreadId, oldThreadId) => {
    // Skip if this is the initial mount
    if (!oldThreadId) return;

    // Skip if we're going from 'new' to a threadId (this is our URL update)
    if (oldThreadId === 'new' && newThreadId !== 'new') {
      console.log('URL updated from new to threadId, skipping re-init');
      return;
    }

    // Only reinitialize for actual navigation between different chats
    if (oldThreadId !== 'new' && newThreadId !== oldThreadId) {
      console.log('Navigating to different chat thread, reinitializing');
      initializeChat();
    }
  });
});

onUnmounted(() => {
  if (wsChat.value) {
    wsChat.value.disconnect();
  }
});

// Check for and send any pending message (from redirect flow)
const checkAndSendPendingMessage = () => {
  const pendingMessage = getPendingMessage();
  if (pendingMessage && route.params.threadId !== 'new') {
    console.log('Found pending message, sending:', pendingMessage);
    clearPendingMessage();

    // Send the pending message
    nextTick(() => {
      handleSend(pendingMessage);
    });
  }
};

// Handle incoming WebSocket messages
const handleWebSocketMessage = (message: any) => {
  // Display any message with message.message field unconditionally
  if (message.status === 'user_message') {
    console.log('Received user_message message:', message);

    messageStream.value.push(message);

    // Update token count if provided
    if (message.tokenCount) {
      const currentTokenCount = parseInt(localStorage.getItem('tokenUsage') || '0', 10);
      const newTokenCount = currentTokenCount + message.tokenCount;
      localStorage.setItem('tokenUsage', newTokenCount.toString());
      tokenCount.value = newTokenCount;
    }

    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;

    nextTick(() => {
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  if (message.status === 'timeout' || message.status === 'cancelled' || message.status === 'error') {
    const lastIdx = messageStream.value.length - 1;
    if (lastIdx >= 0 && !messageStream.value[lastIdx].isUser) {
      messageStream.value[lastIdx] = {
        type: 'text',
        text: `[Timeout: ${message.error || 'Request error. Please try again.'}]`,
        isUser: false,
        playable: false,
      };
    }
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;
    return;
  }

  // Handle other message status types (heartbeat, status_update are handled by useWebSocketChat)
};

// Flatten the entire messageStream into an ordered array of playback units
const flattenedPlaybackUnits = computed(() => {
  console.log('Flattening message stream into playback units:', messageStream.value);
  const units: any[] = [];
  messageStream.value.forEach((block, blockIndex) => {
    if (block.text) {
      units.push({
        component: TextBubble,
        props: {
          text: block.text,
          isFirst: blockIndex === 0,
          isUser: block.isUser
        },
      });
    }
    if (Array.isArray(block.slides)) {
      block.slides.forEach((slide) => {
        units.push({
          component: SlideBubble,
          props: {
            slide,
            isUser: false,
            startPlayback: false, // controlled globally by parent
          },
        });
      });
    }
    if (Array.isArray(block.questions)) {
      block.questions.forEach((question) => {
        units.push({
          component: QuestionBubble,
          props: {
            text: question,
            isFirst: false,
          },
        });
      });
    }
    if (Array.isArray(block.options)) {
      block.options.forEach((option) => {
        units.push({
          component: TextBubble,
          props: {
            text: `Chapters: ${option.source_chapter}`,
            isUser: false,
            playable: false, // options are not playable
          },
        });
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

  // Add user message
  messageStream.value.push({
    type: 'text',
    text,
    isUser: true,
    playable: false,
  });

  // Handle deferred WebSocket connection for new chats
  if (useWebSocket.value && wsChat.value && isNewChatPendingConnection.value) {
    console.log('🔌 Connecting WebSocket for first message in new chat');
    wsChat.value.connect();
    isNewChatPendingConnection.value = false;

    // Wait for connection before sending
    const waitForConnection = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

      if (wsChat.value?.isConnected) {
        clearTimeout(timeout);
        resolve();
      } else {
        const unwatch = watch(() => wsChat.value?.isConnected, (connected) => {
          if (connected) {
            clearTimeout(timeout);
            unwatch();
            resolve();
          }
        });
      }
    });

    try {
      await waitForConnection;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Fall through to error handling below
    }
  }

  // Use WebSocket only
  if (useWebSocket.value && wsChat.value && wsChat.value.isConnected) {
    // Create user_info with character context
    const character = selectedCharacter.value;

    // Convert subject code to lowercase for backend
    const subjectForBackend = character?.subject?.toLowerCase() || 'general';

    const userInfo = {
      subject: subjectForBackend,
      level: meStore.level_type || 'PRIMARY_1',
      country: meStore.country_code || 'SG',
      character_slug: character?.slug,
      personality_prompt: character?.personality_prompt || conversationSummaryComputed.value,
    };

    let success = false;
    if (isFirstMessage.value) {
      success = wsChat.value.startChat(text, userInfo);
      isFirstMessage.value = false;

      // Update URL from /chat/character/new to /chat/character/threadId without component re-render
      if (route.params.threadId === 'new' && character) {
        const newUrl = `/chat/${character.slug}/${threadId.value}`;

        // Update URL without triggering Vue Router navigation to prevent flicker
        window.history.replaceState(
          { ...window.history.state, current: newUrl },
          '',
          newUrl
        );

        // Manually update route params to keep Vue Router in sync
        (route.params as any).threadId = threadId.value;

        console.log('Updated URL to:', newUrl);
      }
    } else {
      success = wsChat.value.sendUserResponse(text, userInfo);
    }

    if (success) {
      // Start loading state when message is sent successfully
      isWaitingForResponse.value = true;
    } else {
      // Handle WebSocket send failure
      const lastIdx = messageStream.value.length - 1;
      messageStream.value[lastIdx] = {
        type: 'text',
        text: '[Failed to send message - WebSocket connection error]',
        isUser: false,
        playable: false,
      };
      isPlayingAllowed.value = true;
      isWaitingForResponse.value = false;
    }
  } else {
    // No WebSocket connection available
    const lastIdx = messageStream.value.length - 1;
    messageStream.value[lastIdx] = {
      type: 'text',
      text: '[WebSocket not connected - please wait for connection]',
      isUser: false,
      playable: false,
    };
    isPlayingAllowed.value = true;
    isWaitingForResponse.value = false;
  }
};

// const constructLesson = (text: string) => {
//   isPlayingAllowed.value = false;

//   const lesson = getLessonBundle(text);
//   if (!lesson) {
//     messageStream.value.push({
//       type: 'text',
//       text: `Sorry, I couldn't find a lesson related to that topic.`,
//       isUser: false,
//       playable: false,
//     });
//     return;
//   }

//   const stream: any[] = [];

//   stream.push({
//     type: 'text',
//     text: `📘 ${lesson.parent.title}\n\n${cleanContent(lesson.parent.content)}`,
//     isUser: false,
//     playable: true,
//   });

//   if (lesson.slides?.length) {
//     stream.push({
//       type: 'slides',
//       slides: lesson.slides,
//     });
//   }

//   if (lesson.questions?.length) {
//     stream.push({
//       type: 'questions',
//       questions: lesson.questions.map((q: any) => formatLessonPart(q, lesson.questions)),
//     });
//   }

//   messageStream.value = [...messageStream.value, ...stream];

//   nextTick(() => {
//     isPlayingAllowed.value = true;
//   });
// };

// function cleanContent(raw: string): string {
//   return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image: $1]');
// }

// function formatLessonPart(item: any, allItems: any[]): string {
//   let output = '';
//   const label = item.part_label || item.title || '';

//   output += `${label}\n\n${cleanContent(item.content)}\n`;

//   if (item.type === 'question') {
//     const qType = item.question_type;

//     if (qType === 'mcq' && item.options?.length) {
//       output += '\n**Options:**\n';
//       item.options.forEach((opt: any, index: number) => {
//         if (opt.option_text) {
//           output += `- ${String.fromCharCode(65 + index)}. ${opt.option_text}\n`;
//         } else if (opt.imageUrl) {
//           output += `- ${String.fromCharCode(65 + index)}. [Image Option: ${opt.imageUrl}]\n`;
//         }
//       });
//     }

//     if (qType === 'boolean') {
//       output += `\n*(This is a True/False question)*`;
//     }

//     if (qType === 'open') {
//       const ans = item.answer?.[0]?.answer_text || '(Student provides open-ended answer)';
//       output += `\n**Expected Answer (open-ended):**\n${ans}`;
//     }

//     if (qType === 'fill') {
//       const answers = item.answer || [];
//       output += `\nExpected Answers (fill in the blanks):\n`;
//       answers.forEach((ans: any, idx: number) => {
//         output += `- Blank ${idx + 1}: ${ans.answer_text || '(No answer provided)'}\n`;
//       });
//     }

//     if (qType === 'draw') {
//       const ans = item.answer?.[0]?.answer_draw_file;
//       if (ans) output += `\n**Expected Drawing: [Drawing Image](${ans})\n`;
//       else output += `\n*(Draw response expected)*`;
//     }
//   }

//   if (item.explanation) {
//     output += `\n**Explanation:**\n${cleanContent(item.explanation)}`;
//   }

//   return output;
// }

// Clear chat method to reset all chat state
const clearChat = () => {
  messageStream.value = [];
  currentPlaybackIndex.value = 0;
  isPlayingAllowed.value = false;
  isWaitingForResponse.value = false;

  // Reset thread ID and navigate to new chat
  if (import.meta.client) {
    const userId = meStore.user_info_id || meStore.id;
    const character = selectedCharacter.value;

    if (!userId) {
      console.warn('No user ID available for clearChat');
      return;
    }

    // Generate new thread ID (clean format)
    threadId.value = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    isFirstMessage.value = true;

    // Navigate to new chat URL
    if (character) {
      router.replace(`/chat/${character.slug}/new`);
    }

    // Reconnect WebSocket with new thread ID
    if (wsChat.value) {
      wsChat.value.disconnect();
      wsChat.value = useWebSocketChat(threadId.value);
      wsChat.value?.connect();
      wsChat.value?.clearMessages();
    }
  }
};

// Expose methods to parent component
defineExpose({
  handleSend,
  clearChat,
});
</script>
