<template>
  <img
    v-if="currentAvatar?.type === 'gif'"
    :src="currentAvatar.src"
    alt="Avatar"
    :class="['w-full max-h-[260px] object-contain transform transition-transform duration-300']"
  >
  <video
    v-else-if="currentAvatar?.type === 'video'"
    ref="videoRef"
    :src="currentAvatar.src"
    :class="['w-full max-h-[260px] object-contain transform transition-transform duration-300']"
    loop
    playsinline
  />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';

const route = useRoute();
const props = defineProps({
  isPlaying: Boolean,
  isMini: Boolean
});

const videoRef = ref<HTMLVideoElement | null>(null);

// All available avatars
const avatars = [
  { id: '1', name: 'eddy', type: 'video', src: '/eddy-talk.mp4' },
  { id: '2', name: 'pooh', type: 'video', src: '/pooh-talk.mp4' },
  { id: '3', name: 'snorlax', type: 'gif', src: '/snorlax.gif' },
  { id: '5', name: 'maya', type: 'video', src: '/maya-talk.mp4' },
  { id: '6', name: 'sherlock', type: 'video', src: '/sherlock-talk.mp4' },
];

// Extract avatarId from route param
const avatarId = computed(() => route.params.avatarId?.toString() || '1');

// Find matching avatar in list
const currentAvatar = computed(() => avatars.find((a) => a.id === avatarId.value));

// Sync playback with isPlaying
watch(
  () => props.isPlaying,
  (newVal) => {
    const video = videoRef.value;
    if (video) {
      if (newVal) {
        video.play().catch(() => {
        }); // prevent unhandled promise on autoplay
      } else {
        video.pause();
      }
    }
  }
);

// Optional: play on mount if isPlaying is true
onMounted(() => {
  if (props.isPlaying && videoRef.value) {
    videoRef.value.play().catch(() => {
    });
  }
});
</script>
