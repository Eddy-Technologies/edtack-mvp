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
          chapter.status === ChapterStatus.OPEN || chapter.status === ChapterStatus.GENERATING
            ? 'bg-gray-50'
            : chapter.status === ChapterStatus.COMPLETED
              ? 'border border-primary'
              : chapter.status === ChapterStatus.ATTEMPTED
                ? 'border border-secondary'
                : 'bg-gray-50'
        ]"
      >
        <!-- Left: Chapter name only -->
        <div class="flex items-center flex-shrink min-w-0">
          <span class="font-medium text-gray-900 truncate">Chapter {{ chapter.sortOrder + 1 }} - {{ chapter.displayName }}</span>
        </div>

        <!-- Center/Right: Credit/Completion info (right-aligned) -->
        <div class="flex items-center gap-3 flex-1 justify-end">
          <!-- Not started -->
          <span v-if="chapter.status === ChapterStatus.OPEN || chapter.status === ChapterStatus.GENERATING" class="text-sm text-gray-600 whitespace-nowrap">
            {{ chapter.credit }} credits • {{ task.requiredScore }}% required
          </span>

          <!-- Completed (passed) -->
          <span v-else-if="chapter.status === ChapterStatus.COMPLETED" class="text-sm text-green-600 whitespace-nowrap">
            ✓ Completed • Best: {{ chapter.bestScore }}%
          </span>

          <!-- Attempted (not passed) -->
          <span v-else-if="chapter.status === ChapterStatus.ATTEMPTED" class="text-sm text-amber-600 whitespace-nowrap">
            Attempted • Best: {{ chapter.bestScore }}% • {{ task.requiredScore }}% required
          </span>
        </div>

        <!-- Far Right: Action buttons -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Student Actions -->
          <template v-if="!isParent">
            <!-- Start Quiz -->
            <UButton
              v-if="!chapter.hasQuiz && task.status !== TaskStatus.CLOSED"
              color="primary"
              size="sm"
              :loading="chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id)"
              :disabled="chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id)"
              @click.stop="emit('start-quiz', task, chapter)"
            >
              {{ chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id) ? 'Generating quiz...' : 'Start Quiz' }}
            </UButton>

            <!-- Review -->
            <UButton
              v-else-if="isAttempted(chapter)"
              variant="outline"
              size="sm"
              @click.stop="emit('view-attempts', chapter.id, task.assigneeUserInfoId)"
            >
              Review
            </UButton>

            <!-- Reattempt -->
            <UButton
              v-if="chapter.hasQuiz && task.status !== TaskStatus.CLOSED"
              color="primary"
              size="sm"
              :loading="chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id)"
              :disabled="chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id)"
              @click.stop="emit('start-quiz', task, chapter)"
            >
              {{
                chapter.status === ChapterStatus.GENERATING || props.isChapterGenerating(chapter.id)
                  ? 'Generating quiz...'
                  : (isAttempted(chapter) ? 'Reattempt' : 'Attempt Quiz')
              }}
            </UButton>
          </template>

          <!-- Parent Actions -->
          <template v-else>
            <!-- View Attempts -->
            <UButton
              v-if="isAttempted(chapter)"
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
import { TASK_CHAPTER_STATUS, TASK_STATUS } from '~~/shared/constants/codes';

// Expose enums for template usage
const ChapterStatus = TASK_CHAPTER_STATUS;
const TaskStatus = TASK_STATUS;

interface Chapter {
  id: string;
  name: string;
  displayName: string;
  status: string;
  bestScore?: number;
  credit: number;
  hasQuiz?: boolean;
  sortOrder?: number;
}

interface Task {
  id: string;
  name: string;
  status: string;
  totalCredits: number;
  requiredScore: number;
  questionsPerQuiz: number;
  assigneeUserInfoId: string;
  chapters: Chapter[];
  assigneeInfo?: {
    firstName: string;
    lastName: string;
  } | null;
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

  // When OPEN filter is active, show only OPEN chapters
  if (props.chapterFilter === TASK_CHAPTER_STATUS.OPEN) {
    return chapters.filter((c) => c.status === TASK_CHAPTER_STATUS.OPEN);
  }

  // When ATTEMPTED filter is active, show only ATTEMPTED chapters
  if (props.chapterFilter === TASK_CHAPTER_STATUS.ATTEMPTED) {
    return chapters.filter((c) => c.status === TASK_CHAPTER_STATUS.ATTEMPTED);
  }

  // When COMPLETED filter is active, show only COMPLETED chapters
  if (props.chapterFilter === TASK_CHAPTER_STATUS.COMPLETED) {
    return chapters.filter((c) => c.status === TASK_CHAPTER_STATUS.COMPLETED);
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

// Helper: chapter has been attempted (either ATTEMPTED or COMPLETED)
const isAttempted = (chapter: Chapter) => {
  return chapter.status === TASK_CHAPTER_STATUS.ATTEMPTED ||
    chapter.status === TASK_CHAPTER_STATUS.COMPLETED;
};

// Utility functions
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    [TASK_CHAPTER_STATUS.OPEN]: 'Open',
    [TASK_CHAPTER_STATUS.ATTEMPTED]: 'Attempted',
    [TASK_CHAPTER_STATUS.COMPLETED]: 'Completed',
    [TASK_CHAPTER_STATUS.EXPIRED]: 'Expired',
    [TASK_STATUS.CLOSED]: 'Closed',
    [TASK_CHAPTER_STATUS.GENERATING]: 'Generating'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    [TASK_CHAPTER_STATUS.OPEN]: 'primary',
    [TASK_CHAPTER_STATUS.ATTEMPTED]: 'amber',
    [TASK_CHAPTER_STATUS.COMPLETED]: 'green',
    [TASK_CHAPTER_STATUS.EXPIRED]: 'red',
    [TASK_STATUS.CLOSED]: 'gray',
    [TASK_CHAPTER_STATUS.GENERATING]: 'blue'
  };
  return colorMap[status] || 'gray';
};

const getStatusVariant = (status: string) => {
  return status === TASK_CHAPTER_STATUS.OPEN ? 'outline' : 'solid';
};
</script>
