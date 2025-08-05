<template>
  <div class="relative">
    <!-- Loading Screen -->
    <Transition
      name="fade"
      @after-leave="showContentTransitions = true"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        <div class="text-center">
          <AppIcon name="i-heroicons-sparkles" class="w-16 h-16 text-gray-500 mb-4 justify-self-center" />
          <h1 class="text-4xl md:text-6xl font-bold text-gray-800">
            <span>Welcome to</span> <span class="text-primary animate-pulse">StudyWithEddy</span>
          </h1>
        </div>
      </div>
    </Transition>

    <!-- Main Application -->
    <div
      :class="[
        'flex h-screen w-full overflow-hidden transition-opacity duration-300 ease-out',
        showContentTransitions ? 'opacity-100' : 'opacity-0'
      ]"
    >
      <!-- Fixed Width Sidebar -->
      <div
        v-if="!isSelectingCharacter"
        ref="sidebar"
        :class="[
          'flex-shrink-0 border-r flex flex-col z-30',
          isMobile ? 'fixed top-0 left-0 h-full shadow-lg' : '',
          showContentTransitions ? 'sidebar-transition' : 'transform -translate-x-full',
        ]"
        :style="{ width: collapsed ? '80px' : '400px' }"
      >
        <Sidebar
          :collapsed="collapsed"
          :sidebar-width="collapsed ? 80 : 400"
          :is-mobile="isMobile"
          :is-avatar-floating="showFloatingAvatar"
          @toggle-sidebar="toggleSidebar"
          @change-character="openCharacterSelection"
          @toggle-floating-avatar="toggleFloatingAvatar"
          @new-chat="handleNewChat"
        />
      </div>

      <!-- Backdrop for mobile -->
      <div
        v-if="!isSelectingCharacter && isMobile && !collapsed"
        class="fixed inset-0 z-20 bg-black bg-opacity-40"
        @click="toggleSidebar"
      />

      <!-- Main Content -->
      <div class="flex flex-col flex-1 h-full relative">
        <!-- Top Bar with User Avatar -->
        <div
          :class="[
            'flex justify-end items-center px-4 py-3 bg-white relative z-50 transition-all duration-400 ease-out',
            showContentTransitions ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
          ]"
          :style="{ transitionDelay: showContentTransitions ? '0.2s' : '0s' }"
        >
          <AuthenticationWidget
            @login-success="handleLoginSuccess"
            @register-success="handleRegisterSuccess"
            @logout="handleLogout"
          />
        </div>

        <!-- Chat Content Below -->
        <div class="flex-1 overflow-y-auto relative">
          <ChatContent ref="chatContentRef" />

          <!-- Chat Input (separate from ChatContent) -->
          <div
            v-if="shouldShowChatInput"
            :class="[
              'z-10 flex flex-col items-center gap-4 shadow-lg transition-all duration-500 ease-out',
              isChatCentered
                ? 'fixed inset-0 bg-white/95 backdrop-blur-sm justify-center'
                : 'absolute bottom-0 left-0 right-0 bg-white p-10',
              showContentTransitions ? 'transform translate-y-0' : 'transform translate-y-full'
            ]"
            :style="{ transitionDelay: showContentTransitions ? '0.4s' : '0s' }"
          >
            <div class="w-full max-w-2xl px-4">
              <ChatInput @send="handleChatSend" />

              <!-- "Or choose a character" button - only shown when centered -->
              <div v-if="isChatCentered" class="mt-4 text-center">
                <Button
                  variant="primary"
                  @click="openCharacterSelection"
                >
                  Or Choose a Character
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Character Selection Carousel -->
      <div
        v-if="isSelectingCharacter"
        class="fixed inset-0 z-50 bg-white flex flex-col"
      >
        <!-- Header with close button -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800">Choose Your Character</h2>
          <button
            class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            @click="isSelectingCharacter = false"
          >
            <Icon name="i-heroicons-x-mark" class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <!-- Carousel Container -->
        <div class="flex-1 flex items-center justify-center">
          <CharacterCarousel
            v-model="currentCharacter"
            :go-to-chat-on-click="false"
            @select="handleCharacterSelection"
          />
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
          isDraggingAvatar ? 'cursor-grabbing' : 'transition-all duration-300 ease-out'
        ]"
        :style="{
          left: floatingPosition.x + 'px',
          top: floatingPosition.y + 'px',
          width: '300px',
          height: isFloatingCollapsed ? '48px' : '330px'
        }"
      >
        <!-- Header Panel -->
        <div
          :class="[
            'bg-gray-800 px-3 py-2 flex items-center justify-between',
            isDraggingAvatar ? 'cursor-grabbing' : 'cursor-move'
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
        <div v-if="!isFloatingCollapsed" class="flex flex-col" style="height: calc(100% - 48px);">
          <!-- Avatar -->
          <div class="relative h-[200px] overflow-hidden rounded-lg bg-white mx-2 mt-2 flex-shrink-0">
            <Avatar :is-playing="isPlaying" />
          </div>

          <!-- Unified Controls -->
          <div class="flex justify-center items-center gap-3 mt-4 px-4 pb-4 flex-shrink-0">
            <button
              class="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200"
              @click="handleFloatingCall"
            >
              <Icon name="i-heroicons-phone" class="w-5 h-5" />
            </button>
            <button
              class="p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all duration-200"
              @click="handleFloatingPlayAudio"
            >
              <Icon
                :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                class="w-5 h-5"
              />
            </button>
            <button
              class="p-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full shadow-lg transition-all duration-200"
              @click="handleFloatingMute"
            >
              <Icon name="i-heroicons-microphone" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import ChatInput from '@/components/ChatInput.vue';
import CharacterCarousel from '@/components/CharacterCarousel.vue';
import AuthenticationWidget from '@/components/AuthenticationWidget.vue';
import Avatar from '@/components/avatar/Avatar.vue';
import Button from '@/components/common/Button.vue';
import { useToast } from '#imports';
import { useAudioStore } from '~/stores/audio';
import { useMeStore } from '~/stores/me';

const collapsed = ref(true);
const isMobile = ref(false);
const isSelectingCharacter = ref(false);
const currentCharacter = ref(null);
const isLoading = ref(true);
const showContentTransitions = ref(false);
const hasStartedChat = ref(false);
const showFloatingAvatar = ref(false);
const floatingPosition = ref({ x: 0, y: 0 });
const isDraggingAvatar = ref(false);
const isFloatingCollapsed = ref(false);
const isPlaying = ref(false);
const chatContentRef = ref<any>(null);
const floatingAudio = ref<HTMLAudioElement | null>(null);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const meStore = useMeStore();

// Computed properties for UI state
const isChatCentered = computed(() => {
  return !hasStartedChat.value && showContentTransitions.value && !isSelectingCharacter.value;
});

const shouldShowChatInput = computed(() => {
  return !isSelectingCharacter.value;
});

const handleLoginSuccess = () => {
  // Handle any additional actions after successful login
  // AuthenticationWidget already handles the modal closing
};

const handleRegisterSuccess = () => {
  // Handle any additional actions after successful registration
  // AuthenticationWidget already handles the modal closing
};

const handleLogout = () => {
  // Handle any additional actions after logout
  // AuthenticationWidget already handles the logout process
};

const openCharacterSelection = () => {
  isSelectingCharacter.value = true;
};

const handleCharacterSelection = (character) => {
  currentCharacter.value = character;
  // Reset chat state to start new conversation
  hasStartedChat.value = false;
  // Clear chat content if chatContentRef exists and has clearChat method
  if (chatContentRef.value && chatContentRef.value.clearChat) {
    chatContentRef.value.clearChat();
  }
  // Exit character selection mode
  isSelectingCharacter.value = false;
};

const handleNewChat = () => {
  // Reset chat state to start new conversation
  hasStartedChat.value = false;
  // Clear chat content if chatContentRef exists and has clearChat method
  if (chatContentRef.value && chatContentRef.value.clearChat) {
    chatContentRef.value.clearChat();
  }
};

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const handleChatSend = (text: string) => {
  hasStartedChat.value = true;
  if (chatContentRef.value && chatContentRef.value.handleSend) {
    chatContentRef.value.handleSend(text);
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

// Floating container button handlers
const handleFloatingCall = () => {
  toast.add({ title: 'Call', description: 'Calling...', icon: 'i-heroicons-phone-20-solid' });
};

const handleFloatingPlayAudio = async () => {
  const audioStore = useAudioStore();

  try {
    if (isPlaying.value && floatingAudio.value) {
      // Pause current audio
      floatingAudio.value.pause();
      isPlaying.value = false;
      return;
    }

    // Create new audio if none exists
    if (!floatingAudio.value && audioStore.audioUrl) {
      floatingAudio.value = new Audio(audioStore.audioUrl);
      floatingAudio.value.volume = 1.0;

      floatingAudio.value.addEventListener('ended', () => {
        isPlaying.value = false;
      });
    }

    // Play audio
    if (floatingAudio.value) {
      await floatingAudio.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('Floating audio playback failed:', error);
  }
};

const handleFloatingMute = () => {
  toast.add({
    title: 'Muted',
    description: 'Microphone muted.',
    icon: 'i-heroicons-microphone-slash-20-solid',
  });
};

const startDraggingAvatar = (e: MouseEvent) => {
  // Check if the click target is a button
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
        y: e.clientY - startY
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

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);

  // Set initial floating position (centered for 300px width, 330px height container)
  floatingPosition.value = {
    x: window.innerWidth / 2 - 150,
    y: window.innerHeight / 2 - 165
  };

  // Set sidebar collapsed if user is logged in but hasn't started chatting
  if (meStore.isLoggedIn && !hasStartedChat.value) {
    collapsed.value = true;
  }

  // Simulate loading time
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (floatingAudio.value) {
    floatingAudio.value.pause();
    floatingAudio.value = null;
  }
});
</script>

<style scoped>
/* Loading screen fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar slide-in animation */
.sidebar-transition {
  animation: slideInLeft 0.5s ease-out forwards;
}

/* Authentication widget and chat input now use CSS transitions directly in the template */

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* fadeIn and slideUp keyframes removed - now using CSS transitions */

/* Floating avatar transition */
.float-enter-active,
.float-leave-active {
  transition: all 0.3s ease;
}

.float-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.float-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
