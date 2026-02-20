<template>
  <div class="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 flex-shrink-0">
    <!-- Chapter filter -->
    <select
      v-model="filterChapter"
      class="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white max-w-[200px]"
      @change="onFilterChange"
    >
      <option value="">All Chapters</option>
      <option v-for="ch in chapters" :key="ch" :value="ch">
        {{ ch }}
      </option>
    </select>

    <!-- Status filter -->
    <select
      v-model="filterStatus"
      class="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
      @change="onFilterChange"
    >
      <option value="">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="FLAGGED">Flagged</option>
    </select>

    <!-- Diagram filter -->
    <label class="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
      <input
        v-model="filterHasDiagram"
        type="checkbox"
        class="rounded border-slate-300"
        @change="onFilterChange"
      >
      Diagrams
    </label>

    <!-- Needs crop filter -->
    <label class="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
      <input
        v-model="filterNeedsCrop"
        type="checkbox"
        class="rounded border-slate-300"
        @change="onFilterChange"
      >
      Needs Crop
    </label>

    <!-- Search -->
    <input
      v-model="searchInput"
      type="text"
      placeholder="Search..."
      class="text-sm border border-slate-300 rounded-lg px-2 py-1.5 w-40"
      @keydown.enter="onSearch"
    >

    <div class="flex-1" />

    <!-- Navigation -->
    <div class="flex items-center gap-2">
      <button
        class="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
        :disabled="currentIndex <= 0"
        @click="goToPrev"
      >
        <UIcon name="i-lucide-chevron-left" class="w-5 h-5" />
      </button>
      <span class="text-sm font-medium text-slate-700 whitespace-nowrap">
        Q {{ currentIndex + 1 }} of {{ totalFiltered }}
      </span>
      <button
        class="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
        :disabled="currentIndex >= questions.length - 1"
        @click="goToNext"
      >
        <UIcon name="i-lucide-chevron-right" class="w-5 h-5" />
      </button>
    </div>

    <!-- Progress -->
    <div class="flex items-center gap-2 ml-2">
      <div class="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-green-500 rounded-full transition-all"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
      <span class="text-xs text-slate-500 whitespace-nowrap">{{ progressPercent }}%</span>
    </div>

    <!-- Stats badges -->
    <div class="flex items-center gap-1.5 ml-1">
      <span class="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
        {{ stats.approved }}
      </span>
      <span class="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
        {{ stats.flagged }}
      </span>
      <span class="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
        {{ stats.pending }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const {
  questions,
  currentIndex,
  stats,
  chapters,
  totalFiltered,
  filterChapter,
  filterStatus,
  filterHasDiagram,
  filterNeedsCrop,
  filterSearch,
  progressPercent,
  loadQuestions,
  goToNext,
  goToPrev,
} = useQAReview();

const searchInput = ref('');

function onFilterChange() {
  loadQuestions();
}

function onSearch() {
  filterSearch.value = searchInput.value;
  loadQuestions();
}
</script>
