<template>
  <div class="flex flex-col justify-center h-full bg-secondary-100 p-8 lg:p-12">
    <!-- Main Hero Content -->
    <div class="max-w-xl mx-auto">
      <!-- Hero Headline -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 text-center">
          StudyWithEddy
        </h1>
        <p class="text-lg text-gray-600 text-center">
          AI-Powered Learning Platform for Singapore Students
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="space-y-4 mb-8">
        <div v-for="(item, index) in copy.keyFeatures" :key="index" class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">
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

      <!-- Learn More Link -->
      <div class="text-center">
        <NuxtLink
          to="/about"
          class="inline-flex items-center gap-2 text-primary hover:text-primary-600 font-medium transition-colors"
        >
          <span>Learn More</span>
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copy } from '../about/copy';
</script>
