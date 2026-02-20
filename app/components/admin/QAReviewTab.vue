<template>
  <div class="flex flex-col h-[calc(100vh-4rem)] -m-8">
    <!-- Navigation Bar -->
    <QuestionNav />

    <!-- Main split pane -->
    <div class="flex flex-1 min-h-0">
      <!-- Left: PDF Viewer -->
      <div class="w-1/2 border-r border-slate-200 flex flex-col min-h-0">
        <PdfViewer />
      </div>

      <!-- Right: Question Editor -->
      <div class="w-1/2 flex flex-col min-h-0">
        <QuestionEditor />
      </div>
    </div>

    <!-- Bottom: Question chips -->
    <div class="border-t border-slate-200 bg-white px-4 py-2 flex items-center gap-1 overflow-x-auto flex-shrink-0">
      <button
        v-for="(q, idx) in questions"
        :key="q.id"
        :class="[
          'flex-shrink-0 w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-all',
          idx === currentIndex
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : '',
          q.review_status === 'APPROVED'
            ? difficultyChipColor(q.difficulty)
            : q.review_status === 'FLAGGED'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-slate-100 text-slate-500',
        ]"
        :title="`${q.title} - ${q.review_status}`"
        @click="selectQuestion(q.id, idx)"
      >
        <UIcon
          v-if="q.review_status === 'APPROVED'"
          name="i-lucide-check"
          class="w-3.5 h-3.5"
        />
        <UIcon
          v-else-if="q.review_status === 'FLAGGED'"
          name="i-lucide-alert-triangle"
          class="w-3.5 h-3.5"
        />
        <span v-else>{{ idx + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import QuestionNav from '~/components/admin/qa/QuestionNav.vue';
import PdfViewer from '~/components/admin/qa/PdfViewer.vue';
import QuestionEditor from '~/components/admin/qa/QuestionEditor.vue';

const {
  questions,
  currentIndex,
  loadQuestions,
  selectQuestion,
  saveCurrentQuestion,
  goToNext,
  goToPrev,
} = useQAReview();

const difficultyColors: Record<string, string> = {
  Basic: 'bg-green-50 text-green-600',
  Intermediate: 'bg-amber-50 text-amber-600',
  Challenging: 'bg-red-50 text-red-600',
};

function difficultyChipColor(difficulty: string) {
  return difficultyColors[difficulty] || 'bg-slate-100 text-slate-500';
}

onMounted(() => {
  loadQuestions();
});

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveCurrentQuestion();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
    e.preventDefault();
    goToNext();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
    e.preventDefault();
    goToPrev();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
