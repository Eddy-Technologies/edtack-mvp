<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import TaskInstructions from './tasks/TaskInstructions.vue';
import TaskFilters from './tasks/TaskFilters.vue';
import TaskInfoCard from './tasks/TaskInfoCard.vue';
import CreateEditTaskModal from './tasks/CreateEditTaskModal.vue';
import QuizAttemptModal from './quiz/QuizAttemptModal.vue';
import { useMeStore } from '~/stores/me';

// Types
interface Chapter {
  id: string;
  name: string;
  displayName: string;
  subjectName: string;
  subjectDisplayName: string;
  sortOrder: number;
  status: string;
  score?: number;
  bestScore?: number;
  totalScore?: number;
  completedAt?: string | null;
  credit: number;
  creditEarned?: number;
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
  subjectName: string;
  chapters: Chapter[];
  assigneeInfo?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

// Composables
const meStore = useMeStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const tasks = ref<Task[]>([]);
const children = ref<Child[]>([]);
const subjects = ref<Array<{ code: string; displayName: string }>>([]);
const selectedChild = ref<string>('all');
const selectedSubject = ref<string>('all');
const selectedStatus = ref<string>('all');
const chapterFilter = ref('all');
const sortBy = ref('newest');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showTaskModal = ref(false);
const editingTask = ref<Task | null>(null);
const generatingChapters = ref<Set<string>>(new Set());

// Computed
const isParent = computed(() => meStore.isParent);
const _isStudent = computed(() => meStore.isStudent);

// Quiz modal state
const showQuizModal = computed(() => route.query.modal === 'quiz-attempt');
const selectedChapterId = computed(() => route.query.chapterId as string);
const modalMode = computed(() => (route.query.mode as 'attempt' | 'review' | 'parent-review') || 'attempt');
const modalAssigneeId = computed(() => route.query.assigneeId as string);

// Get chapter display name from tasks data
const selectedChapterName = computed(() => {
  if (!selectedChapterId.value) return '';

  for (const task of tasks.value) {
    const chapter = task.chapters.find((c) => c.id === selectedChapterId.value);
    if (chapter) return chapter.displayName;
  }

  return '';
});

// Filtered tasks
const filteredTasks = computed(() => {
  let result = [...tasks.value];

  // Child filter (parent-only)
  if (isParent.value && selectedChild.value !== 'all') {
    result = result.filter((t) => t.assigneeUserInfoId === selectedChild.value);
  }

  // Subject filter
  if (selectedSubject.value !== 'all') {
    result = result.filter((t) =>
      t.chapters.some((c) => c.subjectName === selectedSubject.value)
    );
  }

  // Status filter
  if (selectedStatus.value !== 'all') {
    result = result.filter((t) => t.status === selectedStatus.value);
  }

  // Chapter filter (credits/completed)
  if (chapterFilter.value === 'credits') {
    // Show only tasks with uncompleted chapters that have credits
    result = result.filter((t) =>
      t.status === 'OPEN' &&
      t.chapters.some((c) => c.completedAt === null && c.credit > 0)
    );
  } else if (chapterFilter.value === 'completed') {
    // Show only tasks with completed chapters
    result = result.filter((t) =>
      t.chapters.some((c) => c.completedAt !== null)
    );
  }

  // Sort
  result = sortTasks(result, sortBy.value);

  return result;
});

// Paginated tasks
const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTasks.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredTasks.value.length / itemsPerPage.value)
);

const totalPendingCredits = computed(() => {
  if (!isParent.value) return 0;
  return filteredTasks.value.reduce((sum, task) => {
    if (task.status === 'OPEN') {
      return sum + task.totalCredits;
    }
    return sum;
  }, 0);
});

// Methods
const fetchTasks = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/tasks/user-tasks', {
      query: {
        limit: 100 // Get all tasks, we'll paginate client-side
      }
    });

    tasks.value = response.tasks || [];
    console.log('[fetchTasks] Fetched', tasks.value.length, 'tasks');

    // Extract unique subjects with display names
    const subjectMap = new Map<string, string>();
    tasks.value.forEach((task) => {
      task.chapters.forEach((chapter) => {
        if (chapter.subjectName && chapter.subjectDisplayName) {
          subjectMap.set(chapter.subjectName, chapter.subjectDisplayName);
        }
      });
    });
    subjects.value = Array.from(subjectMap.entries())
      .map(([code, displayName]) => ({ code, displayName }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error: any) {
    console.error('Failed to load tasks:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load tasks',
      color: 'red'
    });
  } finally {
    loading.value = false;
  }
};

const handleQuizSubmitted = async () => {
  await fetchTasks();
  // Notify other components that tasks have been updated
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
  }
};

const fetchChildren = async () => {
  if (!isParent.value) return;

  try {
    const response = await $fetch('/api/children/list');
    children.value = response.children || [];
  } catch (error) {
    console.error('Failed to load children:', error);
  }
};

const handleCreateTask = () => {
  editingTask.value = null;
  showTaskModal.value = true;
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  showTaskModal.value = true;
};

const closeTaskModal = () => {
  showTaskModal.value = false;
  editingTask.value = null;
};

const closeQuizModal = () => {
  const { modal, chapterId, mode, assigneeId, ...remainingQuery } = route.query;
  router.push({ query: remainingQuery });
};

const handleReattempt = async (chapterId: string) => {
  // Get current query params
  const { modal, mode, assigneeId, ...otherQuery } = route.query;

  // Step 1: Close modal by removing 'modal' query param
  await router.push({ query: otherQuery });

  // Step 2: Wait for next tick to ensure modal closes
  await nextTick();

  // Step 3: Reopen modal in attempt mode
  await router.push({
    query: {
      ...otherQuery,
      modal: 'quiz-attempt',
      chapterId: chapterId,
      mode: 'attempt'
    }
  });
};

const handleCloseTask = async (task: Task) => {
  // Confirm before closing
  const confirmed = confirm(`Are you sure you want to close the task "${task.name}"?`);
  if (!confirmed) return;

  try {
    await $fetch(`/api/tasks/user-tasks/${task.id}/close`, {
      method: 'POST'
    });

    toast.add({
      title: 'Task Closed',
      description: 'The task has been closed successfully',
      color: 'green'
    });

    await fetchTasks();
    // Notify other components that tasks have been updated
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tasksUpdated'));
    }
  } catch (error: any) {
    console.error('Failed to close task:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to close task',
      color: 'red'
    });
  }
};

const handleViewAttempts = (userTasksChapterId: string, assigneeId: string) => {
  // Open QuizAttemptModal
  router.push({
    query: {
      ...route.query,
      modal: 'quiz-attempt',
      chapterId: userTasksChapterId,
      mode: isParent.value ? 'parent-review' : 'review',
      assigneeId: isParent.value ? assigneeId : undefined
    }
  });
};

const handleStartQuiz = async (task: Task, chapter: Chapter) => {
  // Check if quiz exists or needs generation
  if (!chapter.hasQuiz && chapter.status !== 'GENERATING') {
    // Show loading immediately
    generatingChapters.value.add(chapter.id);

    try {
      // Need to generate quiz
      await generateQuiz(task, chapter);
    } catch (error) {
      console.error('[handleStartQuiz] Quiz generation failed:', error);
      generatingChapters.value.delete(chapter.id);
    }
  } else if (chapter.status === 'GENERATING') {
    // Quiz is currently generating - inform user to wait
    toast.add({
      title: 'Quiz Generating',
      description: 'Your quiz is being generated. Please wait and refresh the page.',
      color: 'blue'
    });
  } else {
    // Quiz exists and is ready - open modal
    router.push({
      query: {
        ...route.query,
        modal: 'quiz-attempt',
        chapterId: chapter.id
      }
    });
  }
};

const generateQuiz = async (task: Task, chapter: Chapter) => {
  try {
    // Generate the prompt using useStudy composable
    const { generateStudyPrompt } = useStudy();
    const { prompt } = generateStudyPrompt(
      chapter.displayName,
      chapter.subjectName,
      'quiz',
      task.questionsPerQuiz
    );

    // Send complete request with all required fields
    // This is SYNCHRONOUS - waits for entire generation to complete
    await $fetch('/api/quiz/generate', {
      method: 'POST',
      body: {
        prompt,
        chapterName: chapter.name,
        chapterDisplayName: chapter.displayName,
        subjectName: chapter.subjectName,
        userLevel: meStore.userInfo?.levelType,
        syllabusType: meStore.userInfo?.syllabusType,
        numQuestions: task.questionsPerQuiz,
        userTasksChapterId: chapter.id
      }
    });

    console.log('[generateQuiz] Quiz generated successfully, refreshing tasks');

    // Refresh tasks to get updated quiz data
    await fetchTasks();

    // Wait for Vue to update DOM with new data
    await nextTick();

    console.log('[generateQuiz] Tasks refreshed, quiz ready');

    // Quiz is ready - show success and open modal
    toast.add({
      title: 'Quiz Ready!',
      description: 'Your quiz has been generated and is ready to attempt.',
      color: 'green'
    });

    // Open quiz modal directly (no polling needed)
    router.push({
      query: {
        ...route.query,
        modal: 'quiz-attempt',
        chapterId: chapter.id
      }
    });
  } catch (error: any) {
    console.error('[generateQuiz] Failed to generate quiz:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to generate quiz',
      color: 'red'
    });
  } finally {
    // Remove loading state AFTER everything completes (including fetchTasks)
    // This prevents button from becoming enabled before UI updates
    generatingChapters.value.delete(chapter.id);
  }
};

const sortTasks = (taskList: Task[], sortOption: string) => {
  const sorted = [...taskList];
  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    default:
      return sorted;
  }
};

const handleClearFilters = () => {
  selectedChild.value = 'all';
  selectedSubject.value = 'all';
  selectedStatus.value = 'all';
  chapterFilter.value = 'all';
  sortBy.value = 'newest';
};

const handleTaskSaved = async () => {
  closeTaskModal();
  await fetchTasks();
  // Notify other components that tasks have been updated
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tasksUpdated'));
  }
};

// Lifecycle
onMounted(async () => {
  await fetchTasks();
  if (isParent.value) {
    await fetchChildren();
  }
});

// Watch filters to reset page
watch([selectedChild, selectedSubject, selectedStatus, chapterFilter, sortBy], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Instructions -->
    <TaskInstructions :is-parent="isParent" />

    <!-- Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Left side: Title for students -->
      <div v-if="!isParent" class="text-lg font-semibold text-gray-900">
        My Tasks
      </div>

      <!-- Spacer: pushes content to edges -->
      <div class="flex-1" />

      <!-- Right side: Button for parents -->
      <UButton
        v-if="isParent"
        color="primary"
        size="lg"
        icon="i-lucide-plus"
        @click="handleCreateTask"
      >
        Create Task
      </UButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
      <TaskFilters
        v-model:child="selectedChild"
        v-model:subject="selectedSubject"
        v-model:status="selectedStatus"
        v-model:chapter-filter="chapterFilter"
        v-model:sort="sortBy"
        :show-child-filter="isParent"
        :children="children"
        :subjects="subjects"
        @clear="handleClearFilters"
      />
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-4 text-sm text-gray-600">
      <span>Total: {{ filteredTasks.length }} {{ filteredTasks.length === 1 ? 'task' : 'tasks' }}</span>
      <span v-if="isParent && totalPendingCredits > 0">
        Pending Credits: {{ totalPendingCredits }}
      </span>
    </div>

    <!-- Task List -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-48" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-clipboard-list" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p class="text-gray-600">
          {{ isParent ? 'Create a task to get started' : 'No tasks have been assigned to you yet' }}
        </p>
        <UButton
          v-if="isParent"
          color="primary"
          class="mt-4"
          @click="handleCreateTask"
        >
          Create Your First Task
        </UButton>
      </div>

      <!-- Task Cards -->
      <div v-else class="space-y-4">
        <TaskInfoCard
          v-for="task in paginatedTasks"
          :key="task.id"
          :task="task"
          :is-parent="isParent"
          :show-assignee-info="isParent"
          :chapter-filter="chapterFilter"
          :is-chapter-generating="(chapterId) => generatingChapters.has(chapterId)"
          @close-task="handleCloseTask(task)"
          @edit-task="handleEditTask(task)"
          @view-attempts="handleViewAttempts"
          @start-quiz="handleStartQuiz"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2">
      <UButton
        variant="outline"
        size="sm"
        icon="i-lucide-chevron-left"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Previous
      </UButton>

      <span class="px-4 py-2 text-sm text-gray-700">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <UButton
        variant="outline"
        size="sm"
        icon="i-lucide-chevron-right"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </UButton>
    </div>

    <!-- Unified Modal for Create/Edit -->
    <CreateEditTaskModal
      :is-open="showTaskModal"
      :task="editingTask"
      @close="closeTaskModal"
      @task-saved="handleTaskSaved"
    />

    <!-- Quiz Attempt Modal -->
    <QuizAttemptModal
      :is-open="showQuizModal"
      :user-tasks-chapter-id="selectedChapterId"
      :chapter-display-name="selectedChapterName"
      :mode="modalMode"
      :assignee-user-info-id="modalAssigneeId"
      @close="closeQuizModal"
      @quiz-submitted="handleQuizSubmitted"
      @reattempt="handleReattempt"
    />
  </div>
</template>
