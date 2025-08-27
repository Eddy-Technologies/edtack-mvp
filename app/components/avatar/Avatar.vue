<template>
  <div class="w-full h-full flex items-center justify-center">
    <img
      v-if="!imageError && isImageUrl(getAvatarSource())"
      :src="getAvatarSource()"
      :alt="currentCharacter?.name || 'Avatar'"
      :class="['w-full h-full object-cover transform transition-transform duration-300']"
      @error="handleImageError"
    >
    <video
      v-else-if="!videoError && !imageError && isVideoUrl(getAvatarSource())"
      ref="videoRef"
      :src="getAvatarSource()"
      :class="['w-full h-full object-cover transform transition-transform duration-300']"
      loop
      playsinline
      @error="handleVideoError"
    />
    <!-- Fallback to character name when image/video fails to load -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-8"
    >
      <div class="text-center">
        <div class="text-4xl font-bold text-gray-600 mb-2">
          {{ currentCharacter?.name || 'Avatar' }}
        </div>
        <div class="text-sm text-gray-500">
          {{ currentCharacter?.subject || 'Character' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useCharacters } from '~/composables/useCharacters';

const props = defineProps({
  isPlaying: Boolean,
  isMini: Boolean
});

const videoRef = ref<HTMLVideoElement | null>(null);
const { selectedCharacter } = useCharacters();
const imageError = ref(false);
const videoError = ref(false);

// Get current character from store
const currentCharacter = computed(() => selectedCharacter.value);

// Error handling for images and videos
const handleImageError = () => {
  imageError.value = true;
  console.warn('Failed to load character image:', getAvatarSource());
};

const handleVideoError = () => {
  videoError.value = true;
  console.warn('Failed to load character video:', getAvatarSource());
};

// Helper function to determine if a URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
};

// Helper function to determine if a URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
};

// Get avatar source based on character and media type
const getAvatarSource = () => {
  if (!currentCharacter.value) {
    // Fallback to default Eddy video if no character selected
    return '/eddy-talk.mp4';
  }

  const character = currentCharacter.value;

  // First priority: use character's image_url if available
  if (character.image_url) {
    return character.image_url;
  }

  // Final fallback based on character slug
  const fallbackMap: Record<string, string> = {
    eddy: '/eddy-talk.mp4',
    pooh: '/pooh-talk.mp4',
    future: '/snorlax.gif',
    maya: '/maya-talk.mp4',
    sherlock: '/sherlock-talk.mp4',
    mickey: '/eddy-talk.mp4', // fallback
  };

  return fallbackMap[character.slug] || '/eddy-talk.mp4';
};

// Sync playback with isPlaying
watch(
  () => props.isPlaying,
  (newVal) => {
    const video = videoRef.value;
    if (video) {
      if (newVal) {
        video.play().catch(() => {
          // prevent unhandled promise on autoplay
        });
      } else {
        video.pause();
      }
    }
  }
);

// Watch for character changes and update video source
watch(
  () => currentCharacter.value,
  () => {
    // Reset error states when character changes
    imageError.value = false;
    videoError.value = false;

    // Re-trigger video element update when character changes
    if (videoRef.value) {
      videoRef.value.load(); // Reload the video with new source
    }
  }
);

// Optional: play on mount if isPlaying is true
onMounted(() => {
  if (props.isPlaying && videoRef.value) {
    videoRef.value.play().catch(() => {
      // prevent unhandled promise on autoplay
    });
  }
});
</script>
