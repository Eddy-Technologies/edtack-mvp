<template>
  <div>
    <GettingStartedGuide v-if="currentGuide === 'getting-started'" />
    <ParentGuide v-else-if="currentGuide === 'for-parents'" />
    <StudentGuide v-else-if="currentGuide === 'for-students'" />
    <CreditsGuide v-else-if="currentGuide === 'credits-rewards'" />
    <FamilyGuide v-else-if="currentGuide === 'family-features'" />
    <GettingStartedGuide v-else />
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

watch(() => props.activeGuide, (newGuide) => {
  if (newGuide) {
    currentGuide.value = newGuide;
  }
}, { immediate: true });
</script>
