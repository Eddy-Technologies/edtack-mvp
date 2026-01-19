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
          {{ filteredChapters.length }} {{ filteredChapters.length === 1 ? 'chapter' : 'chapters' }}
        </span>
      </div>
    </div>

    <!-- Chapter List -->
    <div class="space-y-3">
      <div
        v-for="chapter in displayedChapters"
        :key="chapter.id"
        :class="[
          'flex items-center justify-between gap-4 py-2 px-4 rounded-lg',
          !chapter.completedAt
            ? 'bg-gray-50'
            : (chapter.bestScore ?? 0) >= task.requiredScore
              ? 'border border-primary'
              : 'border border-secondary'
        ]"
      >
        <!-- Left: Chapter name only -->
        <div class="flex items-center flex-shrink min-w-0">
          <span class="font-medium text-gray-900 truncate">Chapter {{ chapter.sortOrder + 1 }} - {{ chapter.displayName }}</span>
        </div>

        <!-- Center/Right: Credit/Completion info (right-aligned) -->
        <div class="flex items-center gap-3 flex-1 justify-end">
          <span v-if="!chapter.completedAt" class="text-sm text-gray-600 whitespace-nowrap">
            {{ chapter.credit }} credits • {{ task.requiredScore }}% required
          </span>

          <!-- Progress Info -->
          <!-- Passed: score >= required -->
          <span v-if="chapter.completedAt && (chapter.bestScore ?? 0) >= task.requiredScore" class="text-sm text-green-600 whitespace-nowrap">
            ✓ Completed • Best: {{ chapter.bestScore }}%
          </span>
          <!-- Attempted but not passed -->
          <span v-else-if="chapter.completedAt" class="text-sm text-amber-600 whitespace-nowrap">
            Attempted • Best Score: {{ chapter.bestScore }}% • {{ chapter.credit }} credits • {{ task.requiredScore }}% required
          </span>
        </div>

        <!-- Far Right: Action buttons -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Student Actions -->
          <template v-if="!isParent">
            <!-- Start Quiz -->
            <UButton
              v-if="!chapter.hasQuiz && task.status !== 'CLOSED'"
              color="primary"
              size="sm"
              :loading="chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id)"
              :disabled="chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id)"
              @click.stop="emit('start-quiz', task, chapter)"
            >
              {{ chapter.status === 'GENERATING' || props.isChapterGenerating(chapter.id) ? 'Generating quiz...' : 'Start Quiz' }}
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
                  : (chapter.completedAt ? 'Reattempt' : 'Attempt Quiz')
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
          <span>{{ showAllChapters ? 'Show less' : `Show ${filteredChapters.length - 3} more` }}</span>
          <UIcon
            :name="showAllChapters ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>
  </div>
</template>

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
  credit: number;
  creditEarned?: number;
  hasQuiz?: boolean;
  sortOrder?: number;
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
  chapterFilter?: string;
  isChapterGenerating?: (chapterId: string) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAssigneeInfo: true,
  chapterFilter: 'all',
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

// Filter chapters based on active chapter filter
const filteredChapters = computed(() => {
  const chapters = props.task.chapters;

  // When credits filter is active, show only uncompleted chapters
  if (props.chapterFilter === 'credits') {
    return chapters.filter((c) => c.completedAt === null);
  }

  // When completed filter is active, show only completed chapters
  if (props.chapterFilter === 'completed') {
    return chapters.filter((c) => c.completedAt !== null);
  }

  // Otherwise show all chapters
  return chapters;
});

const displayedChapters = computed(() => {
  const chapters = filteredChapters.value;
  if (showAllChapters.value || chapters.length <= 3) {
    return chapters;
  }
  return chapters.slice(0, 3);
});

const hasMoreChapters = computed(() => filteredChapters.value.length > 3);

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
