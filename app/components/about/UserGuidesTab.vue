<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-6">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">User Guides</h3>
      <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
        Comprehensive guides to help you get the most out of StudyWithEddy
      </p>
    </div>

    <!-- Main Content -->
    <div class="w-full">
      <!-- Getting Started Guide -->
      <GettingStartedGuide v-if="currentGuide === 'getting-started'" />

      <!-- Parent Guide -->
      <ParentGuide v-else-if="currentGuide === 'for-parents'" />

      <!-- Student Guide -->
      <StudentGuide v-else-if="currentGuide === 'for-students'" />

      <!-- Credits Guide -->
      <CreditsGuide v-else-if="currentGuide === 'credits-rewards'" />

      <!-- Family Guide -->
      <FamilyGuide v-else-if="currentGuide === 'family-features'" />

      <!-- Default: Getting Started -->
      <GettingStartedGuide v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import GettingStartedGuide from './guides/GettingStartedGuide.vue';
import ParentGuide from './guides/ParentGuide.vue';
import StudentGuide from './guides/StudentGuide.vue';
import CreditsGuide from './guides/CreditsGuide.vue';
import FamilyGuide from './guides/FamilyGuide.vue';

const props = defineProps<{
  activeGuide?: string;
}>();

const currentGuide = ref(props.activeGuide || 'getting-started');

// Watch for prop changes
watch(() => props.activeGuide, (newGuide) => {
  if (newGuide) {
    currentGuide.value = newGuide;
  }
}, { immediate: true });

// No internal navigation needed - navigation is handled by the parent component
</script>

<style scoped>
/* Additional styling if needed */
</style>
