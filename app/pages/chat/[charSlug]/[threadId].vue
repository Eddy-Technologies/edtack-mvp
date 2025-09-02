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
          :is-avatar-floating="showFloatingAvatar"
          @toggle-sidebar="toggleSidebar"
          @toggle-floating-avatar="toggleFloatingAvatar"
          @new-chat="handleNewChat"
        />
      </div>

      <!-- Backdrop for mobile -->
      <div
        v-if="isMobile && !collapsed"
        class="fixed inset-0 z-20 bg-black bg-opacity-40"
        @click="toggleSidebar"
      />

      <!-- Main Content -->
      <div class="flex flex-col flex-1 h-full relative">
        <!-- Top Bar with User Avatar -->
        <div
          :class="[
            'flex justify-end items-center px-4 py-3 bg-white relative z-50 transition-all duration-400 ease-out',
            showContentTransitions
              ? 'opacity-100 transform scale-100'
              : 'opacity-0 transform scale-95',
          ]"
          :style="{ transitionDelay: showContentTransitions ? '0.2s' : '0s' }"
        >
          <AuthenticationWidget
            @login-success="handleLoginSuccess"
            @register-success="handleRegisterSuccess"
            @logout="handleLogout"
          />
        </div>

        <!-- Chat Content Area - takes remaining space -->
        <div class="flex-1 overflow-hidden relative">
          <ChatContent
            v-if="!isLoading"
            ref="chatContentRef"
            :thread-id="threadId"
            :messages="messages"
            :character="selectedCharacter"
          />
        </div>

        <!-- Chat Input - positioned as footer below content -->
        <div
          v-if="shouldShowChatInput"
          :class="[
            'flex flex-col items-center gap-4 shadow-lg flex-shrink-0',
            isChatCentered
              ? 'fixed top-0 bottom-0 bg-white/95 backdrop-blur-sm justify-center z-30'
              : 'bg-white border-t p-6',
          ]"
          :style="{
            left: isChatCentered ? (collapsed ? '80px' : '400px') : 'auto',
            right: isChatCentered ? '0' : 'auto',
          }"
        >
          <div class="w-full max-w-4xl px-4">
            <!-- Task Notification Row - only shown when centered (new chat) -->
            <TaskNotificationRow v-if="isChatCentered && meStore.isLoggedIn" />

            <!-- Character Carousel Card - only shown when centered (new chat) -->
            <div v-if="isChatCentered" class="mb-6">
              <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
            </div>

            <div class="w-full max-w-4xl mx-auto">
              <ChatInput @send="handleChatSend" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Avatar Container -->
    <Transition name="float">
      <div
        v-if="showFloatingAvatar"
        ref="floatingAvatar"
        :class="[
          'fixed z-50 bg-gray-700 rounded-xl shadow-2xl overflow-hidden',
          isDraggingAvatar ? 'cursor-grabbing' : 'transition-all duration-300 ease-out',
        ]"
        :style="{
          left: floatingPosition.x + 'px',
          top: floatingPosition.y + 'px',
          width: '300px',
          height: isFloatingCollapsed ? '48px' : '250px',
        }"
      >
        <!-- Header Panel -->
        <div
          :class="[
            'bg-gray-800 px-3 py-2 flex items-center justify-between',
            isDraggingAvatar ? 'cursor-grabbing' : 'cursor-move',
          ]"
          @mousedown="startDraggingAvatar"
        >
          <div class="flex items-center gap-2">
            <Icon name="i-heroicons-musical-note" class="w-5 h-5 text-gray-300" />
            <span class="text-sm font-medium text-gray-300">Audio Player</span>
          </div>
          <div class="flex items-center gap-1">
            <!-- Collapse/Expand Button -->
            <button
              class="p-1.5 hover:bg-gray-700 rounded transition-colors"
              @click="toggleFloatingCollapse"
            >
              <Icon
                :name="isFloatingCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
                class="w-4 h-4 text-gray-300"
              />
            </button>
            <!-- Close Button -->
            <button
              class="p-1.5 hover:bg-gray-700 rounded transition-colors"
              @click="closeFloatingAvatar"
            >
              <Icon name="i-heroicons-x-mark" class="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <!-- Container Content (visible when not collapsed) -->
        <div v-if="!isFloatingCollapsed" class="flex flex-col" style="height: calc(100% - 48px)">
          <!-- Avatar -->
          <div class="relative flex-1 overflow-hidden rounded-lg bg-white mx-2 mt-2 mb-2">
            <Avatar :is-playing="isAvatarPlaying" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import ChatInput from '@/components/ChatInput.vue';
import CharacterCarousel from '@/components/CharacterCarousel.vue';
import AuthenticationWidget from '@/components/AuthenticationWidget.vue';
import Avatar from '@/components/avatar/Avatar.vue';
import TaskNotificationRow from '@/components/chat/TaskNotificationRow.vue';
import { useToast } from '#imports';
import { useMeStore } from '~/stores/me';
import { useChatStore } from '~/stores/chat';
import { useCharacters } from '~/composables/useCharacters';
import { constantCaseToTitleCase } from '~/utils/stringUtils';

// Prevent component remounting when URL changes
definePageMeta({
  key: 'chat-page',
});

const isLoading = ref(true);
const collapsed = ref(true);
const isMobile = ref(false);
const currentCharacter = ref(null);
const showContentTransitions = ref(false);
const hasStartedChat = ref(false);
const showFloatingAvatar = ref(false);
const floatingPosition = ref({ x: 0, y: 0 });
const isDraggingAvatar = ref(false);
const isFloatingCollapsed = ref(false);
const chatContentRef = ref<any>(null);
const floatingAudio = ref<HTMLAudioElement | null>(null);
const messages = ref([]);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const meStore = useMeStore();
const chatStore = useChatStore();

const {
  selectedCharacter,
  initializeStore,
  selectCharacterBySlug,
  selectCharacterById,
  setPendingMessage,
  isAvatarPlaying,
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

// Initialize character based on route
onMounted(async () => {
  console.log('Mounted chat page with charSlug:', charSlug.value, 'and threadId:', threadId.value);
  if (!isNewChat.value && threadId.value) {
    chatStore.setThreadId(threadId.value);
    try {
      const response = await fetch(`/api/chat/${threadId.value}`);
      if (!response.ok) {
        // Thread does not exist or error
        throw new Error(`Thread not found or API error: ${response.status}`);
      }

      const result = await response.json();

      const processMessages = (data) => {
        return data.map((message) => ({
          ...message,
          isUser: true,
        }));
      };

      messages.value = processMessages(result.messageData);

      isLoading.value = false;
    } catch (err) {
      toast.add({
        title: 'Thread not found',
        description: 'The chat thread does not exist. Starting a new chat.',
        icon: 'i-heroicons-exclamation-triangle-20-solid',
      });

      // Navigate to a new chat
      if (selectedCharacter.value) {
        await router.replace(`/chat/${selectedCharacter.value.slug}/new`);
      }
    }
  } else {
    isLoading.value = false;
  }
  // Initialize character store
  await initializeStore();

  // Set character based on route slug
  if (charSlug.value && charSlug.value !== selectedCharacter.value?.slug) {
    await selectCharacterBySlug(charSlug.value);
  }

  handleResize();
  window.addEventListener('resize', handleResize);

  // Set initial floating position
  floatingPosition.value = {
    x: window.innerWidth / 2 - 150,
    y: window.innerHeight / 2 - 165,
  };

  // Set sidebar collapsed if user is logged in but hasn't started chatting
  if (meStore.isLoggedIn && !hasStartedChat.value) {
    collapsed.value = true;
  }

  // Content transitions can start immediately since global loading is handled in app.vue
  showContentTransitions.value = true;
});

// Watch for threadId changes to handle URL updates
watch(threadId, async (newThreadId, oldThreadId) => {
  if (newThreadId !== oldThreadId) {
    console.log('ThreadId changed from', oldThreadId, 'to', newThreadId);

    // If switching to existing thread, load messages
    if (newThreadId && newThreadId !== 'new') {
      chatStore.setThreadId(newThreadId);
      isLoading.value = true;

      try {
        const response = await fetch(`/api/chat/${threadId.value}`);
        if (!response.ok) {
        // Thread does not exist or error
          throw new Error(`Thread not found or API error: ${response.status}`);
        }

        const result = await response.json();

        const processMessages = (data) => {
          return data.map((message) => ({
            ...message,
            text: message.content,
            isUser: true,
          }));
        };

        messages.value = processMessages(result.messageData);
      } catch (err) {
        console.error('Error loading thread:', err);
      }

      isLoading.value = false;
    } else if (newThreadId === 'new') {
      // Reset for new chat
      messages.value = [];
      hasStartedChat.value = false;

      // Clear chat content if available
      if (chatContentRef.value && chatContentRef.value.clearChat) {
        chatContentRef.value.clearChat();
      }
    }
  }
});

const handleLoginSuccess = () => {
  // Handle any additional actions after successful login
};

const handleRegisterSuccess = () => {
  // Handle any additional actions after successful registration
};

const handleLogout = () => {
  // Handle any additional actions after logout
};

const handleCharacterSelection = async (character) => {
  // Update character store
  await selectCharacterById(character.id);

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
    const userId = meStore.user_info_id || meStore.id;
    setPendingMessage(text);

    try {
      const response = await fetch('/api/chat/thread', {
        // New API endpoint
        method: 'POST', // Explicitly POST
        headers: {
          'Content-Type': 'application/json', // Set content type
        },
        body: JSON.stringify({
          title: text || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Fetch failed: ${response.status} - ${errorData.message || 'Unknown error'}`
        );
      } else {
        const resJson = await response.json();
        const newThreadUuid = resJson.data.id;
        await router.replace(`/chat/${charSlug.value}/${newThreadUuid}`);
        chatStore.setThreadId(newThreadUuid);
      }
    } catch (err) {
      console.error('Thread creation error', err);
    }
  }

  // Existing chat - send directly
  if (chatContentRef.value && chatContentRef.value.handleSend) {
    await chatContentRef.value.handleSend(text);
  }
};

const toggleFloatingAvatar = () => {
  showFloatingAvatar.value = !showFloatingAvatar.value;
};

const closeFloatingAvatar = () => {
  showFloatingAvatar.value = false;
  isFloatingCollapsed.value = false;
};

const toggleFloatingCollapse = () => {
  isFloatingCollapsed.value = !isFloatingCollapsed.value;
};

const startDraggingAvatar = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.closest('button')) {
    return;
  }

  isDraggingAvatar.value = true;
  const startX = e.clientX - floatingPosition.value.x;
  const startY = e.clientY - floatingPosition.value.y;

  const handleDrag = (e: MouseEvent) => {
    if (isDraggingAvatar.value) {
      floatingPosition.value = {
        x: e.clientX - startX,
        y: e.clientY - startY,
      };
    }
  };

  const stopDragging = () => {
    isDraggingAvatar.value = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDragging);
  };

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDragging);
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) collapsed.value = true;
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (floatingAudio.value) {
    floatingAudio.value.pause();
    floatingAudio.value = null;
  }
});
</script>
