<template>
  <div class="relative overflow-hidden py-12 min-h-[280px]">
    <!-- Gradient overlays for blur effect -->
    <div
      class="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"
    />
    <div
      class="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"
    />

    <!-- Carousel container -->
    <div
      class="group flex ease-in-out"
      :class="isTransitioning ? 'transition-transform duration-500' : ''"
      :style="{ transform: `translateX(calc(50% - ${(adjustedIndex + 0.5) * cardWidth}px))` }"
    >
      <div
        v-for="(avatar, index) in infiniteAvatars"
        :key="`${avatar.id}-${Math.floor(index / allAvatars.length)}`"
        class="flex-shrink-0 px-4 transition-all duration-500 ease-in-out"
        :class="[
          index === adjustedIndex ? 'scale-100' : 'scale-95',
          index === adjustedIndex
            ? 'opacity-100'
            : 'opacity-80 blur-[1px] hover:opacity-100 hover:blur-0',
        ]"
        :style="{ width: cardWidth + 'px' }"
      >
        <div class="cursor-pointer" @click="selectAvatar(avatar, index)">
          <div
            class="relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl h-[500px] flex flex-col"
          >
            <!-- Blurred background with gradient to primary -->
            <div
              class="absolute inset-0"
              :style="{
                backgroundImage: `url(${avatar.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(15px)',
                transform: 'scale(1.2)'
              }"
            />
            <div class="absolute inset-0 bg-gradient-to-br from-gray via-transparent to-gray-600" />

            <!-- Image container - top 70% -->
            <div class="relative z-10 flex-grow overflow-hidden" style="height: 90%">
              <img
                :src="avatar.image"
                :alt="avatar.name"
                class="w-full h-full object-cover"
                :style="{
                  objectPosition: 'top',
                  transform: 'scale(1.1) translateY(10%)'
                }"
              >
            </div>

            <!-- Text area - bottom 30% -->
            <div class="relative z-10 p-4 flex flex-col justify-center items-center text-center" style="height: 20%">
              <h5 class="text-white text-base font-semibold mb-1 drop-shadow-lg">{{ avatar.name }}</h5>
              <p class="text-white/90 text-sm drop-shadow-md">{{ avatar.type }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 transition-all duration-200 hover:scale-110"
      @click="previousCard"
    >
      <svg
        class="w-6 h-6 text-gray-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 transition-all duration-200 hover:scale-110"
      @click="nextCard"
    >
      <svg
        class="w-6 h-6 text-gray-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { characters } from '../types/characters.types.js';
import { useRouter } from '#vue-router';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  goToChatOnClick: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const router = useRouter();

const currentIndex = ref(2); // Start from center (index 2 out of 8 cards)
const cardWidth = ref(400);
const isTransitioning = ref(false);

const allAvatars = ref(characters);

// Create infinite scroll array by duplicating cards
const infiniteAvatars = computed(() => {
  const avatars = allAvatars.value;
  return [...avatars, ...avatars, ...avatars]; // Triple the array for seamless scroll
});

// Adjust current index to account for the duplicated arrays
const adjustedIndex = computed(() => {
  return currentIndex.value + allAvatars.value.length; // Start from middle array
});

const selectAvatar = (avatar, index) => {
  // Convert infinite array index back to original array index
  currentIndex.value = index % allAvatars.value.length;
  emit('update:modelValue', avatar);
  console.log('Selected avatar:', avatar);

  // Navigate to chat if prop is set
  if (props.goToChatOnClick && avatar.id) {
    router.push(`/chat/${avatar.id}`);
  }
};

const nextCard = () => {
  isTransitioning.value = true;
  currentIndex.value++;

  // Check if we've reached the end of the middle array
  if (currentIndex.value >= allAvatars.value.length) {
    // Allow the transition to complete, then reset to beginning
    setTimeout(() => {
      isTransitioning.value = false;
      currentIndex.value = 0;
    }, 500);
  }
};

const previousCard = () => {
  isTransitioning.value = true;
  currentIndex.value--;

  // Check if we've gone below the beginning of the middle array
  if (currentIndex.value < 0) {
    // Allow the transition to complete, then reset to end
    setTimeout(() => {
      isTransitioning.value = false;
      currentIndex.value = allAvatars.value.length - 1;
    }, 500);
  }
};

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'ArrowRight') {
    nextCard();
  } else if (event.key === 'ArrowLeft') {
    previousCard();
  }
};

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  // Initialize selected avatar to match current index
  if (props.modelValue === null) {
    emit('update:modelValue', allAvatars.value[currentIndex.value]);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>
