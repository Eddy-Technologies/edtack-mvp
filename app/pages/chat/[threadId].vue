<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Rate Limit Banner for Anonymous Users -->
    <RateLimitBanner
      v-if="isAnonymousMode && (isRateLimited || isNearLimit)"
      :remaining="remainingMessages"
      :reset-time="formattedResetTime"
      :is-limited="isRateLimited"
      @signup="navigateToSignup"
    />

    <!-- Signup Nudge Modal -->
    <SignupNudge
      v-if="showSignupNudge"
      :reason="signupNudgeReason"
      @close="dismissSignupNudge"
      @signup="navigateToSignup"
      @login="navigateToLogin"
    />

    <!-- Main Application -->
    <div
      :class="[
        'flex flex-1 w-full overflow-hidden transition-opacity duration-300 ease-out',
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
          :is-anonymous="isAnonymousMode"
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
          <!-- Mobile Header with Hamburger and Study Button -->
          <div
            v-if="isMobile"
            class="flex items-center justify-between h-12 px-3 border-b border-gray-200 bg-white flex-shrink-0"
          >
            <button
              class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              @click="toggleSidebar"
            >
              <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-600" />
            </button>
            <button
              class="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              @click="toggleStudyPanel"
            >
              <UIcon name="i-lucide-book-open" class="w-5 h-5 text-gray-600" />
              <span class="text-sm text-gray-600">Study</span>
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
              :character="defaultCharacter"
              :thread-data="threadData"
              :chat-input-height="chatInputHeight"
              :is-anonymous="isAnonymousMode"
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
            <!-- Centered layout: Welcome message and input -->
            <div v-if="isChatCentered" class="absolute inset-0 overflow-y-auto">
              <div class="min-h-full flex flex-col items-center justify-start pt-4 sm:pt-8 pb-8 px-4">
                <div class="w-full max-w-4xl flex flex-col gap-4">
                  <!-- Welcome Card -->
                  <div class="flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                    <div class="flex items-center gap-4">
                      <!-- Character Avatar -->
                      <div class="flex-shrink-0">
                        <img
                          :src="getCharacterImageUrl('eddy.png')"
                          alt="Eddy"
                          class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary/20"
                        >
                      </div>
                      <div class="flex-1 min-w-0">
                        <h2 class="text-lg md:text-xl font-semibold text-gray-900">
                          Hi! I'm Eddy
                        </h2>
                        <p class="text-sm md:text-base text-gray-600 mt-1">
                          I'm here to help you learn. Ask me anything or use the Study panel to start a lesson!
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- ChatInput -->
                  <ChatInput
                    ref="chatInputRef"
                    :show-suggestions="isNewChat"
                    :subject="defaultCharacter?.subject || 'GENERAL'"
                    :is-processing="connectionStatus.isWaitingForResponse"
                    :thread-id="threadId !== 'new' ? threadId : ''"
                    :is-anonymous="isAnonymousMode"
                    @send="handleChatSend"
                    @dropdown-opened="handleDropdownOpened"
                    @dropdown-closed="handleDropdownClosed"
                    @open-study-panel="toggleStudyPanel"
                  />
                </div>
              </div>
            </div>

            <!-- Non-centered layout: normal flow -->
            <div v-if="!isChatCentered" class="w-full max-w-4xl px-4 mx-auto">
              <ChatInput
                ref="chatInputRef"
                :show-suggestions="isNewChat"
                :subject="defaultCharacter?.subject || 'GENERAL'"
                :is-processing="connectionStatus.isWaitingForResponse"
                :thread-id="threadId !== 'new' ? threadId : ''"
                :is-anonymous="isAnonymousMode"
                @send="handleChatSend"
                @dropdown-opened="handleDropdownOpened"
                @dropdown-closed="handleDropdownClosed"
                @open-study-panel="toggleStudyPanel"
              />
            </div>
          </div>
        </div>

        <!-- Study Panel (desktop) -->
        <StudyPanel
          v-if="showStudyPanel && !isMobile"
          :model-value="showStudyPanel"
          @close="toggleStudyPanel"
          @study-action="handleStudyAction"
        />

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

      <!-- Desktop Study Panel Toggle -->
      <button
        v-if="!isMobile && !showStudyPanel && !showSlides"
        class="fixed right-4 bottom-24 z-20 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        title="Open Study Panel"
        @click="toggleStudyPanel"
      >
        <UIcon name="i-lucide-book-open" class="w-5 h-5 text-primary" />
      </button>
    </div>

    <!-- Study Panel (mobile drawer) -->
    <StudyPanel
      v-if="isMobile"
      :model-value="showStudyPanel"
      @close="toggleStudyPanel"
      @study-action="handleStudyAction"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed, nextTick } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { useToast } from '#imports';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import ChatInput from '@/components/ChatInput.vue';
import SlideContainer from '@/components/chat/SlideContainer.vue';
import StudyPanel from '@/components/chat/StudyPanel.vue';
import RateLimitBanner from '@/components/RateLimitBanner.vue';
import SignupNudge from '@/components/SignupNudge.vue';
import { useCharacters } from '~/composables/useCharacters';
import { useThreads } from '~/composables/useThreads';
import { useAnonymousMode } from '~/composables/useAnonymousMode';
import { useMessageQueueStore } from '~/stores/messageQueue';
import { useAnalytics } from '~/composables/useAnalytics';
import { useResponsive } from '~/composables/useResponsive';
import { useTour } from '~/composables/useTour';
import { useMeStore } from '~/stores/me';
import { getSupabaseAccessToken } from '~/utils/authToken';
import type { StudyActionType } from '~/composables/useStudy';

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
const showContentTransitions = ref(true);
const hasStartedChat = ref(false);
const chatContentRef = ref<any>(null);
const chatInputRef = ref<any>(null);
const chatInputWrapperRef = ref<HTMLElement | null>(null);
const slideContainerRef = ref<any>(null);
const threadData = ref<any>(null);
const chatInputHeight = ref(0);
const showStudyPanel = ref(false);

// Chapter dropdown state for coordination
const isChapterDropdownOpen = ref(false);

// Connection status state
const connectionStatus = ref({
  isConnected: false,
  isConnecting: false,
  hasError: false,
  isWaitingForResponse: false,
  responsePhase: '',
});

// Slide state management
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

// Anonymous mode
const {
  isAnonymousMode,
  remainingMessages,
  isRateLimited,
  isNearLimit,
  formattedResetTime,
  showSignupNudge,
  signupNudgeReason,
  fetchRateLimitStatus,
  updateRateLimitAfterMessage,
  canSendMessage,
  dismissSignupNudge,
  navigateToLogin,
  navigateToSignup,
} = useAnonymousMode();

// Analytics tracking state
const sessionMessageCount = ref(0);
const sessionSlideCount = ref(0);

// Character setup - always use default (Eddy)
const { fetchCharacters, initializeStore, getCharacterImageUrl, getLastActiveCharacterSlug } = useCharacters();
const defaultCharacter = ref<any>(null);

// Get route parameters
const threadId = computed(() => route.params.threadId as string);
const isNewChat = computed(() => threadId.value === 'new');

// Computed properties for UI state
const isChatCentered = computed(() => {
  return !hasStartedChat.value && showContentTransitions.value && isNewChat.value;
});

const shouldShowChatInput = computed(() => {
  return true;
});

// Responsive sidebar width
const sidebarExpandedWidthNumber = computed(() => {
  if (isMobile.value) {
    return Math.min(windowWidth.value * 0.85, 300);
  }
  return 400;
});

const sidebarExpandedWidth = computed(() => {
  return `${sidebarExpandedWidthNumber.value}px`;
});

// Route guards
onBeforeRouteUpdate(() => {
  return preventNavigation();
});

onBeforeRouteLeave(() => {
  return preventNavigation();
});

const preventNavigation = () => {
  if (slideContainerRef.value?.isAnySubmitting) {
    const confirmed = confirm('Your answer is being marked. Are you sure you want to leave?');
    return confirmed;
  }

  const currentThreadId = threadId.value;
  if (currentThreadId && currentThreadId !== 'new') {
    const threadState = messageQueueStore.getThreadState(currentThreadId);
    if (threadState?.status === 'processing' || connectionStatus.value.isWaitingForResponse) {
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

// Handler for tour
const handleOpenSidebarForTour = () => {
  collapsed.value = false;
};

// Initialize
onMounted(async () => {
  // Initialize character store and get default character
  await initializeStore();
  const characters = await fetchCharacters(false);
  const lastSlug = getLastActiveCharacterSlug() || 'eddy';
  defaultCharacter.value = characters.find((c: any) => c.slug === lastSlug) || characters.find((c: any) => c.slug === 'eddy') || characters[0];

  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('openChatSidebar', handleOpenSidebarForTour);

  if (isMobile.value) {
    collapsed.value = true;
  }

  // Fetch rate limit status for anonymous users
  if (isAnonymousMode.value) {
    await fetchRateLimitStatus();
  }

  // Handle study prompt injection
  if (isNewChat.value && route.query.study_prompt) {
    await handleStudyPromptInjection();
  }

  // Track chat session start
  if (!isNewChat.value && threadId.value) {
    analytics.chat.sessionStart({
      threadId: threadId.value,
      subject: defaultCharacter.value?.subject || 'unknown',
      isNewThread: false,
    });
  }

  // Start chat tour for new authenticated users
  if (!isAnonymousMode.value && meStore.onboarding_completed && !isTourCompleted('chat-tour')) {
    setTimeout(() => {
      startTour('chat-tour', isMobile.value);
    }, 800);
  }
});

// Connection status polling
let connectionStatusInterval: ReturnType<typeof setInterval> | null = null;
let chatInputResizeObserver: ResizeObserver | null = null;

const setupChatInputHeightObserver = () => {
  if (chatInputResizeObserver) {
    chatInputResizeObserver.disconnect();
  }

  chatInputResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (!isChatCentered.value) {
        chatInputHeight.value = entry.contentRect.height;
      }
    }
  });

  if (chatInputWrapperRef.value) {
    chatInputResizeObserver.observe(chatInputWrapperRef.value);
  }
};

watch(chatInputWrapperRef, (newRef: HTMLElement | null) => {
  if (newRef) {
    setupChatInputHeightObserver();
  }
}, { immediate: true });

watch(
  () => chatContentRef.value,
  (chatContent: any) => {
    if (connectionStatusInterval) {
      clearInterval(connectionStatusInterval);
      connectionStatusInterval = null;
    }

    if (chatContent) {
      const updateConnectionStatus = () => {
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
        if (JSON.stringify(connectionStatus.value) !== JSON.stringify(newStatus)) {
          connectionStatus.value = newStatus;
        }
      };
      updateConnectionStatus();
      connectionStatusInterval = setInterval(updateConnectionStatus, 100);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (connectionStatusInterval) {
    clearInterval(connectionStatusInterval);
    connectionStatusInterval = null;
  }

  if (chatInputResizeObserver) {
    chatInputResizeObserver.disconnect();
    chatInputResizeObserver = null;
  }

  if (threadId.value && threadId.value !== 'new') {
    analytics.chat.sessionEnd({
      threadId: threadId.value,
      messageCount: sessionMessageCount.value,
      slideCount: sessionSlideCount.value,
    });
  }
});

// Watch for threadId changes
watch(threadId, async (newThreadId, oldThreadId) => {
  if (newThreadId !== oldThreadId) {
    selectedSlides.value = [];
    selectedMessageId.value = null;

    connectionStatus.value = {
      isConnected: false,
      isConnecting: true,
      hasError: false,
      isWaitingForResponse: false,
      responsePhase: '',
    };

    if (newThreadId && newThreadId !== 'new') {
      const cachedThread = consumeCreatedThread();

      if (cachedThread && cachedThread.id === newThreadId) {
        // For anonymous users, only clear messages from OLD threads (previous sessions)
        // Keep messages for threads created in the current session (e.g., seeded lessons)
        if (isAnonymousMode.value && cachedThread.thread_messages) {
          const threadCreatedAt = new Date(cachedThread.created_at).getTime();
          const now = Date.now();
          const isRecentThread = now - threadCreatedAt < 30000; // 30 seconds

          if (!isRecentThread) {
            cachedThread.thread_messages = [];
            console.log('[ThreadPage] Cleared messages for anonymous user (old thread)');
          } else {
            console.log('[ThreadPage] Keeping messages for anonymous user (recent thread)');
          }
        }
        threadData.value = cachedThread;
        isLoading.value = false;
      } else {
        isLoading.value = true;

        try {
          console.log('[ThreadPage] Fetching thread from DB:', newThreadId);
          const response = await fetchThread(newThreadId);
          if (!response) return;
          const { thread } = response;
          console.log('[ThreadPage] Thread fetched, messages count:', thread?.thread_messages?.length || 0);

          // For anonymous users, only clear messages from OLD threads (previous sessions)
          // Keep messages for threads created in the current session (e.g., seeded lessons)
          if (isAnonymousMode.value && thread?.thread_messages) {
            const threadCreatedAt = new Date(thread.created_at).getTime();
            const now = Date.now();
            const isRecentThread = now - threadCreatedAt < 30000; // 30 seconds

            if (!isRecentThread) {
              thread.thread_messages = [];
              console.log('[ThreadPage] Cleared messages for anonymous user (old thread)');
            } else {
              console.log('[ThreadPage] Keeping messages for anonymous user (recent thread)');
            }
          }

          threadData.value = thread || null;
        } catch (err) {
          console.error('Error loading thread:', err);
        }

        isLoading.value = false;
      }
    } else if (newThreadId === 'new') {
      reset();
      hasStartedChat.value = false;

      if (chatContentRef.value && chatContentRef.value.clearChat) {
        chatContentRef.value.clearChat();
      }
    }
  }
}, { immediate: true });

// Watch for study_prompt query parameter
watch(
  () => route.query.study_prompt,
  async (newStudyPrompt) => {
    if (newStudyPrompt && isNewChat.value) {
      await handleStudyPromptInjection();
    }
  },
  { immediate: false }
);

// Handlers
const handleDropdownOpened = () => {
  isChapterDropdownOpen.value = true;
};

const handleDropdownClosed = () => {
  isChapterDropdownOpen.value = false;
};

const handleNewChat = () => {
  router.replace('/chat/new');
  hasStartedChat.value = false;
  selectedSlides.value = [];
  selectedMessageId.value = null;

  if (chatContentRef.value && chatContentRef.value.clearChat) {
    chatContentRef.value.clearChat();
  }
};

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebar-collapsed', String(collapsed.value));
};

const toggleStudyPanel = () => {
  showStudyPanel.value = !showStudyPanel.value;
  // Close slides panel if opening study panel
  if (showStudyPanel.value && showSlides.value) {
    selectedSlides.value = [];
    selectedMessageId.value = null;
  }
};

const handleStudyAction = async (action: { prompt: string; subject: string; actionType: StudyActionType }) => {
  // Close study panel
  showStudyPanel.value = false;

  // Navigate to new chat with study prompt
  const queryParams = new URLSearchParams({
    study_prompt: action.prompt,
  });

  await router.push(`/chat/new?${queryParams.toString()}`);
};

const handleChatSend = async (payload: { text: string; fileIds: string[]; pendingFiles?: File[]; fileAttachments?: any[] }) => {
  const { text, pendingFiles, fileAttachments } = payload;

  // Check rate limit for anonymous users
  if (isAnonymousMode.value) {
    const { allowed, reason } = await canSendMessage();
    if (!allowed) {
      toast.add({
        title: 'Rate limit reached',
        description: reason || 'Please sign up for unlimited access.',
        color: 'yellow',
        timeout: 5000,
      });
      return;
    }
  }

  hasStartedChat.value = true;

  if (threadId.value === 'new') {
    isCreatingThread.value = true;
    setPendingMessage(text);

    try {
      let newThread;

      if (isAnonymousMode.value) {
        // Create anonymous thread
        const response = await $fetch<{ success: boolean; data: any; rateLimit?: any }>('/api/chat/anon/thread', {
          method: 'POST',
          body: {
            title: text || 'New Chat',
            subject: defaultCharacter.value?.subject || null,
          },
        });

        if (!response.success) {
          throw new Error('Failed to create thread');
        }

        newThread = response.data;

        // Update rate limit
        if (response.rateLimit) {
          updateRateLimitAfterMessage(response.rateLimit.remaining, response.rateLimit.resetAt);
        }
      } else {
        // Create authenticated thread
        newThread = await createThread({
          title: text || 'New Chat',
          subject: defaultCharacter.value?.subject || null,
        });
      }

      const newThreadUuid = newThread.id;

      // Handle file uploads (authenticated users only for now)
      if (!isAnonymousMode.value && pendingFiles && pendingFiles.length > 0) {
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
        }
      }

      await router.replace(`/chat/${newThreadUuid}`);
    } catch (err) {
      console.error('Thread creation error', err);
      toast.add({
        title: 'Error',
        description: 'Failed to create chat. Please try again.',
        color: 'red',
        timeout: 5000,
      });
    } finally {
      isCreatingThread.value = false;
    }
    return;
  }

  // Existing chat - send directly
  if (chatContentRef.value && chatContentRef.value.handleSend) {
    await chatContentRef.value.handleSend(text, false, fileAttachments);
  }
};

const handleResponseReceived = () => {
  if (chatInputRef.value && chatInputRef.value.resetSendState) {
    chatInputRef.value.resetSendState();
  }
};

const handleOpenSlides = (slides: any[], messageId?: string, startIndex?: number) => {
  selectedSlides.value = slides;
  selectedMessageId.value = messageId || null;
  selectedSlideIndex.value = startIndex || 0;
  // Close study panel when opening slides
  showStudyPanel.value = false;
};

const handleCloseSlides = () => {
  selectedSlides.value = [];
  selectedMessageId.value = null;
  selectedSlideIndex.value = 0;
};

const handleStudyPromptInjection = async () => {
  const studyPrompt = route.query.study_prompt as string;

  if (!studyPrompt) return;

  await nextTick();

  try {
    setTimeout(async () => {
      await handleChatSend({ text: studyPrompt, fileIds: [] });

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
});
</script>
