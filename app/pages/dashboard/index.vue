<template>
  <div class="relative min-h-screen bg-background px-4 py-10 overflow-hidden">
    <!-- Background Image -->
    <img
      :src="aboutDesktop"
      class="absolute bottom-0 right-0 w-[180px] sm:w-[200px] h-auto z-0 opacity-80 pointer-events-none"
      alt="Eddy character"
    >

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col justify-center items-center">
      <h1 class="text-3xl font-bold text-center text-primary mb-6 font-serif">Welcome to Eddy!</h1>
      Email: {{ user?.user_metadata?.email }}
      Name: {{ user?.user_metadata?.name }}
      {{ user?.user_metadata?.avatar_url }}
      {{ user?.user_metadata?.phone }}
      <h2 class="text-2xl font-bold text-center text-primary mb-6 font-serif">Choose Your Level</h2>

      <!-- Main Level Selection -->
      <div class="flex flex-wrap justify-center gap-4 mb-6">
        <button
          v-for="level in levels"
          :key="level"
          :class="[
            'px-6 py-4 rounded-full border transition text-sm',
            selectedMainLevel === level
              ? 'bg-primary text-white border-primary'
              : 'bg-white font-bold border-gray-300 text-gray-700 hover:bg-gray-100'
          ]"
          @click="selectLevel(level)"
        >
          {{ level }}
        </button>
      </div>

      <!-- Sub-Level Selection -->
      <div v-if="subLevels.length" class="flex flex-wrap justify-center gap-3 mb-6">
        <button
          v-for="lvl in subLevels"
          :key="lvl"
          :class="[
            'px-6 py-4 rounded-full border transition text-sm',
            selectedSubLevel === lvl
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white font-bold border-gray-300 text-gray-700 hover:bg-gray-100'
          ]"
          @click="selectSubLevel(lvl)"
        >
          Level {{ lvl }}
        </button>
      </div>

      <!-- Continue Button -->
      <UButton
        v-if="selectedMainLevel && selectedSubLevel"
        class="w-[150px] py-2 px-4 flex items-center justify-center rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
        @click="handleContinue"
      >
        Continue
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSupabaseUser } from '#imports';
import aboutDesktop from '~/../assets/child.png';
import { useRouter } from '#vue-router';

definePageMeta({
  middleware: 'auth'
});

const { user } = useSupabaseUser();

const router = useRouter();
const levels = ['Primary', 'Secondary'];
const primaryLvls = [1, 2, 3, 4, 5, 6];
const secondaryLvls = [1, 2, 3, 4];

const selectedMainLevel = ref<string | null>(null);
const selectedSubLevel = ref<number | null>(null);

const selectLevel = (level: string) => {
  selectedMainLevel.value = level;
  selectedSubLevel.value = null; // Reset sublevel on main level change
};

const selectSubLevel = (lvl: number) => {
  selectedSubLevel.value = lvl;
};

const subLevels = computed(() => {
  if (selectedMainLevel.value === 'Primary') return primaryLvls;
  if (selectedMainLevel.value === 'Secondary') return secondaryLvls;
  return [];
});

const handleContinue = () => {
  localStorage.setItem('selectedMainLevel', selectedMainLevel.value);
  localStorage.setItem('selectedSubLevel', selectedSubLevel.value.toString());
  router.push('child');
};
</script>
