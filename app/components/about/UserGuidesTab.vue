<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-6">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">User Guides</h3>
      <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
        Comprehensive guides to help you get the most out of StudyWithEddy
      </p>
    </div>

    <!-- Guide Navigation -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:w-1/4">
        <div class="bg-gray-50 rounded-lg p-4 sticky top-4">
          <h4 class="font-semibold text-gray-800 mb-4">Quick Navigation</h4>
          <nav class="space-y-2">
            <button
              v-for="guide in guides"
              :key="guide.id"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors duration-200',
                activeGuide === guide.id
                  ? 'bg-secondary-100 text-secondary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              ]"
              @click="activeGuide = guide.id"
            >
              <div class="flex items-center space-x-2">
                <UIcon :name="guide.icon" class="w-4 h-4" />
                <span>{{ guide.title }}</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:w-3/4">
        <div class="min-h-96">
          <!-- Getting Started Guide -->
          <GettingStartedGuide v-if="activeGuide === 'getting-started'" />

          <!-- Parent Guide -->
          <ParentGuide v-else-if="activeGuide === 'parent'" />

          <!-- Student Guide -->
          <StudentGuide v-else-if="activeGuide === 'student'" />

          <!-- Credits Guide -->
          <CreditsGuide v-else-if="activeGuide === 'credits'" />

          <!-- Family Guide -->
          <FamilyGuide v-else-if="activeGuide === 'family'" />

          <!-- Default: Getting Started -->
          <GettingStartedGuide v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GettingStartedGuide from './guides/GettingStartedGuide.vue';
import ParentGuide from './guides/ParentGuide.vue';
import StudentGuide from './guides/StudentGuide.vue';
import CreditsGuide from './guides/CreditsGuide.vue';
import FamilyGuide from './guides/FamilyGuide.vue';

const activeGuide = ref('getting-started');

const guides = ref([
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'i-lucide-play-circle',
    description: 'New to StudyWithEddy? Start here!'
  },
  {
    id: 'parent',
    title: 'For Parents',
    icon: 'i-lucide-users',
    description: 'Parent dashboard and family management'
  },
  {
    id: 'student',
    title: 'For Students',
    icon: 'i-lucide-graduation-cap',
    description: 'Learning with AI tutors and earning rewards'
  },
  {
    id: 'credits',
    title: 'Credits & Rewards',
    icon: 'i-lucide-coins',
    description: 'Understanding the credit system'
  },
  {
    id: 'family',
    title: 'Family Features',
    icon: 'i-lucide-home',
    description: 'Managing family accounts and tasks'
  }
]);
</script>

<style scoped>
/* Additional styling if needed */
</style>
