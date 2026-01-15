<script setup lang="ts">
import { ref, computed } from 'vue';

interface Chapter {
  id: string;
  name: string;
  displayName: string;
  status: string;
  score?: number;
  bestScore?: number;
  totalScore?: number;
  completedAt?: string | null;
  generationStartedAt?: string | null;
  credit: number;
  hasQuiz?: boolean;
}

interface Task {
  id: string;
  name: string;
  status: string;
  credit: number;
  creditPerChapter: number;
  totalCredits: number;
  requiredScore: number;
  questionsPerQuiz: number;
  assigneeUserInfoId: string;
  chapters: Chapter[];
  assigneeInfo?: {
    firstName: string;
    lastName: string;
  };
}

interface Props {
  task: Task;
  isParent: boolean;
  showAssigneeInfo?: boolean;
  isChapterGenerating?: (chapterId: string) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAssigneeInfo: true,
  isChapterGenerating: () => () => false
});

const emit = defineEmits<{
  (e: 'close-task' | 'edit-task'): void;
  (e: 'view-attempts', chapterId: string, assigneeId: string): void;
  (e: 'start-quiz', task: Task, chapter: Chapter): void;
}>();

const showAllChapters = ref(false);

const toggleChapters = () => {
  showAllChapters.value = !showAllChapters.value;
};

const displayedChapters = computed(() => {
  if (showAllChapters.value || props.task.chapters.length <= 3) {
    return props.task.chapters;
  }
  return props.task.chapters.slice(0, 3);
});

const hasMoreChapters = computed(() => props.task.chapters.length > 3);

// Utility functions
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    OPEN: 'Open',
    COMPLETED: 'Completed',
    EXPIRED: 'Expired',
    CLOSED: 'Closed',
    GENERATING: 'Generating'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    OPEN: 'primary',
    COMPLETED: 'green',
    EXPIRED: 'red',
    CLOSED: 'gray',
    GENERATING: 'blue'
  };
  return colorMap[status] || 'gray';
};

const getStatusVariant = (status: string) => {
  return status === 'OPEN' ? 'outline' : 'solid';
};
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <!-- Header Section -->
    <div class="space-y-2 mb-4">
      <!-- Row 1: Task Name + Status + Actions -->
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Task Name + Status Badge -->
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ task.name }}</h3>
          <UBadge :color="getStatusColor(task.status)" :variant="getStatusVariant(task.status)">
            {{ getStatusText(task.status) }}
          </UBadge>
        </div>

        <!-- Right: Action Buttons (Parent Only) -->
        <template v-if="isParent">
          <UButton
            variant="ghost"
            size="sm"
            icon="i-lucide-edit"
            @click.stop="emit('edit-task')"
          >
            Edit
          </UButton>
        </template>
      </div>

      <!-- Row 2: Assignee + Credits + Chapters -->
      <div class="flex items-center gap-3">
        <!-- Assignee Info (Parent View) -->
        <span v-if="showAssigneeInfo && isParent && task.assigneeInfo" class="text-sm text-gray-600">
          Assigned to: {{ task.assigneeInfo.firstName }} {{ task.assigneeInfo.lastName }}
        </span>

        <!-- Credits and Chapters -->
        <span class="text-sm text-gray-600">
          {{ task.totalCredits }} credits
        </span>
        <span class="text-sm text-gray-600">
          {{ task.chapters.length }} {{ task.chapters.length === 1 ? 'chapter' : 'chapters' }}
        </span>
      </div>
    </div>

    <!-- Chapter List -->
    <div class="space-y-3">
      <div
        v-for="chapter in displayedChapters"
        :key="chapter.id"
        class="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span class="font-medium text-gray-900">{{ chapter.displayName }}</span>
          <span class="text-sm text-gray-600">
            {{ chapter.credit }} credits • {{ task.requiredScore }}% required
          </span>

          <!-- Progress Info -->
          <span v-if="chapter.completedAt" class="text-sm text-green-600">
            ✓ Completed • Best: {{ chapter.bestScore }}%
          </span>
          <span v-else-if="chapter.status === 'GENERATING'" class="text-sm text-blue-600">
            Generating quiz...
          </span>
        </div>

        <!-- Inline Actions -->
        <div class="flex items-center gap-2">
          <!-- Student Actions -->
          <template v-if="!isParent">
            <!-- Start Quiz -->
            <UButton
              v-if="!chapter.hasQuiz && task.status !== 'CLOSED'"
              color="primary"
              size="sm"
              :loading="props.isChapterGenerating(chapter.id)"
              :disabled="props.isChapterGenerating(chapter.id)"
              @click.stop="emit('start-quiz', task, chapter)"
            >
              {{ props.isChapterGenerating(chapter.id) ? 'Generating quiz...' : 'Start Quiz' }}
            </UButton>

            <!-- Review -->
            <UButton
              v-else-if="chapter.completedAt"
              variant="outline"
              size="sm"
              @click.stop="emit('view-attempts', chapter.id, task.assigneeUserInfoId)"
            >
              Review
            </UButton>

            <!-- Reattempt -->
            <UButton
              v-if="chapter.hasQuiz && task.status !== 'CLOSED'"
              color="primary"
              size="sm"
              :loading="chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id)"
              :disabled="chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id)"
              @click.stop="emit('start-quiz', task, chapter)"
            >
              {{
                chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id)
                  ? 'Generating quiz...'
                  : (chapter.completedAt ? 'Reattempt' : 'Attempt Quizz')
              }}
            </UButton>
          </template>

          <!-- Parent Actions -->
          <template v-else>
            <!-- View Attempts -->
            <UButton
              v-if="chapter.completedAt"
              variant="outline"
              size="sm"
              icon="i-lucide-eye"
              @click.stop="emit('view-attempts', chapter.id, task.assigneeUserInfoId)"
            >
              View Attempts
            </UButton>
            <span v-else class="text-sm text-gray-500">
              Not attempted
            </span>
          </template>
        </div>
      </div>

      <!-- Show More/Less Button -->
      <div v-if="hasMoreChapters" class="flex justify-center pt-2">
        <button
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click.stop="toggleChapters"
        >
          <span>{{ showAllChapters ? 'Show less' : `Show ${task.chapters.length - 3} more` }}</span>
          <UIcon
            :name="showAllChapters ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>
  </div>
</template>
