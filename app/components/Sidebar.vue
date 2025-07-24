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
      <Button
        :icon="isMini ? 'i-heroicons-arrow-right-20-solid' : 'i-heroicons-arrow-left-20-solid'"
        color="black"
        size="lg"
        bold
        rounded
        hover
        :extra-classes="'p-2 rounded-full hover:bg-gray-500 px-3'"
        @click="emit('toggle-sidebar')"
      />
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
      <div class="px-3">
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

    <div class="mt-4">
      <div ref="waveformRef" class="w-full h-20" />
      <div class="flex justify-center mt-2">
        <button
          class="bg-primary text-white px-4 py-1 rounded shadow hover:bg-blue-700"
          @click="togglePlayback"
        >
          {{ isPlaying ? 'Pause' : 'Play' }} Audio
        </button>
      </div>
    </div>

    <!-- Avatar & Buttons -->
    <div class="p-4">
      <div class="relative bg-gray-700 rounded-xl shadow-inner p-2 min-h-[180px] w-full">
        <Avatar :is-playing="isPlaying" />
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4"
          :class="isMini ? 'flex-col items-center gap-3' : 'flex-row'"
        >
          <Button
            text=""
            icon="i-heroicons-phone-20-solid"
            color="green"
            size="l"
            bold
            rounded
            hover
            :extra-classes="`bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg ${isMini ? 'p-3' : 'p-6'}`"
            @click="handleCall"
          />
          <Button
            text=""
            icon="i-heroicons-microphone-20-solid"
            color="gray"
            size="l"
            bold
            rounded
            hover
            :extra-classes="`bg-gray-300 hover:bg-gray-400 rounded-full shadow-lg ${isMini ? 'p-3' : 'p-6'}`"
            @click="handleMute"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import Button from '~/components/common/Button.vue';
import Avatar from '~/components/avatar/Avatar.vue';
import { useToast } from '#imports';
import { useAudioStore } from '~/stores/audio';

const audioStore = useAudioStore();

const emit = defineEmits(['toggle-sidebar', 'change-character']);
const props = defineProps({
  collapsed: Boolean,
  sidebarWidth: Number,
  isMobile: Boolean,
});

const router = useRouter();
const toast = useToast();
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
  toast.add({
    title: 'New Chat',
    description: 'Created New Chat',
    icon: 'i-heroicons-plus',
  });
};

const handleShowChatHistory = () => {
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
let wavesurfer: WaveSurfer | null = null;

const togglePlayback = () => {
  if (!wavesurfer) return;
  if (isPlaying.value) {
    wavesurfer.pause();
  } else {
    wavesurfer.play();
  }
  isPlaying.value = !isPlaying.value;
};

onMounted(() => {
  if (!waveformRef.value) return;

  wavesurfer = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#d1d5db', // Tailwind gray-300
    progressColor: '#14b8a6', // Tailwind blue-500
    height: 50,
    barWidth: 2,
    responsive: true,
    cursorWidth: 0,
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

onBeforeUnmount(() => {
  wavesurfer?.destroy();
});
</script>
