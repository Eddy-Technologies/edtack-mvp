<template>
  <div class="relative">
    <!-- Main Application -->
    <div
      :class="[
        'flex h-screen w-full overflow-hidden transition-opacity duration-300 ease-out',
        showContentTransitions ? 'opacity-100' : 'opacity-0',
      ]"
    >
      <!-- Fixed Width Sidebar -->
      <div
        ref="sidebar"
        :class="[
          'flex-shrink-0 border-r flex flex-col z-30',
          isMobile ? 'fixed top-0 left-0 h-full shadow-lg' : '',
        ]"
        :style="{ width: collapsed ? '80px' : '400px' }"
      >
        <Sidebar
          :collapsed="collapsed"
          :sidebar-width="collapsed ? 80 : 400"
          :is-mobile="isMobile"
          :active-thread-id="threadId"
          :is-connected="connectionStatus.isConnected"
          :is-connecting="connectionStatus.isConnecting"
          :has-error="connectionStatus.hasError"
          :is-waiting-for-response="connectionStatus.isWaitingForResponse"
          :response-phase="connectionStatus.responsePhase"
          @toggle-sidebar="toggleSidebar"
          @new-chat="handleNewChat"
        />
      </div>

      <!-- Backdrop for mobile -->
      <div
        v-if="isMobile && !collapsed"
        class="fixed inset-0 z-20 bg-black bg-opacity-40"
        @click="toggleSidebar"
      />

      <!-- Main Content Area -->
      <div class="flex flex-1 h-full overflow-hidden">
        <!-- Chat Column -->
        <div class="flex-1 flex flex-col h-full relative">
          <!-- Chat Content Area - takes remaining space -->
          <div class="flex-1 overflow-hidden relative">
            <!-- Loading state during thread creation -->
            <div
              v-if="isCreatingThread"
              class="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-10"
            >
              <div class="flex flex-col items-center gap-3">
                <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
                <span class="text-gray-500">Starting chat...</span>
              </div>
            </div>

            <ChatContent
              v-if="!isLoading"
              ref="chatContentRef"
              :thread-id="threadId"
              :messages="[]"
              :character="selectedCharacter"
              :thread-data="threadData"
              @response-received="handleResponseReceived"
              @open-slides="handleOpenSlides"
            />
          </div>

          <!-- Floating Chat Input -->
          <div
            v-if="shouldShowChatInput"
            :class="[
              'absolute bottom-0 left-0 right-0 z-20',
              isChatCentered
                ? 'top-0 bg-white/95 backdrop-blur-sm'
                : 'p-4 bg-white/95 backdrop-blur-sm',
            ]"
          >
            <!-- Centered layout: Single container with carousel and input -->
            <div v-if="isChatCentered" class="absolute inset-0 overflow-y-auto">
              <div class="min-h-full flex flex-col items-center justify-start pt-[15vh] pb-8 px-4">
                <div class="w-full max-w-4xl flex flex-col gap-6">
                  <!-- Character Carousel - fixed height -->
                  <div class="flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-800">Choose Your Character</h3>
                          <div class="flex items-center gap-2 mt-1">
                            <p class="text-sm text-gray-600">
                              <span v-if="selectedCharacter">
                                Currently:
                                <span class="font-medium text-gray-800">{{
                                  selectedCharacter.name
                                }}</span>
                                <span class="text-gray-500">({{ constantCaseToTitleCase(selectedCharacter.subject) }})</span>
                              </span>
                              <span v-else>Select a character to start chatting</span>
                            </p>
                          </div>
                        </div>
                        <UTooltip
                          :ui="{ base: 'h-auto px-2 py-1 text-xs font-normal', width: 'max-w-[200px]' }"
                          :popper="{ placement: 'bottom-end' }"
                        >
                          <template #text>
                            <span class="whitespace-normal">Click on a character to select your subject focus, then start typing below.</span>
                          </template>
                          <div class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-help transition-colors">
                            <UIcon name="i-lucide-help-circle" class="w-5 h-5 text-gray-500" />
                          </div>
                        </UTooltip>
                      </div>
                    </div>
                    <div class="p-4">
                      <CharacterCarousel
                        v-model="currentCharacter"
                        :initial-character-slug="charSlug"
                        :go-to-chat-on-click="true"
                        @select="handleCharacterSelection"
                      />
                    </div>
                  </div>

                  <!-- ChatInput - expands downward -->
                  <ChatInput
                    ref="chatInputRef"
                    :show-suggestions="!hasStartedChat && isNewChat"
                    :subject="selectedCharacter?.subject || 'GENERAL'"
                    @send="handleChatSend"
                  />
                </div>
              </div>
            </div>

            <!-- Non-centered layout: normal flow -->
            <div v-if="!isChatCentered" class="w-full max-w-4xl px-4 mx-auto">
              <ChatInput
                ref="chatInputRef"
                :show-suggestions="!hasStartedChat && isNewChat"
                :subject="selectedCharacter?.subject || 'GENERAL'"
                @send="handleChatSend"
              />
            </div>
          </div>
        </div>

        <!-- Slides Column (conditional) -->
        <SlideContainer
          v-if="showSlides"
          ref="slideContainerRef"
          :slides="selectedSlides"
          :message-id="selectedMessageId"
          :show-thumbnails="true"
          @close-split-view="handleCloseSlides"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed, nextTick } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { useToast } from '#imports';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import ChatInput from '@/components/ChatInput.vue';
import CharacterCarousel from '@/components/CharacterCarousel.vue';
import SlideContainer from '@/components/chat/SlideContainer.vue';
import { useCharacters } from '~/composables/useCharacters';
import { useThreads } from '~/composables/useThreads';
import { useMessageQueueStore } from '~/stores/messageQueue';
import { constantCaseToTitleCase } from '~/utils/stringUtils';
import type { _height } from '#tailwind-config/theme';

// Set page title
useHead({
  title: 'Chat'
});

// Prevent component remounting when URL changes
definePageMeta({
  key: 'chat-page',
  middleware: 'auth',
});

const isLoading = ref(true);
const isCreatingThread = ref(false);
const collapsed = ref(true);
const isMobile = ref(true);
const currentCharacter = ref(null);
const showContentTransitions = ref(true);
const hasStartedChat = ref(false);
const chatContentRef = ref<any>(null);
const chatInputRef = ref<any>(null);
const slideContainerRef = ref<any>(null);
const threadData = ref<any>(null); // Store thread data

// Connection status state (reactive tracking from child component)
const connectionStatus = ref({
  isConnected: false,
  isConnecting: false,
  hasError: false,
  isWaitingForResponse: false,
  responsePhase: '',
});

// Slide state management (lifted from ChatContent)
const selectedSlides = ref<any[]>([]);
const selectedMessageId = ref<string | null>(null);
const showSlides = computed(() => selectedSlides.value.length > 0);

const router = useRouter();
const route = useRoute();
const supabaseUser = useSupabaseUser();
const toast = useToast();
const messageQueueStore = useMessageQueueStore();
const { fetchThread, createThread, reset, setPendingMessage, consumeCreatedThread } = useThreads();

const {
  selectedCharacter,
  initializeStore,
  selectCharacterBySlug,
} = useCharacters();

// Get route parameters
const charSlug = computed(() => route.params.charSlug as string);
const threadId = computed(() => route.params.threadId as string);
const isNewChat = computed(() => threadId.value === 'new');

// Computed properties for UI state
const isChatCentered = computed(() => {
  return !hasStartedChat.value && showContentTransitions.value && isNewChat.value;
});

const shouldShowChatInput = computed(() => {
  return true;
});

// Route update guard - prevent thread changes during WebSocket response
onBeforeRouteUpdate(() => {
  return preventNavigation();
});

// Route leave guard - prevent navigation during WebSocket response
onBeforeRouteLeave(() => {
  return preventNavigation();
});

const preventNavigation = () => {
  // Check if slide answer is being marked (this truly can't continue in background)
  if (slideContainerRef.value?.isAnySubmitting) {
    const confirmed = confirm('Your answer is being marked. Are you sure you want to leave?');
    return confirmed;
  }

  // Check if chat is processing - show toast but allow navigation (continues in background)
  const currentThreadId = threadId.value;
  if (currentThreadId && currentThreadId !== 'new') {
    const threadState = messageQueueStore.getThreadState(currentThreadId);
    if (threadState?.status === 'processing' || connectionStatus.value.isWaitingForResponse) {
      // Show toast notification - chat will continue in background
      toast.add({
        title: 'Chat continuing in background',
        description: 'You can return to see the response when ready.',
        icon: 'i-heroicons-information-circle',
        color: 'blue',
        timeout: 4000,
      });
    }
  }

  return true;
};

// Initialize character based on route
onMounted(async () => {
  // Initialize character store
  await initializeStore();

  handleResize();
  window.addEventListener('resize', handleResize);

  // Set sidebar collapsed if user is logged in but hasn't started chatting
  if (supabaseUser.value && !hasStartedChat.value) {
    collapsed.value = true;
  }

  // Handle study prompt injection from query parameters
  if (isNewChat.value && route.query.study_prompt) {
    await handleStudyPromptInjection();
  }
});

// Connection status polling interval
let connectionStatusInterval: ReturnType<typeof setInterval> | null = null;

// Watch for connection status changes from ChatContent
watch(
  () => chatContentRef.value,
  (chatContent: any) => {
    // Clear previous interval if exists
    if (connectionStatusInterval) {
      clearInterval(connectionStatusInterval);
      connectionStatusInterval = null;
    }

    if (chatContent) {
      // Set up interval to poll connection status from child
      // Note: Exposed computed refs need .value access when read via template refs
      const updateConnectionStatus = () => {
        // Handle both ref and plain value access patterns
        const getValue = (prop: any) => {
          if (prop === null || prop === undefined) return prop;
          return typeof prop === 'object' && 'value' in prop ? prop.value : prop;
        };
        const newStatus = {
          isConnected: getValue(chatContent.chatIsConnected) || false,
          isConnecting: getValue(chatContent.chatIsConnecting) || false,
          hasError: !!getValue(chatContent.chatError),
          isWaitingForResponse: getValue(chatContent.chatIsWaitingForResponse) || false,
          responsePhase: getValue(chatContent.chatResponsePhase) || '',
        };
        // Only update if changed to avoid unnecessary reactivity
        if (JSON.stringify(connectionStatus.value) !== JSON.stringify(newStatus)) {
          connectionStatus.value = newStatus;
        }
      };
      // Initial update
      updateConnectionStatus();
      // Watch for changes via interval
      connectionStatusInterval = setInterval(updateConnectionStatus, 100);
    }
  },
  { immediate: true }
);

// Clean up interval on unmount
onBeforeUnmount(() => {
  if (connectionStatusInterval) {
    clearInterval(connectionStatusInterval);
    connectionStatusInterval = null;
  }
});

// Watch for threadId changes to handle URL updates
watch(threadId, async (newThreadId, oldThreadId) => {
  if (newThreadId !== oldThreadId) {
    // Close slides panel when navigating to a different thread
    selectedSlides.value = [];
    selectedMessageId.value = null;

    // If switching to existing thread, load messages
    if (newThreadId && newThreadId !== 'new') {
      // Check if we have cached thread from createThread (skip redundant fetch)
      const cachedThread = consumeCreatedThread();

      if (cachedThread && cachedThread.id === newThreadId) {
        // Use cached data, skip fetch
        threadData.value = cachedThread;
        isLoading.value = false;
      } else {
        // Normal fetch for existing threads
        isLoading.value = true;

        try {
          const response = await fetchThread(newThreadId);
          if (!response) return;
          const { thread } = response;
          // Store thread data for use in ChatContent
          threadData.value = thread || null;
        } catch (err) {
          console.error('Error loading thread:', err);
        }

        isLoading.value = false;
      }

      // Set character based on route slug
      if (charSlug.value && charSlug.value !== selectedCharacter.value?.slug) {
        await selectCharacterBySlug(charSlug.value);
      }
    } else if (newThreadId === 'new') {
      // Reset for new chat
      reset();
      hasStartedChat.value = false;

      // Clear chat content if available
      if (chatContentRef.value && chatContentRef.value.clearChat) {
        chatContentRef.value.clearChat();
      }
    }
  }
}, { immediate: true });

const handleCharacterSelection = async (character) => {
  // Close slides panel when changing character
  selectedSlides.value = [];
  selectedMessageId.value = null;

  // Update character store
  await selectCharacterBySlug(character.slug);

  // Navigate to new chat with selected character
  await router.replace(`/chat/${character.slug}/new`);

  // Reset chat state to start new conversation
  hasStartedChat.value = false;

  // Clear chat content if available
  if (chatContentRef.value && chatContentRef.value.clearChat) {
    chatContentRef.value.clearChat();
  }
};

const handleNewChat = () => {
  // Navigate to new chat with current character
  if (selectedCharacter.value) {
    router.replace(`/chat/${selectedCharacter.value.slug}/new`);
  }

  // Reset chat state
  hasStartedChat.value = false;

  // Close slides panel
  selectedSlides.value = [];
  selectedMessageId.value = null;

  // Clear chat content if available
  if (chatContentRef.value && chatContentRef.value.clearChat) {
    chatContentRef.value.clearChat();
  }
};

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const handleChatSend = async (text: string) => {
  hasStartedChat.value = true;

  // If new chat, generate thread ID and update URL
  if (threadId.value === 'new') {
    isCreatingThread.value = true;
    setPendingMessage(text);

    try {
      const newThread = await createThread({
        title: text || 'New Chat',
        subject: selectedCharacter.value?.subject || null,
      });

      const newThreadUuid = newThread.id;
      await router.replace(`/chat/${charSlug.value}/${newThreadUuid}`);
    } catch (err) {
      console.error('Thread creation error', err);
    } finally {
      isCreatingThread.value = false;
    }
    return;
  }

  // Existing chat - send directly
  if (chatContentRef.value && chatContentRef.value.handleSend) {
    await chatContentRef.value.handleSend(text);
  }
};

// Reset ChatInput sending state when response is received
const handleResponseReceived = () => {
  if (chatInputRef.value && chatInputRef.value.resetSendState) {
    chatInputRef.value.resetSendState();
  }
};

// Slide event handlers
const handleOpenSlides = (slides: any[], messageId?: string) => {
  selectedSlides.value = slides;
  selectedMessageId.value = messageId || null;
};

const handleCloseSlides = () => {
  selectedSlides.value = [];
  selectedMessageId.value = null;
};

const handleStudyPromptInjection = async () => {
  const studyPrompt = route.query.study_prompt as string;

  if (!studyPrompt) return;

  // Wait a bit for the page to be fully initialized
  await nextTick();

  // Automatically send the study prompt
  try {
    // Add a brief delay to ensure smooth UX
    setTimeout(async () => {
      await handleChatSend(studyPrompt);

      // Clear the query parameters from URL after injection to keep URL clean
      await router.replace({
        path: route.path,
        query: {}
      });
    }, 1000);
  } catch (error) {
    console.error('Failed to inject study prompt:', error);
  }
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) collapsed.value = true;
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
