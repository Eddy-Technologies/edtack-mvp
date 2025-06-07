<template>
  <div class="character-grid-container">
    <!-- Header for top picks -->
    <div class="text-center mb-6">
      <h3 class="text-lg font-semibold text-gray-600 mb-2">Top picks</h3>
    </div>

    <!-- Single row of characters using full width -->
    <div class="flex justify-center items-center w-full overflow-hidden px-4">
      <div
        v-for="(character, index) in displayCharacters"
        :key="character.filename"
        class="character-item group cursor-pointer relative bg-white shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out flex-shrink-0 rounded-xl mx-1"
        :class="{
          'w-32 h-40': focusedIndex !== index,
          'w-96 h-40 z-10': focusedIndex === index
        }"
        @click="selectCharacter(character)"
        @mouseenter="focusCharacter(index)"
        @mouseleave="unfocusCharacter"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        />

        <!-- Normal state (collapsed) -->
        <div
          v-if="focusedIndex !== index"
          class="relative h-full flex flex-col justify-center items-center p-2"
        >
          <div class="flex-1 flex items-center justify-center">
            <img
              :src="character.image"
              :alt="character.name"
              class="w-16 h-16 object-contain transition-all duration-300"
            >
          </div>
          <div class="text-center pb-2">
            <h3 class="text-xs font-bold text-gray-800 truncate">
              {{ character.name }}
            </h3>
          </div>
        </div>

        <!-- Expanded state (on hover) -->
        <div
          v-if="focusedIndex === index"
          class="relative h-full flex items-center p-4 bg-white rounded-xl"
        >
          <!-- Large character image on left -->
          <div class="flex-shrink-0 mr-4">
            <img
              :src="character.image"
              :alt="character.name"
              class="w-24 h-24 object-contain"
            >
          </div>

          <!-- Character info on right -->
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300 mb-2">
              {{ character.name }}
            </h3>
            <p class="text-sm text-gray-600 group-hover:text-primary-600 transition-colors duration-300 mb-3">
              {{ character.description }}
            </p>
            <div class="text-xs text-gray-500">
              Click to start learning with {{ character.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation arrows for manual control -->
    <div class="flex justify-center items-center mt-8 space-x-4">
      <button
        v-if="currentSetIndex > 0"
        class="bg-white hover:bg-gray-50 text-gray-600 hover:text-primary-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
        @click="previousSet"
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

      <div class="flex space-x-2">
        <button
          v-for="(characterSet, index) in characterSets"
          :key="index"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="index === currentSetIndex ? 'bg-primary-500' : 'bg-gray-300 hover:bg-gray-400'"
          @click="goToSet(index)"
        />
      </div>

      <button
        v-if="currentSetIndex < characterSets.length - 1"
        class="bg-white hover:bg-gray-50 text-gray-600 hover:text-primary-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
        @click="nextSet"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import placeholder1 from '../../assets/a.png';
import placeholder2 from '../../assets/b.png';
import placeholder3 from '../../assets/c.png';
import placeholder4 from '../../assets/d.png';
import placeholder5 from '../../assets/e.png';
import placeholder6 from '../../assets/f.png';
import placeholder7 from '../../assets/g.png';
import placeholder8 from '../../assets/h.png';
import placeholder9 from '../../assets/boy.png';
import placeholder10 from '../../assets/girl.png';
import placeholder11 from '../../assets/child.png';
import placeholder12 from '../../assets/parent.png';

interface Character {
  name: string;
  image: string;
  description: string;
  filename: string;
}

const router = useRouter();
const currentSetIndex = ref(0);
const focusedIndex = ref<number | null>(null);

// Character data using imported assets
const allCharacters: Character[] = [
  { name: 'Professor Oak', image: placeholder1, description: 'Master of everything in the universe', filename: 'a' },
  { name: 'Elsa', image: placeholder2, description: 'Expert in physics', filename: 'b' },
  { name: 'Elsa', image: placeholder3, description: 'Expert in princess', filename: 'c' },
  { name: 'Artist D', image: placeholder4, description: 'Creative Mind', filename: 'd' },
  { name: 'Engineer E', image: placeholder5, description: 'Problem Solver', filename: 'e' },
  { name: 'Philosopher F', image: placeholder6, description: 'Deep Thinker', filename: 'f' },
  { name: 'Guardian G', image: placeholder7, description: 'Protector', filename: 'g' },
  { name: 'Hero H', image: placeholder8, description: 'Champion', filename: 'h' },
  { name: 'Young Boy', image: placeholder9, description: 'Curious Learner', filename: 'boy' },
  { name: 'Bright Girl', image: placeholder10, description: 'Star Student', filename: 'girl' },
  { name: 'Happy Child', image: placeholder11, description: 'Playful Spirit', filename: 'child' },
  { name: 'Wise Parent', image: placeholder12, description: 'Mentor', filename: 'parent' },
];

// Split characters into sets of 6 for single row
const characterSets = computed(() => {
  const sets = [];
  for (let i = 0; i < allCharacters.length; i += 6) {
    sets.push(allCharacters.slice(i, i + 6));
  }
  return sets;
});

// Show up to 6 characters in a single row
const displayCharacters = computed(() => {
  const currentSet = characterSets.value[currentSetIndex.value] || [];
  return currentSet.filter((char) => char.filename); // Only show characters with valid data
});

const focusCharacter = (index: number) => {
  focusedIndex.value = index;
};

const unfocusCharacter = () => {
  focusedIndex.value = null;
};

const selectCharacter = (character: Character) => {
  if (character.filename) {
    router.push(`/video?character=${character.filename}`);
  }
};

const goToSet = (index: number) => {
  currentSetIndex.value = index;
};

const nextSet = () => {
  if (currentSetIndex.value < characterSets.value.length - 1) {
    currentSetIndex.value++;
  }
};

const previousSet = () => {
  if (currentSetIndex.value > 0) {
    currentSetIndex.value--;
  }
};
</script>
