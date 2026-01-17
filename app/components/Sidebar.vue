<template>
  <aside class="h-full flex flex-col border-r border-gray-200 bg-stone-50 max-w-[900px] overflow-visible">
    <!-- Header -->
    <div :class="['p-3 flex items-center', isMini ? 'justify-center' : 'justify-between']">
      <img
        v-if="!isMini"
        src="/logo.png"
        alt="eddy"
        class="w-9 h-9 hover:bg-gray-200/60 rounded-lg cursor-pointer transition-colors"
        @click="routeTo('/')"
      >
      <button
        :class="['p-1.5 rounded-md hover:bg-gray-200/60 text-gray-500 transition-colors', isMini ? 'w-full' : '']"
        @click="emit('toggle-sidebar')"
      >
        <Icon
          :name="props.collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-3">
        <div class="pt-2">
          <button
            :class="['flex items-center w-full px-3 py-2 rounded-lg border bg-primary hover:bg-primary/75 text-sm font-medium text-white transition-colors', isMini ? 'justify-center' : 'gap-2']"
            @click="handleNewChat"
          >
            <Icon name="i-heroicons-plus" class="w-5 h-5" />
            <span v-if="!isMini" class="truncate">New chat</span>
          </button>
        </div>
      </div>
      <div class="px-3 mt-4">
        <!-- Section header -->
        <button
          :class="['flex items-center px-2 py-1.5 w-full', isMini ? 'justify-center' : 'gap-2 text-left']"
          @click="handleChatHistory"
        >
          <Icon name="i-heroicons-clock" class="w-4 h-4 text-gray-500" />
          <span v-if="!isMini" class="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent</span>
        </button>

        <!-- List chat threads -->
        <div v-if="chatThreads.length && !collapsed" class="mt-1 space-y-0.5">
          <button
            v-for="thread in chatThreads"
            :key="thread.id"
            :class="[
              'flex items-center justify-between w-full px-2 py-2 rounded-lg text-left transition-colors',
              thread.id === props.activeThreadId ? 'bg-stone-200' : 'hover:bg-gray-200/50'
            ]"
            @click="openThread(thread.id, thread.subject)"
          >
            <div class="flex flex-col items-start min-w-0 flex-1">
              <span class="text-sm text-gray-900 truncate w-full">{{ thread.title || 'Untitled' }}</span>
              <!-- Connection status for active thread -->
              <div v-if="thread.id === props.activeThreadId" class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="connectionDotClass" />
                <span class="text-xs" :class="connectionTextClass">{{ connectionText }}</span>
              </div>
              <!-- Background status for inactive threads (processing, error, ready) -->
              <div v-else-if="getThreadBackgroundStatus(thread.id)" class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="getThreadBackgroundStatus(thread.id)?.dotClass" />
                <span class="text-xs" :class="getThreadBackgroundStatus(thread.id)?.textClass">{{ getThreadBackgroundStatus(thread.id)?.text }}</span>
              </div>
              <!-- Subject for inactive threads without special status -->
              <span v-else-if="thread.subject" class="text-xs text-gray-500">{{ constantCaseToTitleCase(thread.subject) }}</span>
            </div>
          </button>
        </div>

        <div v-else-if="!isLoadingThreads && !collapsed" class="px-2 py-3 text-gray-400 text-xs text-center">
          No previous chats
        </div>
      </div>
    </div>

    <!-- Mobile Menu Items (fixed at bottom, outside scrollable area) -->
    <div v-if="props.isMobile" class="px-3 py-3 border-t border-gray-200 space-y-1">
      <button
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200/50"
        data-tour="mobile-profile"
        @click="routeTo('/dashboard?tab=overview')"
      >
        <Icon name="i-heroicons-user" class="w-4 h-4" />
        Profile
      </button>
      <button
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200/50"
        data-tour="mobile-study"
        @click="routeTo('/dashboard?tab=study')"
      >
        <Icon name="i-heroicons-book-open" class="w-4 h-4" />
        Study
      </button>
      <button
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200/50"
        @click="routeTo('/dashboard?tab=settings')"
      >
        <Icon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
        Settings
      </button>
      <button
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200/50"
        @click="routeTo('/about?tab=user-guides')"
      >
        <Icon name="i-heroicons-document-text" class="w-4 h-4" />
        User Guide
      </button>
      <button
        v-if="subscriptionPlans"
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200/50"
        @click="routeTo('/dashboard?tab=subscription')"
      >
        <Icon name="i-heroicons-sparkles" class="w-4 h-4" />
        Upgrade Plan
      </button>
      <button
        class="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        @click="handleLogout"
      >
        <Icon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
        Logout
      </button>
    </div>

    <!-- Avatar & Audio Player Container (hidden on mobile) -->
    <div v-if="!isMini && !props.isMobile" class="p-3">
      <!-- Show placeholder when floating and sidebar is expanded -->
      <div
        v-if="isAvatarFloating"
        class="relative bg-gray-700 rounded-xl shadow-inner p-4 min-h-[120px] w-full flex flex-col items-center justify-center"
      >
        <p class="text-gray-400 text-xs text-center mb-4">Avatar is floating</p>
      </div>

      <!-- Normal container when not floating -->
      <div
        v-else
        :class="[
          'relative bg-gray-700 rounded-xl shadow-inner p-2 w-full transition-all duration-300',
          isAudioPlayerCollapsed ? 'min-h-[60px]' : 'min-h-[200px]',
          isMini ? '' : 'rounded-xl shadow-inner',
        ]"
      >
        <!-- Collapsed Header -->
        <div v-if="isAudioPlayerCollapsed" class="flex items-center justify-between p-2">
          <span class="text-gray-300 text-xs font-medium">Audio Player</span>
          <div class="flex gap-1">
            <button
              class="p-1.5 hover:bg-gray-600 rounded transition-colors"
              @click="isAudioPlayerCollapsed = false"
            >
              <Icon name="i-heroicons-chevron-up" class="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <!-- Avatar -->
        <div
          v-else
          :class="['relative overflow-hidden rounded-lg', isMini ? 'h-[120px]' : 'h-[180px]']"
        >
          <Avatar :is-playing="isAvatarPlaying" :is-mini="isMini" />

          <!-- Control Buttons -->
          <div class="absolute top-2 right-2 flex gap-1">
            <!-- Minimize Button -->
            <button
              v-if="!isMini"
              class="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-lg transition-all duration-200"
              @click="isAudioPlayerCollapsed = true"
            >
              <Icon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile Section - Bottom (hidden on mobile since menu items are inline) -->
    <div v-if="!props.isMobile" class="px-3 py-2 border-t border-gray-200 overflow-visible">
      <div class="flex justify-center overflow-visible" data-tour="auth-widget">
        <AuthenticationWidget
          variant="sidebar"
          :collapsed="isMini"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import Avatar from '~/components/avatar/Avatar.vue';
import AuthenticationWidget from '~/components/AuthenticationWidget.vue';
import { useAudioStore } from '~/stores/audio';
import { useCharacters } from '~/composables/useCharacters';
import { useThreads } from '~/composables/useThreads';
import { useMessageQueueStore } from '~/stores/messageQueue';
import { constantCaseToTitleCase } from '~/utils/stringUtils';
import { useAuth } from '~/composables/useAuth';
import { useFeatureFlags } from '~/composables/useFeatureFlags';

const emit = defineEmits([
  'toggle-sidebar',
  'new-chat',
]);
const props = defineProps({
  collapsed: Boolean,
  sidebarWidth: Number,
  isMobile: Boolean,
  isAvatarFloating: Boolean,
  hideChangeCharacter: {
    type: Boolean,
    default: false,
  },
  activeThreadId: {
    type: String,
    default: '',
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  isConnecting: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  isWaitingForResponse: {
    type: Boolean,
    default: false,
  },
  responsePhase: {
    type: String,
    default: '',
  },
});

// Connection status computed properties
const connectionDotClass = computed(() => {
  if (props.isWaitingForResponse) return 'bg-blue-500 animate-pulse';
  if (props.isConnected) return 'bg-green-500';
  if (props.isConnecting) return 'bg-yellow-500 animate-pulse';
  if (props.hasError) return 'bg-red-500';

  // Check thread state from store for accurate dot color
  const threadState = props.activeThreadId ? messageQueueStore.getThreadState(props.activeThreadId) : null;
  if (threadState?.status === 'cancelled') return 'bg-gray-400';
  if (threadState?.status === 'error') return 'bg-red-500';
  if (threadState?.status === 'completed' || threadState?.status === 'idle') return 'bg-green-500';

  return 'bg-gray-400';
});

const connectionText = computed(() => {
  if (props.isWaitingForResponse) return props.responsePhase || 'Thinking...';
  if (props.isConnected) return 'Connected';
  if (props.isConnecting) return 'Connecting...';
  if (props.hasError) return 'Error';

  // Check thread state from store for more accurate status when not connected
  const threadState = props.activeThreadId ? messageQueueStore.getThreadState(props.activeThreadId) : null;
  if (threadState?.status === 'cancelled') return 'Cancelled';
  if (threadState?.status === 'error') return 'Error';
  if (threadState?.status === 'completed' || threadState?.status === 'idle') return 'Ready';

  return 'Offline';
});

const connectionTextClass = computed(() => {
  if (props.isWaitingForResponse) return 'text-blue-600';
  if (props.isConnected) return 'text-green-600';
  if (props.isConnecting) return 'text-yellow-600';
  if (props.hasError) return 'text-red-600';

  // Check thread state from store for accurate styling
  const threadState = props.activeThreadId ? messageQueueStore.getThreadState(props.activeThreadId) : null;
  if (threadState?.status === 'cancelled') return 'text-gray-500';
  if (threadState?.status === 'error') return 'text-red-600';
  if (threadState?.status === 'completed' || threadState?.status === 'idle') return 'text-green-600';

  return 'text-gray-500';
});

// State for audio player collapsed state
const isAudioPlayerCollapsed = ref(false);

const router = useRouter();
const toast = useToast();
const supabaseUser = useSupabaseUser();
const { threads: chatThreads, isLoadingThreads, fetchThreads } = useThreads();
const messageQueueStore = useMessageQueueStore();
const { signOut } = useAuth();
const { subscriptionPlans } = useFeatureFlags();

// Get background thread status (for non-active threads)
const getThreadBackgroundStatus = (threadId: string) => {
  if (threadId === props.activeThreadId) return null; // Active thread uses props
  const state = messageQueueStore.getThreadState(threadId);
  if (!state) return null;

  // Only show indicators for actionable states
  if (state.status === 'processing') {
    return { status: 'processing', text: state.responsePhase || 'Processing...', dotClass: 'bg-blue-500 animate-pulse', textClass: 'text-blue-600' };
  }
  if (state.status === 'error') {
    return { status: 'error', text: 'Error', dotClass: 'bg-red-500', textClass: 'text-red-600' };
  }
  if (state.status === 'completed' && state.hasPartialSlides) {
    return { status: 'completed', text: 'Ready', dotClass: 'bg-green-500', textClass: 'text-green-600' };
  }
  return null;
};

const { isAvatarPlaying, getCharacterBySubject } = useCharacters();
const routeTo = (path) => router.push(path);

const isMini = computed(
  () => props.collapsed || props.isMobile || (props.sidebarWidth ?? 999) < 150
);

const openThread = async (threadId: string, subject: string) => {
  const character = await getCharacterBySubject(subject);
  router.replace(`/chat/${character?.slug || 'eddy'}/${threadId}`);
};

const handleNewChat = () => {
  emit('new-chat');
};

const handleChatHistory = () => {
  if (props.collapsed) {
    // Expand the sidebar
    emit('toggle-sidebar');
  }
};

const handleLogout = async () => {
  try {
    await signOut();
    toast.add({
      title: 'Logged out successfully',
      description: 'See you next time!',
      color: 'green',
    });
  } catch (error) {
    console.error('Logout failed:', error);
    toast.add({
      title: 'Logout failed',
      description: 'Please try again',
      color: 'red',
    });
  }
};

// 🎵 WaveSurfer Audio Player
const waveformRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const currentAudio = ref<HTMLAudioElement | null>(null);
let wavesurfer: WaveSurfer | null = null;

onMounted(() => {
  // Initialize audio store after mounting
  // Fetch threads on mount
  if (supabaseUser.value) {
    fetchThreads();
  }
  const audioStore = useAudioStore();

  // Use nextTick to ensure DOM is ready
  nextTick(() => {
    if (!waveformRef.value || props.isAvatarFloating) return;

    wavesurfer = WaveSurfer.create({
      container: waveformRef.value,
      waveColor: '#d1d5db', // Tailwind gray-300
      progressColor: '#14b8a6', // Tailwind teal-500
      height: 48,
      barWidth: 2,
      barGap: 1,
      responsive: true,
      cursorWidth: 0,
      normalize: true,
    });

    // Initially load if audio URL exists
    if (audioStore.audioUrl) {
      wavesurfer.load(audioStore.audioUrl);
    }

    // Watch for changes in the audio URL from the store
    watch(
      () => audioStore.audioUrl,
      (newUrl) => {
        if (newUrl && wavesurfer) {
          wavesurfer.load(newUrl);
          isPlaying.value = false; // reset play state
        }
      }
    );

    wavesurfer.on('finish', () => {
      isPlaying.value = false;
    });
  });
});

// Re-initialize waveform when returning from floating
watch(
  () => props.isAvatarFloating,
  (isFloating) => {
    if (!isFloating && waveformRef.value && !wavesurfer) {
      nextTick(() => {
        const audioStore = useAudioStore();

        wavesurfer = WaveSurfer.create({
          container: waveformRef.value,
          waveColor: '#d1d5db',
          progressColor: '#14b8a6',
          height: 48,
          barWidth: 2,
          barGap: 1,
          responsive: true,
          cursorWidth: 0,
          normalize: true,
        });

        if (audioStore.audioUrl) {
          wavesurfer.load(audioStore.audioUrl);
        }

        wavesurfer.on('finish', () => {
          isPlaying.value = false;
        });
      });
    }
  }
);

onBeforeUnmount(() => {
  wavesurfer?.destroy();
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }
});
</script>
