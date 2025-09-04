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
          <AuthenticationWidget />
        </div>

        <!-- Chat Content Area - takes remaining space -->
        <div class="flex-1 overflow-hidden relative">
          <ChatContent
            v-if="!isLoading"
            ref="chatContentRef"
            :thread-id="threadId"
            :messages="[]"
            :character="selectedCharacter"
            :thread-data="threadData"
            :task="task"
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

    <!-- Floating Audio Player -->
    <FloatingAudioPlayer
      :show="showFloatingAvatar"
      :initial-position="floatingPosition"
      :is-playing="isAvatarPlaying"
      @close="closeFloatingAvatar"
      @position-change="handlePositionChange"
      @collapse-toggle="handleCollapseToggle"
    />
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
import TaskNotificationRow from '@/components/chat/TaskNotificationRow.vue';
import FloatingAudioPlayer from '@/components/audio/FloatingAudioPlayer.vue';
import { useMeStore } from '~/stores/me';
import { useCharacters } from '~/composables/useCharacters';
import { useThreads } from '~/composables/useThreads';
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
const isFloatingCollapsed = ref(false);
const chatContentRef = ref<any>(null);
const floatingAudio = ref<HTMLAudioElement | null>(null);
const task = ref<any>(null); // Store task data for task threads
const threadData = ref<any>(null); // Store thread data

const router = useRouter();
const route = useRoute();
const meStore = useMeStore();
const { fetchThread, createThread, clearCurrentThread, setPendingMessage } = useThreads();

const {
  selectedCharacter,
  initializeStore,
  selectCharacterBySlug,
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
  // Initialize character store
  await initializeStore();

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
      isLoading.value = true;

      try {
        const response = await fetchThread(newThreadId);
        if (!response) return;
        const { thread, task: taskRes } = response;
        // Store thread data for use in ChatContent
        threadData.value = thread || null;
        // Store task data for use in ChatContent
        task.value = taskRes || null;
      } catch (err) {
        console.error('Error loading thread:', err);
      }

      // Set character based on route slug
      if (charSlug.value && charSlug.value !== selectedCharacter.value?.slug) {
        await selectCharacterBySlug(charSlug.value);
      }

      isLoading.value = false;
    } else if (newThreadId === 'new') {
      // Reset for new chat
      clearCurrentThread();
      hasStartedChat.value = false;
      task.value = null;

      // Clear chat content if available
      if (chatContentRef.value && chatContentRef.value.clearChat) {
        chatContentRef.value.clearChat();
      }
    }
  }
}, { immediate: true });

const handleCharacterSelection = async (character) => {
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
      const newThread = await createThread({
        title: text || 'New Chat',
        subject: selectedCharacter.value?.subject || null,
      });

      const newThreadUuid = newThread.id;
      await router.replace(`/chat/${charSlug.value}/${newThreadUuid}`);
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

const handlePositionChange = (position: { x: number; y: number }) => {
  floatingPosition.value = position;
};

const handleCollapseToggle = (collapsed: boolean) => {
  isFloatingCollapsed.value = collapsed;
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
