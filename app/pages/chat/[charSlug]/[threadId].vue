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
        v-if="!isSelectingCharacter"
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
          :hide-change-character="isSelectingCharacter || isChatCentered"
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
            ref="chatContentRef"
            :thread-id="threadId"
            :character="selectedCharacter"
          />

          <!-- Character Selection Overlay - only when selecting character -->
          <div
            v-if="isSelectingCharacter"
            class="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            <div class="w-full max-w-4xl px-4">
              <div
                class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div class="px-6 py-4 border-b border-gray-100">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">
                        Choose Your Character
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <p class="text-sm text-gray-600">
                          <span v-if="selectedCharacter">
                            Currently:
                            <span class="font-medium text-gray-800">{{
                              selectedCharacter.name
                            }}</span>
                            <span class="text-gray-500"
                              >({{
                                constantCaseToTitleCase(
                                  selectedCharacter.subject,
                                )
                              }})</span
                            >
                          </span>
                          <span v-else
                            >Select a character to start chatting</span
                          >
                        </p>
                      </div>
                    </div>
                    <button
                      class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      @click="isSelectingCharacter = false"
                    >
                      <Icon
                        name="i-heroicons-x-mark"
                        class="w-6 h-6 text-gray-600"
                      />
                    </button>
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
          </div>
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
            <!-- Character Carousel Card - only shown when centered (new chat) -->
            <div v-if="isChatCentered" class="mb-6">
              <div
                class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div class="px-6 py-4 border-b border-gray-100">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">
                        Choose Your Character
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <p class="text-sm text-gray-600">
                          <span v-if="selectedCharacter">
                            Currently:
                            <span class="font-medium text-gray-800">{{
                              selectedCharacter.name
                            }}</span>
                            <span class="text-gray-500"
                              >({{
                                constantCaseToTitleCase(
                                  selectedCharacter.subject,
                                )
                              }})</span
                            >
                          </span>
                          <span v-else
                            >Select a character to start chatting</span
                          >
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
          isDraggingAvatar
            ? 'cursor-grabbing'
            : 'transition-all duration-300 ease-out',
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
            <Icon
              name="i-heroicons-musical-note"
              class="w-5 h-5 text-gray-300"
            />
            <span class="text-sm font-medium text-gray-300">Audio Player</span>
          </div>
          <div class="flex items-center gap-1">
            <!-- Collapse/Expand Button -->
            <button
              class="p-1.5 hover:bg-gray-700 rounded transition-colors"
              @click="toggleFloatingCollapse"
            >
              <Icon
                :name="
                  isFloatingCollapsed
                    ? 'i-heroicons-chevron-down'
                    : 'i-heroicons-chevron-up'
                "
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
        <div
          v-if="!isFloatingCollapsed"
          class="flex flex-col"
          style="height: calc(100% - 48px)"
        >
          <!-- Avatar -->
          <div
            class="relative flex-1 overflow-hidden rounded-lg bg-white mx-2 mt-2 mb-2"
          >
            <Avatar :is-playing="isAvatarPlaying" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import ChatContent from "@/components/ChatContent.vue";
import ChatInput from "@/components/ChatInput.vue";
import CharacterCarousel from "@/components/CharacterCarousel.vue";
import AuthenticationWidget from "@/components/AuthenticationWidget.vue";
import Avatar from "@/components/avatar/Avatar.vue";
import Button from "@/components/common/Button.vue";
import { useToast } from "#imports";
import { useAudioStore } from "~/stores/audio";
import { useMeStore } from "~/stores/me";
import { useCharacters } from "~/composables/useCharacters";
import { constantCaseToTitleCase } from "~/utils/stringUtils";

// Prevent component remounting when URL changes
definePageMeta({
  key: "chat-page",
});

const collapsed = ref(true);
const isMobile = ref(false);
const isSelectingCharacter = ref(false);
const currentCharacter = ref(null);
const showContentTransitions = ref(false);
const hasStartedChat = ref(false);
const showFloatingAvatar = ref(false);
const floatingPosition = ref({ x: 0, y: 0 });
const isDraggingAvatar = ref(false);
const isFloatingCollapsed = ref(false);
const chatContentRef = ref<any>(null);
const floatingAudio = ref<HTMLAudioElement | null>(null);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const meStore = useMeStore();
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
const isNewChat = computed(() => threadId.value === "new");

// Computed properties for UI state
const isChatCentered = computed(() => {
  return (
    !hasStartedChat.value && showContentTransitions.value && isNewChat.value
  );
});

const shouldShowChatInput = computed(() => {
  return !isSelectingCharacter.value;
});

// Initialize character based on route
onMounted(async () => {
  // Initialize character store
  await initializeStore();

  // Set character based on route slug
  if (charSlug.value && charSlug.value !== selectedCharacter.value?.slug) {
    await selectCharacterBySlug(charSlug.value);
  }

  handleResize();
  window.addEventListener("resize", handleResize);

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

const handleLoginSuccess = () => {
  // Handle any additional actions after successful login
};

const handleRegisterSuccess = () => {
  // Handle any additional actions after successful registration
};

const handleLogout = () => {
  // Handle any additional actions after logout
};

const openCharacterSelection = () => {
  isSelectingCharacter.value = true;
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

  // Close character selection mode
  isSelectingCharacter.value = false;
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
  console.log(text, isNewChat.value, selectedCharacter.value);
  hasStartedChat.value = true;

  // If new chat, generate thread ID and update URL
  if (threadId.value === "new") {
    const userId = meStore.user_info_id || meStore.id;
    const newThreadId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(
      "New chat detected, storing pending message and redirecting:",
      newThreadId,
    );

    // Store pending message
    setPendingMessage(text);

    // Replace URL - this will trigger re-render with new threadId
    await router.replace(`/chat/${charSlug.value}/${newThreadId}`);
    try {
      const response = await fetch("/api/chat/thread", {
        // New API endpoint
        method: "POST", // Explicitly POST
        headers: {
          "Content-Type": "application/json", // Set content type
        },
        body: JSON.stringify({ title: text || null }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Fetch failed: ${response.status} - ${errorData.message || "Unknown error"}`,
        );
      }
      return; // Don't send yet, let re-render handle it
    } catch (err) {
      console.error("TTS Error:", err);
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

// Floating container button handlers
const handleFloatingCall = () => {
  toast.add({
    title: "Call",
    description: "Calling...",
    icon: "i-heroicons-phone-20-solid",
  });
};

const handleFloatingPlayAudio = async () => {
  const audioStore = useAudioStore();

  try {
    if (isPlaying.value && floatingAudio.value) {
      floatingAudio.value.pause();
      isPlaying.value = false;
      return;
    }

    if (!floatingAudio.value && audioStore.audioUrl) {
      floatingAudio.value = new Audio(audioStore.audioUrl);
      floatingAudio.value.volume = 1.0;

      floatingAudio.value.addEventListener("ended", () => {
        isPlaying.value = false;
      });
    }

    if (floatingAudio.value) {
      await floatingAudio.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error("Floating audio playback failed:", error);
  }
};

const handleFloatingMute = () => {
  toast.add({
    title: "Muted",
    description: "Microphone muted.",
    icon: "i-heroicons-microphone-slash-20-solid",
  });
};

const startDraggingAvatar = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "BUTTON" || target.closest("button")) {
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
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDragging);
  };

  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDragging);
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) collapsed.value = true;
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
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
