<template>
  <div class="character-carousel-container">
    <div class="relative overflow-hidden">
      <div
        class="flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentOffset}px)` }"
      >
        <div
          v-for="(character, index) in characters"
          :key="character.filename"
          class="flex-shrink-0 character-card group cursor-pointer mx-2"
          :style="{ width: cardWidth + 'px' }"
          @click="selectCharacter(character)"
          @mouseenter="focusCharacter(index)"
          @mouseleave="unfocusCharacter"
        >
          <div
            class="relative bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden aspect-video"
            :class="{ 'ring-4 ring-primary-400 ring-opacity-75': focusedIndex === index }"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div class="relative h-full flex items-center justify-center p-2">
              <div
                class="character-image transform transition-all duration-300 group-hover:scale-110"
                :class="{ 'scale-125': focusedIndex === index }"
              >
                <img
                  :src="character.image"
                  :alt="character.name"
                  class="w-12 h-12 object-contain group-hover:w-14 group-hover:h-14 transition-all duration-300"
                >
              </div>
            </div>
            <!-- Overlay with title on hover -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h4 class="text-xs font-semibold text-center truncate">
                {{ character.name }}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation arrows -->
    <button
      v-if="canScrollLeft"
      class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 hover:text-primary-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
      @click="scrollLeft"
    >
      <svg
        class="w-5 h-5"
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
      v-if="canScrollRight"
      class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 hover:text-primary-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
      @click="scrollRight"
    >
      <svg
        class="w-5 h-5"
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

    <!-- Dots indicator -->
    <div class="flex justify-center mt-4 space-x-2">
      <button
        v-for="(dot, index) in Math.ceil(characters.length / visibleCards)"
        :key="index"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="index === currentPage ? 'bg-primary-500' : 'bg-gray-300 hover:bg-gray-400'"
        @click="goToPage(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import placeholderD from '../../assets/d.png';
import placeholderE from '../../assets/e.png';
import placeholderF from '../../assets/f.png';
import placeholderG from '../../assets/g.png';
import placeholderH from '../../assets/h.png';
import placeholderBoy from '../../assets/boy.png';
import placeholderGirl from '../../assets/girl.png';
import placeholderChild from '../../assets/child.png';

interface Character {
  name: string;
  image: string;
  description: string;
  filename: string;
}

const router = useRouter();
const currentOffset = ref(0);
const focusedIndex = ref<number | null>(null);
const cardWidth = 120; // Width of each card including margin
const visibleCards = ref(6); // Number of cards visible at once
const intervalId = ref<NodeJS.Timeout | null>(null);

// Smaller set of characters for the secondary carousel using imported assets
const characters: Character[] = [
  { name: 'Action Hero', image: placeholderD, description: 'Adventure awaits', filename: 'd' },
  { name: 'Space Explorer', image: placeholderE, description: 'Cosmic journey', filename: 'e' },
  { name: 'Mystery Solver', image: placeholderF, description: 'Puzzle master', filename: 'f' },
  { name: 'Time Traveler', image: placeholderG, description: 'Through time', filename: 'g' },
  { name: 'Ocean Explorer', image: placeholderH, description: 'Deep sea adventure', filename: 'h' },
  { name: 'Young Genius', image: placeholderBoy, description: 'Brilliant mind', filename: 'boy' },
  { name: 'Star Student', image: placeholderGirl, description: 'Academic star', filename: 'girl' },
  { name: 'Happy Kid', image: placeholderChild, description: 'Joyful learner', filename: 'child' },
];

const currentPage = computed(() => Math.floor(currentOffset.value / (cardWidth * visibleCards.value)));

const maxOffset = computed(() => {
  const totalWidth = characters.length * cardWidth;
  const containerWidth = visibleCards.value * cardWidth;
  return Math.max(0, totalWidth - containerWidth);
});

const canScrollLeft = computed(() => currentOffset.value > 0);
const canScrollRight = computed(() => currentOffset.value < maxOffset.value);

const focusCharacter = (index: number) => {
  focusedIndex.value = index;
};

const unfocusCharacter = () => {
  focusedIndex.value = null;
};

const selectCharacter = (character: Character) => {
  router.push(`/video?character=${character.filename}`);
};

const scrollLeft = () => {
  const newOffset = Math.max(0, currentOffset.value - cardWidth * visibleCards.value);
  currentOffset.value = newOffset;
};

const scrollRight = () => {
  const newOffset = Math.min(maxOffset.value, currentOffset.value + cardWidth * visibleCards.value);
  currentOffset.value = newOffset;
};

const goToPage = (pageIndex: number) => {
  currentOffset.value = Math.min(pageIndex * cardWidth * visibleCards.value, maxOffset.value);
};

// Removed auto-scroll functionality
const stopAutoScroll = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Responsive design
const updateVisibleCards = () => {
  const width = window.innerWidth;
  if (width < 640) {
    visibleCards.value = 3; // Mobile
  } else if (width < 1024) {
    visibleCards.value = 5; // Tablet
  } else {
    visibleCards.value = 6; // Desktop
  }
};

onMounted(() => {
  updateVisibleCards();
  window.addEventListener('resize', updateVisibleCards);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleCards);
  stopAutoScroll();
});
</script>

<style scoped>
.character-carousel-container {
  @apply relative px-8;
}

.character-card {
  @apply transition-transform duration-300 ease-in-out;
}

.character-card:hover {
  @apply transform -translate-y-1;
}

.character-image {
  @apply relative z-0;
}

.character-card:hover .character-image {
  @apply z-10;
}
</style>
