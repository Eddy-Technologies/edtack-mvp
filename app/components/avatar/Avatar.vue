<template>
  <div>
    <img
      v-if="currentAvatar?.type === 'gif'"
      :src="currentAvatar.src"
      alt="Avatar"
      class="w-full h-full object-contain"
    />
    <video
      v-else-if="currentAvatar?.type === 'video'"
      :src="currentAvatar.src"
      class="w-full rounded"
      loop
      autoplay
      playsinline
      muted
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

// All available avatars
const avatars = [
  { id: '1', name: 'eddy', type: 'video', src: '/eddy-talk.mp4' },
  { id: '2', name: 'pooh', type: 'video', src: '/pooh-talk.mp4' },
  { id: '3', name: 'snorlax', type: 'gif', src: '/snorlax.gif' },
];

// Extract avatarId from route param
const avatarId = computed(() => route.params.avatarId?.toString() || '1');

// Find matching avatar in list
const currentAvatar = computed(() => avatars.find((a) => a.id === avatarId.value));
</script>
