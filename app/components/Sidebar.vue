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
      <div v-if="meStore.isLoggedIn" class="px-3">
        <div class="border-t border-black">
          <ULink
            class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full"
            @click="handleShowChatHistory"
          >
            <Icon name="i-heroicons-clock" class="w-6 h-6" />
            <span v-if="!isMini" class="truncate">Chat History</span>
          </ULink>
        </div>
      </div>
      <div class="px-3">
        <div class="border-t border-black">
          <ULink
            class="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full"
            @click="handleChangeCharacter"
          >
            <Icon name="i-heroicons-user-circle" class="w-6 h-6" />
            <span v-if="!isMini" class="truncate">Change Character</span>
          </ULink>
        </div>
      </div>
    </div>

    <!-- Simple cross icon for collapsed sidebar when audio player is floating -->
    <div v-if="isAvatarFloating && isMini" class="p-4 flex justify-center">
      <UTooltip text="Close audio player">
        <button
          class="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
          @click="toggleFloatingAvatar"
        >
          <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
      </UTooltip>
    </div>

    <!-- Avatar & Audio Player Container -->
    <div v-else class="p-4">
      <!-- Show placeholder when floating and sidebar is expanded -->
      <div v-if="isAvatarFloating" class="relative bg-gray-700 rounded-xl shadow-inner p-4 min-h-[120px] w-full flex flex-col items-center justify-center">
        <p class="text-gray-400 text-sm text-center mb-4">Avatar is floating</p>
        <button
          class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
          @click="toggleFloatingAvatar"
        >
          Close audio player
        </button>
      </div>

      <!-- Normal container when not floating -->
      <div
        v-else
        :class="[
          'relative bg-gray-700 rounded-xl shadow-inner p-2 w-full transition-all duration-300',
          isAudioPlayerCollapsed ? 'min-h-[60px]' : 'min-h-[260px]',
          'relative p-2 w-full transition-all duration-300',
          isAudioPlayerCollapsed ? 'min-h-[60px]' : 'min-h-300px]',
          isMini ? '' : 'rounded-xl shadow-inner'
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
          :class="[
            'relative overflow-hidden rounded-lg',
            isMini ? 'h-[120px]' : 'h-[180px]'
          ]"
        >
          <Avatar :is-playing="isPlaying" :is-mini="isMini" />

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
            <!-- Floating Avatar Toggle Button -->
            <button
              v-if="!isMini"
              class="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-lg transition-all duration-200"
              @click="toggleFloatingAvatar"
            >
              <Icon name="i-heroicons-arrows-pointing-out" class="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <!-- Unified Controls -->
        <div
          v-if="!isAudioPlayerCollapsed"
          :class="[
            'flex justify-center items-center px-2',
            isMini ? 'flex-col gap-2 mt-2' : 'flex-row gap-3 mt-4'
          ]"
        >
          <button
            class="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200"
            @click="handleCall"
          >
            <Icon name="i-heroicons-phone" class="w-5 h-5" />
          </button>
          <button
            class="w-12 h-12 flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all duration-200"
            @click="handlePlayAudio"
          >
            <Icon
              :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
              class="w-5 h-5"
            />
          </button>
          <button
            class="w-12 h-12 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full shadow-lg transition-all duration-200"
            @click="handleMute"
          >
            <Icon name="i-heroicons-microphone" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import Button from '~/components/common/Button.vue';
import Avatar from '~/components/avatar/Avatar.vue';
import { useToast } from '#imports';
import { useAudioStore } from '~/stores/audio';
import { useMeStore } from '~/stores/me';

const emit = defineEmits(['toggle-sidebar', 'change-character', 'toggle-floating-avatar', 'new-chat']);
const props = defineProps({
  collapsed: Boolean,
  sidebarWidth: Number,
  isMobile: Boolean,
  isAvatarFloating: Boolean,
});

// State for audio player collapsed state
const isAudioPlayerCollapsed = ref(false);

const router = useRouter();
const toast = useToast();
const meStore = useMeStore();
const routeTo = (path) => router.push(path);

const isMini = computed(
  () => props.collapsed || props.isMobile || (props.sidebarWidth ?? 999) < 150
);

// Button handlers
const handleCall = () => {
  toast.add({ title: 'Call', description: 'Calling...', icon: 'i-heroicons-phone-20-solid' });
};

const handleMute = () => {
  toast.add({
    title: 'Muted',
    description: 'Microphone muted.',
    icon: 'i-heroicons-microphone-slash-20-solid',
  });
};

const handleNewChat = () => {
  emit('new-chat');
  toast.add({
    title: 'New Chat',
    description: 'Starting new conversation',
    icon: 'i-heroicons-plus',
  });
};

const handleShowChatHistory = () => {
  // Expand sidebar if it's collapsed
  if (props.collapsed) {
    emit('toggle-sidebar');
  }

  toast.add({
    title: 'Chat History',
    description: 'Chat history shown.',
    icon: 'i-heroicons-clock',
  });
};

const handleChangeCharacter = () => {
  emit('change-character');
};

// 🎵 WaveSurfer Audio Player
const waveformRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const currentAudio = ref<HTMLAudioElement | null>(null);
let wavesurfer: WaveSurfer | null = null;

const togglePlayback = () => {
  if (!wavesurfer) return;

  if (isPlaying.value) {
    wavesurfer.pause();
    isPlaying.value = false;
  } else {
    wavesurfer.play();
    isPlaying.value = true;
  }
};

const handlePlayAudio = async () => {
  if (wavesurfer) {
    // Use WaveSurfer if available
    togglePlayback();
    return;
  }

  // Fallback to HTML Audio API
  const audioStore = useAudioStore();

  try {
    if (isPlaying.value && currentAudio.value) {
      // Pause current audio
      currentAudio.value.pause();
      isPlaying.value = false;
      return;
    }

    // Create new audio if none exists
    if (!currentAudio.value && audioStore.audioUrl) {
      currentAudio.value = new Audio(audioStore.audioUrl);
      currentAudio.value.volume = 1.0;

      currentAudio.value.addEventListener('ended', () => {
        isPlaying.value = false;
      });
    }

    // Play audio
    if (currentAudio.value) {
      await currentAudio.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};

const toggleFloatingAvatar = () => {
  // Emit event to parent to handle floating avatar
  emit('toggle-floating-avatar');
};

onMounted(() => {
  // Initialize audio store after mounting
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
