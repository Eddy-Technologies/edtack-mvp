<template>
  <div class="space-y-10">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-10 shadow-sm ring-1 ring-slate-100">
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary-100/40 to-transparent rounded-full blur-3xl" />
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary-100/40 to-transparent rounded-full blur-3xl" />

      <div class="relative z-10 text-center">
        <div class="flex justify-center mb-6">
          <AppLogo size="xl" />
        </div>
        <h2 class="text-3xl font-heading font-bold text-slate-900 mb-4">StudyWithEddy</h2>
        <p class="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
          Designed to accelerate learning for Singapore students using interactive lessons, quizzes and rewards.
        </p>
      </div>
    </div>

    <!-- Key Features Section -->
    <div>
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-xl flex items-center justify-center">
          <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-secondary-600" />
        </div>
        <h3 class="text-2xl font-heading font-bold text-slate-900">Key Features</h3>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Map content -->
        <div v-for="(item, index) in copy.keyFeatures" :key="index" class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-secondary-100 transition-all duration-300">
          <div class="absolute top-6 right-6 w-8 h-8 bg-secondary-50 rounded-full flex items-center justify-center text-secondary-600 font-bold text-sm">1</div>
          <div class="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-lucide-book-check" class="w-6 h-6 text-secondary-600" />
          </div>
          <h4 class="text-lg font-heading font-semibold text-slate-900 mb-2">{{ item.title }}</h4>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ item.content }}
            <ul v-if="item.description">
              <li v-for="(point, pIndex) in item.description" :key="pIndex" class="list-disc list-inside mt-1">
                {{ point }}
              </li>
            </ul>
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Subjects Card -->
      <div class="rounded-2xl bg-gradient-to-br from-purple-50 to-white p-8 shadow-sm ring-1 ring-purple-100/50">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <UIcon name="i-lucide-book-open" class="w-7 h-7 text-purple-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900">Subjects Covered</h4>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="subject in subjects" :key="subject" class="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-slate-700 shadow-sm">
            <div class="w-2 h-2 rounded-full bg-purple-400" />
            {{ subject }}
          </div>
        </div>
      </div>

      <!-- AI Characters Card -->
      <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm ring-1 ring-blue-100/50">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <UIcon name="i-lucide-bot" class="w-7 h-7 text-blue-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900">AI Characters</h4>
        </div>
        <p class="text-slate-600 leading-relaxed mb-4">
          Choose from multiple AI tutors with unique personalities for each subject. Our characters make learning fun and engaging!
        </p>
        <div class="flex gap-2">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <UIcon name="i-lucide-smile" class="w-5 h-5 text-blue-600" />
          </div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <UIcon name="i-lucide-smile" class="w-5 h-5 text-green-600" />
          </div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <UIcon name="i-lucide-smile" class="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copy } from './copy';
import AppLogo from '~/components/common/AppLogo.vue';

const subjects = [
  'Biology',
  'Chemistry',
  'Physics',
];
</script>
