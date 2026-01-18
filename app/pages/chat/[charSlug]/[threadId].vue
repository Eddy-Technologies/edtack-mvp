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
        v-if="!isMobile || !collapsed"
        ref="sidebar"
        :class="[
          'flex-shrink-0 border-r flex flex-col z-30',
          isMobile ? 'fixed top-0 left-0 h-full shadow-lg' : '',
        ]"
        :style="{ width: collapsed ? '80px' : sidebarExpandedWidth }"
      >
        <Sidebar
          :collapsed="collapsed"
          :sidebar-width="collapsed ? 80 : sidebarExpandedWidthNumber"
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
        <div class="flex-1 flex flex-col h-full relative min-w-0">
          <!-- Mobile Header with Hamburger -->
          <div
            v-if="isMobile"
            class="flex items-center h-12 px-3 border-b border-gray-200 bg-white flex-shrink-0"
          >
            <button
              class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              @click="toggleSidebar"
            >
              <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Chat Content Area - takes remaining space -->
          <div class="flex-1 overflow-hidden relative">
            <!-- Loading state during thread creation or loading -->
            <div
              v-if="isCreatingThread || isLoadingThread"
              class="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-10"
            >
              <div class="flex flex-col items-center gap-3">
                <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
                <span class="text-gray-500">{{ isCreatingThread ? 'Starting chat...' : 'Loading conversation...' }}</span>
              </div>
            </div>

            <ChatContent
              v-if="!isLoading"
              ref="chatContentRef"
              :thread-id="threadId"
              :messages="[]"
              :character="selectedCharacter"
              :thread-data="threadData"
              :chat-input-height="chatInputHeight"
              @response-received="handleResponseReceived"
              @open-slides="handleOpenSlides"
            />
          </div>

          <!-- Floating Chat Input -->
          <div
            v-if="shouldShowChatInput"
            ref="chatInputWrapperRef"
            :class="[
              'absolute bottom-0 left-0 right-0 z-10',
              isChatCentered
                ? `${isMobile ? 'top-12' : 'top-0'} bg-white/95 backdrop-blur-sm`
                : 'p-4 bg-white/95 backdrop-blur-sm',
            ]"
          >
            <!-- Centered layout: Single container with carousel and input -->
            <div v-if="isChatCentered" class="absolute inset-0 overflow-y-auto">
              <div class="min-h-full flex flex-col items-center justify-start pt-4 sm:pt-8 pb-8 px-4">
                <div class="w-full max-w-4xl flex flex-col gap-4">
                  <!-- Character Carousel - fixed height -->
                  <div class="flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible">
                    <!-- Header - hidden on mobile for cleaner look -->
                    <div class="px-3 py-3 md:px-6 md:py-4 border-b border-gray-100">
                      <div class="flex items-center justify-between gap-2 md:gap-4">
                        <!-- Group heading and dropdown together -->
                        <div class="flex items-center gap-2 md:gap-3">
                          <h3 class="text-base md:text-lg font-semibold text-gray-800">Choose Your Character</h3>

                          <!-- Character Dropdown Selector -->
                          <div class="relative w-full sm:w-56 md:w-64 max-w-[calc(100vw-6rem)] z-50" data-tour="character-selector">
                            <button
                              class="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2"
                              @click="toggleCharacterDropdown"
                            >
                              <span class="truncate flex-1 text-left">{{ dropdownButtonText }}</span>
                              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 flex-shrink-0 transition-transform" :class="characterDropdownOpen ? 'rotate-180' : ''" />
                            </button>

                            <!-- Dropdown menu -->
                            <div
                              v-if="characterDropdownOpen"
                              class="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50 w-full min-w-[200px] max-w-[calc(100vw-2rem)]"
                              @click.stop
                            >
                              <button
                                v-for="character in availableCharacters"
                                :key="character.id"
                                class="w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                                :class="[
                                  character.slug === selectedCharacter?.slug
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                ]"
                                @click="selectCharacterFromDropdown(character)"
                              >
                                <div class="font-medium">{{ character.name }}</div>
                                <div class="text-xs" :class="character.slug === selectedCharacter?.slug ? 'text-primary-600' : 'text-gray-500'">
                                  {{ constantCaseToTitleCase(character.subject) }}
                                </div>
                              </button>
                            </div>
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
                    <div v-show="!isChapterDropdownOpen" :class="isMobile ? 'p-2' : 'p-4'">
                      <CharacterCarousel
                        ref="characterCarouselRef"
                        v-model="currentCharacter"
                        :initial-character-slug="charSlug"
                        :collapsed="isChapterDropdownOpen"
                        :go-to-chat-on-click="true"
                        @select="handleCharacterSelection"
                      />
                    </div>
                  </div>

                  <!-- ChatInput - expands downward -->
                  <ChatInput
                    ref="chatInputRef"
                    :show-suggestions="isNewChat"
                    :subject="selectedCharacter?.subject || 'GENERAL'"
                    :is-processing="connectionStatus.isWaitingForResponse"
                    :thread-id="threadId !== 'new' ? threadId : ''"
                    @send="handleChatSend"
                    @dropdown-opened="handleDropdownOpened"
                    @dropdown-closed="handleDropdownClosed"
                  />
                </div>
              </div>
            </div>

            <!-- Non-centered layout: normal flow -->
            <div v-if="!isChatCentered" class="w-full max-w-4xl px-4 mx-auto">
              <ChatInput
                ref="chatInputRef"
                :show-suggestions="isNewChat"
                :subject="selectedCharacter?.subject || 'GENERAL'"
                :is-processing="connectionStatus.isWaitingForResponse"
                :thread-id="threadId !== 'new' ? threadId : ''"
                @send="handleChatSend"
                @dropdown-opened="handleDropdownOpened"
                @dropdown-closed="handleDropdownClosed"
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
          :initial-slide-index="selectedSlideIndex"
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
import { useAnalytics } from '~/composables/useAnalytics';
import { useResponsive } from '~/composables/useResponsive';
import { useTour } from '~/composables/useTour';
import { useMeStore } from '~/stores/me';
import { constantCaseToTitleCase } from '~/utils/stringUtils';
import { getSupabaseAccessToken } from '~/utils/authToken';
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

// Initialize collapsed state from localStorage, default to true
const getInitialCollapsedState = () => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('sidebar-collapsed');
  return stored !== null ? stored === 'true' : true;
};

const collapsed = ref(getInitialCollapsedState());
const { isMobile } = useResponsive();
const windowWidth = ref(768);
const currentCharacter = ref(null);
const showContentTransitions = ref(true);
const hasStartedChat = ref(false);
const chatContentRef = ref<any>(null);
const chatInputRef = ref<any>(null);
const chatInputWrapperRef = ref<HTMLElement | null>(null);
const slideContainerRef = ref<any>(null);
const characterCarouselRef = ref<any>(null);
const threadData = ref<any>(null); // Store thread data
const chatInputHeight = ref(0); // Dynamic chat input height for scroll padding

// Character dropdown state
const characterDropdownOpen = ref(false);
const availableCharacters = ref<any[]>([]);

// Chapter dropdown state for carousel collapse coordination
const isChapterDropdownOpen = ref(false);

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
const selectedSlideIndex = ref<number>(0);
const showSlides = computed(() => selectedSlides.value.length > 0);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const messageQueueStore = useMessageQueueStore();
const analytics = useAnalytics();
const { fetchThread, createThread, reset, setPendingMessage, consumeCreatedThread, isLoadingThread } = useThreads();
const { startTour, isTourCompleted } = useTour();
const meStore = useMeStore();

// Analytics tracking state
const sessionMessageCount = ref(0);
const sessionSlideCount = ref(0);

const { fetchCharacters } = useCharacters();

const dropdownButtonText = computed(() => {
  return selectedCharacter.value ?
    `${selectedCharacter.value.name} - ${constantCaseToTitleCase(selectedCharacter.value.subject)}` :
    'Select Character';
});

const toggleCharacterDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  characterDropdownOpen.value = !characterDropdownOpen.value;
};

const closeCharacterDropdown = () => {
  characterDropdownOpen.value = false;
};

const selectCharacterFromDropdown = async (character: any) => {
  closeCharacterDropdown();

  // Scroll carousel to the selected character
  if (characterCarouselRef.value && characterCarouselRef.value.scrollToCharacter) {
    characterCarouselRef.value.scrollToCharacter(character.slug);
  }

  // Handle character selection
  await handleCharacterSelection(character);
};

// Handler for chapter dropdown opened event
const handleDropdownOpened = () => {
  isChapterDropdownOpen.value = true;
};

// Handler for chapter dropdown closed event
const handleDropdownClosed = () => {
  isChapterDropdownOpen.value = false;
};

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

// Responsive sidebar width - on mobile, fit within viewport with some margin
const sidebarExpandedWidthNumber = computed(() => {
  if (isMobile.value) {
    // On mobile, use 85% of viewport width or 300px max
    return Math.min(windowWidth.value * 0.85, 300);
  }
  return 400;
});

const sidebarExpandedWidth = computed(() => {
  return `${sidebarExpandedWidthNumber.value}px`;
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

// Handler for tour to open sidebar (works for both mobile and desktop)
const handleOpenSidebarForTour = () => {
  collapsed.value = false;
};

// Initialize character based on route
onMounted(async () => {
  // Initialize character store
  await initializeStore();

  // Load all characters for dropdown
  try {
    const characters = await fetchCharacters(false);
    availableCharacters.value = characters;
  } catch (error) {
    console.error('Failed to load characters for dropdown:', error);
  }

  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('openChatSidebar', handleOpenSidebarForTour);
  document.addEventListener('click', closeCharacterDropdown);

  // On mobile, always start collapsed regardless of saved preference
  if (isMobile.value) {
    collapsed.value = true;
  }
  // On desktop, use saved preference (already loaded from localStorage)

  // Handle study prompt injection from query parameters
  if (isNewChat.value && route.query.study_prompt) {
    await handleStudyPromptInjection();
  }

  // Track chat session start
  if (!isNewChat.value && threadId.value) {
    analytics.chat.sessionStart({
      threadId: threadId.value,
      subject: selectedCharacter.value?.subject || 'unknown',
      isNewThread: false,
    });
  }

  // Start chat tour for new users who completed onboarding
  if (meStore.onboarding_completed && !isTourCompleted('chat-tour')) {
    setTimeout(() => {
      startTour('chat-tour', isMobile.value);
    }, 800);
  }
});

// Connection status polling interval
let connectionStatusInterval: ReturnType<typeof setInterval> | null = null;

// ResizeObserver for chat input height
let chatInputResizeObserver: ResizeObserver | null = null;

// Set up ResizeObserver to track chat input height
const setupChatInputHeightObserver = () => {
  if (chatInputResizeObserver) {
    chatInputResizeObserver.disconnect();
  }

  chatInputResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Only update when not in centered mode (new chat)
      if (!isChatCentered.value) {
        chatInputHeight.value = entry.contentRect.height;
      }
    }
  });

  if (chatInputWrapperRef.value) {
    chatInputResizeObserver.observe(chatInputWrapperRef.value);
  }
};

// Watch for chatInputWrapperRef changes
watch(chatInputWrapperRef, (newRef: HTMLElement | null) => {
  if (newRef) {
    setupChatInputHeightObserver();
  }
}, { immediate: true });

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

  // Clean up ResizeObserver
  if (chatInputResizeObserver) {
    chatInputResizeObserver.disconnect();
    chatInputResizeObserver = null;
  }

  // Track chat session end
  if (threadId.value && threadId.value !== 'new') {
    analytics.chat.sessionEnd({
      threadId: threadId.value,
      messageCount: sessionMessageCount.value,
      slideCount: sessionSlideCount.value,
    });
  }
});

// Watch for threadId changes to handle URL updates
watch(threadId, async (newThreadId, oldThreadId) => {
  if (newThreadId !== oldThreadId) {
    // Close slides panel when navigating to a different thread
    selectedSlides.value = [];
    selectedMessageId.value = null;

    // Reset connection status immediately to prevent stale error showing on new thread
    connectionStatus.value = {
      isConnected: false,
      isConnecting: true,
      hasError: false,
      isWaitingForResponse: false,
      responsePhase: '',
    };

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
          console.log('[ThreadPage] Fetching thread from DB:', newThreadId);
          const response = await fetchThread(newThreadId);
          if (!response) return;
          const { thread } = response;
          console.log('[ThreadPage] Thread fetched, messages count:', thread?.thread_messages?.length || 0);
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

// Watch for study_prompt query parameter changes (for navigation-based injection)
watch(
  () => route.query.study_prompt,
  async (newStudyPrompt) => {
    // Only trigger if we have a study prompt and we're on a new chat
    if (newStudyPrompt && isNewChat.value) {
      await handleStudyPromptInjection();
    }
  },
  { immediate: false } // Don't run immediately since onMounted handles initial load
);

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
  // Persist sidebar state to localStorage
  localStorage.setItem('sidebar-collapsed', String(collapsed.value));
};

const handleChatSend = async (payload: { text: string; fileIds: string[]; pendingFiles?: File[]; fileAttachments?: any[] }) => {
  const { text, pendingFiles, fileAttachments } = payload;
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

      // If there are pending files, upload them to the new thread before redirect
      if (pendingFiles && pendingFiles.length > 0) {
        try {
          const token = await getSupabaseAccessToken();
          const headers: Record<string, string> = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const formData = new FormData();
          pendingFiles.forEach((file) => formData.append('files', file));

          await $fetch(`/api/chat/${newThreadUuid}/files/upload`, {
            method: 'POST',
            body: formData,
            headers,
          });
          console.log(`[handleChatSend] Uploaded ${pendingFiles.length} files to new thread ${newThreadUuid}`);
        } catch (uploadErr) {
          console.error('File upload error for new thread:', uploadErr);
          // Continue even if upload fails - user can re-add files
        }
      }

      await router.replace(`/chat/${charSlug.value}/${newThreadUuid}`);
    } catch (err) {
      console.error('Thread creation error', err);
    } finally {
      isCreatingThread.value = false;
    }
    return;
  }

  // Existing chat - send directly (files are already staged on backend)
  if (chatContentRef.value && chatContentRef.value.handleSend) {
    await chatContentRef.value.handleSend(text, false, fileAttachments);
  }
};

// Reset ChatInput sending state when response is received
const handleResponseReceived = () => {
  if (chatInputRef.value && chatInputRef.value.resetSendState) {
    chatInputRef.value.resetSendState();
  }
};

// Slide event handlers
const handleOpenSlides = (slides: any[], messageId?: string, startIndex?: number) => {
  selectedSlides.value = slides;
  selectedMessageId.value = messageId || null;
  selectedSlideIndex.value = startIndex || 0;
};

const handleCloseSlides = () => {
  selectedSlides.value = [];
  selectedMessageId.value = null;
  selectedSlideIndex.value = 0;
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
      await handleChatSend({ text: studyPrompt, fileIds: [] });

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
  windowWidth.value = window.innerWidth;
  if (isMobile.value) collapsed.value = true;
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('openChatSidebar', handleOpenSidebarForTour);
  document.removeEventListener('click', closeCharacterDropdown);
});
</script>
