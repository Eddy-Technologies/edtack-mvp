<template>
  <aside class="h-full flex flex-col border-r bg-white max-w-[900px]">
    <!-- Header -->
    <div class="p-4 flex items-center justify-between">
      <img
        v-if="!isMini"
        src="/logo.png"
        alt="eddy"
        class="w-[40px] h-[40px] hover:bg-gray-400 rounded-lg cursor-pointer"
        @click="routeTo('/')"
      >
      <button
        class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        @click="emit('toggle-sidebar')"
      >
        <Icon
          :name="isMini ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
          class="w-5 h-5 text-gray-700"
        />
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-3">
        <div class="border-t border-black">
          <ULink
            class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full"
            @click="handleNewChat"
          >
            <Icon name="i-heroicons-plus" class="w-6 h-6" />
            <span v-if="!isMini" class="truncate">New Chat</span>
          </ULink>
        </div>
      </div>
      <!--    TODO  <div v-if="meStore.isLoggedIn" class="px-3"> -->
      <div class="px-3">
        <div class="border-t border-black">
          <ULink
            class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full"
            @click="handleChatHistory"
          >
            <Icon name="i-heroicons-clock" class="w-6 h-6" />
            <span v-if="!isMini" class="truncate">Chat History</span>
          </ULink>

          <!-- List chat threads -->
          <div v-if="chatThreads.length && !collapsed">
            <ULink
              v-for="thread in chatThreads"
              :key="thread.id"
              class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full"
              @click="openThread(thread.id, thread.subject)"
            >
              <div class="flex flex-row items-center space-x-2 min-w-0">
                <UBadge
                  v-if="thread.task_threads"
                  :color="thread.task_threads.status === TASK_THREAD_STATUS.OPEN ? 'primary' : 'gray'"
                  size="xs"
                  class="flex-shrink-0"
                >
                  Task
                </UBadge>
                <div v-if="thread.subject" class="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {{ constantCaseToTitleCase(thread.subject) }}
                </div>
                <div class="truncate min-w-0">{{ thread.title || 'Untitled Chat' }}</div>
              </div>
            </ULink>
          </div>

          <div v-else-if="!isLoadingThreads && !collapsed" class="px-4 py-2 text-gray-400 text-sm text-center">
            No previous chats
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar & Audio Player Container -->
    <div v-if="!isMini" class="p-4">
      <!-- Show placeholder when floating and sidebar is expanded -->
      <div
        v-if="isAvatarFloating"
        class="relative bg-gray-700 rounded-xl shadow-inner p-4 min-h-[120px] w-full flex flex-col items-center justify-center"
      >
        <p class="text-gray-400 text-sm text-center mb-4">Avatar is floating</p>
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
          <span class="text-gray-300 text-sm font-medium">Audio Player</span>
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
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import Avatar from '~/components/avatar/Avatar.vue';
import { useAudioStore } from '~/stores/audio';
import { useCharacters } from '~/composables/useCharacters';
import { useMeStore } from '~/stores/me';
import { useThreads } from '~/composables/useThreads';
import { constantCaseToTitleCase } from '~/utils/stringUtils';
import { TASK_THREAD_STATUS } from '~~/shared/constants';

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
});

// State for audio player collapsed state
const isAudioPlayerCollapsed = ref(false);

const router = useRouter();
const meStore = useMeStore();
const { threads: chatThreads, isLoadingThreads, fetchThreads } = useThreads();

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

// 🎵 WaveSurfer Audio Player
const waveformRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const currentAudio = ref<HTMLAudioElement | null>(null);
let wavesurfer: WaveSurfer | null = null;


onMounted(() => {
  // Initialize audio store after mounting
  // Fetch threads on mount
  if (meStore.isLoggedIn) {
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
