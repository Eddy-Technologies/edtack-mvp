<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Study</h1>
        <p class="text-gray-600 mt-1">Access lessons, practice, and quizzes by subject</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Level Type Filter -->
        <div class="flex-1 min-w-[140px]">
          <label class="block text-xs font-medium text-gray-500 mb-1">Level</label>
          <USelect
            v-model="filters.levelType"
            :options="[{ label: 'All levels', value: '' }, ...levelTypeOptions]"
            placeholder="All levels"
            size="sm"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Syllabus Type Filter -->
        <div class="flex-1 min-w-[140px]">
          <label class="block text-xs font-medium text-gray-500 mb-1">Syllabus</label>
          <USelect
            v-model="filters.syllabusType"
            :options="[{ label: 'All syllabuses', value: '' }, ...syllabusTypeOptions]"
            placeholder="All syllabuses"
            size="sm"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Subject Filter -->
        <div class="flex-1 min-w-[140px]">
          <label class="block text-xs font-medium text-gray-500 mb-1">Subject</label>
          <USelect
            v-model="filters.subject"
            :options="[{ label: 'All subjects', value: '' }, ...subjectOptions]"
            placeholder="All subjects"
            size="sm"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Has Credits Filter -->
        <div class="flex items-center h-[34px]">
          <UCheckbox
            v-model="filters.hasCreditsOnly"
            label="Credits only"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Clear Button -->
        <button
          v-if="filters.levelType || filters.syllabusType || filters.subject || filters.hasCreditsOnly"
          class="text-sm text-gray-500 hover:text-gray-700 h-[34px]"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <DashboardSkeleton v-if="isLoading" variant="study" :count="6" />

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <div class="flex">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Error loading study content</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          <button
            class="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
            @click="fetchSubjects"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Subject Cards Grid -->
    <div v-else-if="subjects.length > 0" class="space-y-6">
      <!-- Grid of Subject Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="subject in subjects"
          :key="subject.name"
          class="text-left bg-white rounded-xl border p-5 transition-all"
          :class="selectedSubject === subject.name
            ? 'border-2 border-primary shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'"
          @click="selectSubject(subject.name)"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-gray-900">{{ subject.display_name }}</h3>
            <span
              v-if="getSubjectCredits(subject) > 0"
              class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 shrink-0"
            >
              {{ getSubjectCredits(subject) }} credits
            </span>
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span>{{ subject.chapters.length }} {{ subject.chapters.length === 1 ? 'chapter' : 'chapters' }}</span>
            <span v-if="getQuizCount(subject) > 0">{{ getQuizCount(subject) }} {{ getQuizCount(subject) === 1 ? 'quiz' : 'quizzes' }}</span>
          </div>
        </button>
      </div>

      <!-- Expanded Subject Section -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="selectedSubjectData" class="bg-white rounded-xl border border-gray-200">
          <!-- Section Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedSubjectData.display_name }}</h3>
            <button
              class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              @click="selectedSubject = null"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4" />
              Close
            </button>
          </div>

          <!-- Chapters List -->
          <div class="p-6 space-y-4">
            <div
              v-for="chapter in selectedSubjectData.chapters"
              :key="chapter.name"
              class="bg-stone-50 rounded-xl p-4"
            >
              <!-- Chapter Header Row: Title + Action Buttons -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900">{{ chapter.display_name }}</h4>
                  <p v-if="chapter.description" class="text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {{ chapter.description }}
                  </p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <UButton
                    size="sm"
                    color="blue"
                    variant="soft"
                    @click="handleStudyAction(chapter, selectedSubjectData.subject_name, selectedSubjectData.display_name, 'lesson')"
                  >
                    <UIcon name="i-lucide-book-open" class="w-4 h-4 mr-1" />
                    Lesson
                  </UButton>
                  <UButton
                    size="sm"
                    color="green"
                    variant="soft"
                    @click="handleStudyAction(chapter, selectedSubjectData.subject_name, selectedSubjectData.display_name, 'practice')"
                  >
                    <UIcon name="i-lucide-target" class="w-4 h-4 mr-1" />
                    Practice
                  </UButton>
                </div>
              </div>

              <!-- Quiz Tasks Section -->
              <div
                v-if="chapter.user_tasks_chapters?.length > 0"
                class="mt-3 pt-3 border-t border-gray-200 space-y-2"
              >
                <div
                  v-for="taskChapter in chapter.user_tasks_chapters"
                  :key="taskChapter.id"
                  class="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                  :class="taskChapter.user_tasks?.status === 'CLOSED' ? 'opacity-60' : ''"
                >
                  <!-- Quiz Info -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900 text-sm">
                        {{ taskChapter.user_tasks?.name || 'Quiz' }}
                      </span>
                      <!-- Status Pills -->
                      <span
                        v-if="taskChapter.user_tasks?.status === 'CLOSED'"
                        class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                      >
                        Closed
                      </span>
                      <span
                        v-else-if="quizMetadata[taskChapter.id]?.creditDisbursed"
                        class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700"
                      >
                        Earned
                      </span>
                      <span
                        v-else-if="quizMetadata[taskChapter.id]?.isCompleted && quizMetadata[taskChapter.id]?.creditReward > 0"
                        class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"
                      >
                        Pending
                      </span>
                    </div>
                    <div class="text-xs text-gray-500 flex items-center gap-2">
                      <!-- Only show credits for OPEN tasks -->
                      <span v-if="taskChapter.user_tasks?.status !== 'CLOSED' && taskChapter.user_tasks?.credit > 0">{{ taskChapter.user_tasks.credit }} credits</span>
                      <span v-if="taskChapter.user_tasks?.status !== 'CLOSED' && taskChapter.user_tasks?.required_score">· {{ taskChapter.user_tasks.required_score }}% required</span>
                      <template v-if="quizMetadata[taskChapter.id]?.isCompleted">
                        <span>· Best: {{ quizMetadata[taskChapter.id]?.bestPercentage || 0 }}%</span>
                        <span>· {{ quizMetadata[taskChapter.id]?.attemptCount || 0 }} attempts</span>
                      </template>
                    </div>
                  </div>

                  <!-- Quiz Action Buttons -->
                  <div class="flex gap-2">
                    <!-- Review button - always available if quiz completed -->
                    <UButton
                      v-if="quizMetadata[taskChapter.id]?.isCompleted"
                      size="sm"
                      color="gray"
                      variant="outline"
                      :loading="quizButtonLoading[taskChapter.id]"
                      @click="handleQuizReview(taskChapter, chapter, selectedSubjectData.subject_name)"
                    >
                      Review
                    </UButton>
                    <!-- Generate/Attempt/Reattempt - only for OPEN tasks -->
                    <UButton
                      v-if="taskChapter.user_tasks?.status !== 'CLOSED'"
                      size="sm"
                      :color="quizMetadata[taskChapter.id]?.isCompleted ? 'primary' : 'blue'"
                      :loading="quizButtonLoading[taskChapter.id]"
                      @click="handleQuizClick(taskChapter, chapter, selectedSubjectData.subject_name)"
                    >
                      {{
                        quizMetadata[taskChapter.id]?.isCompleted
                          ? 'Reattempt'
                          : (quizExists[taskChapter.id] ? 'Attempt' : 'Generate')
                      }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-book-open" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No study content available</h3>
      <p class="text-gray-600 mb-4">
        Try adjusting your filters or check back later for new content.
      </p>
      <UButton variant="soft" @click="clearFilters">
        Clear filters
      </UButton>
    </div>

    <!-- Quiz Attempt Modal -->
    <QuizAttemptModal
      :is-open="isQuizModalOpen"
      :user-tasks-chapter-id="selectedUserTasksChapterId"
      :chapter-display-name="selectedChapterDisplayName"
      :mode="quizModalMode"
      @close="isQuizModalOpen = false"
      @quiz-submitted="handleQuizSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMeStore } from '~/stores/me';
import { useStudy } from '~/composables/useStudy';
import { useCharacters } from '~/composables/useCharacters';
import { useTokenUsage } from '~/composables/useTokenUsage';
import QuizAttemptModal from '~/components/dashboard/quiz/QuizAttemptModal.vue';
import DashboardSkeleton from '~/components/common/DashboardSkeleton.vue';

const router = useRouter();
const { generateStudyPrompt } = useStudy();
const meStore = useMeStore();
const { getCharacterBySubject, fetchCharacters } = useCharacters();
const toast = useToast();

interface Subject {
  name: string;
  subject_name: string;
  display_name: string;
  description: string | null;
  level_type: string;
  level_type_description?: string;
  syllabus_type: string;
  syllabus_type_description?: string;
  chapters: any[];
}

// State
const subjects = ref<Subject[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const selectedSubject = ref<string | null>(null);
const quizButtonLoading = reactive<Record<string, boolean>>({});
const quizExists = reactive<Record<string, boolean>>({});
const quizCompleted = reactive<Record<string, boolean>>({});
const quizMetadata = reactive<Record<string, any>>({}); // Store quiz metadata by taskChapterId

// Computed: Get currently selected subject object
const selectedSubjectData = computed(() => {
  if (!selectedSubject.value) return null;
  return subjects.value.find((s) => s.name === selectedSubject.value) || null;
});

// Helper: Get quiz count for a subject (only OPEN tasks)
const getQuizCount = (subject: Subject) => {
  return subject.chapters.reduce((total, chapter) => {
    // Only count quizzes from OPEN tasks
    const openQuizzes = chapter.user_tasks_chapters?.filter(
      (tc: any) => tc.user_tasks?.status !== 'CLOSED'
    ) || [];
    return total + openQuizzes.length;
  }, 0);
};

// Helper: Get total credits available for a subject (only OPEN tasks)
const getSubjectCredits = (subject: Subject) => {
  return subject.chapters.reduce((total, chapter) => {
    const chapterCredits = chapter.user_tasks_chapters?.reduce((sum: number, tc: any) => {
      // Only count credits from OPEN tasks
      if (tc.user_tasks?.status === 'CLOSED') return sum;
      return sum + (tc.user_tasks?.credit || 0);
    }, 0) || 0;
    return total + chapterCredits;
  }, 0);
};

// Quiz modal state
const isQuizModalOpen = ref(false);
const selectedUserTasksChapterId = ref<string>('');
const selectedChapterDisplayName = ref<string>('');
const quizModalMode = ref<'attempt' | 'review'>('attempt'); // Track modal mode

// Filters
const filters = reactive({
  levelType: '',
  syllabusType: '',
  subject: '',
  hasCreditsOnly: false
});

// Filter options (will be populated from data)
const levelTypeOptions = ref<Array<{ label: string; value: string }>>([]);
const syllabusTypeOptions = ref<Array<{ label: string; value: string }>>([]);
const subjectOptions = ref<Array<{ label: string; value: string }>>([]);

// Methods
const fetchFilterOptions = async () => {
  try {
    // Fetch all filter options in parallel
    const [levelsResponse, syllabusResponse, subjectsResponse] = await Promise.all([
      $fetch('/api/options/levels'),
      $fetch('/api/options/syllabus'),
      $fetch('/api/options/subjects')
    ]);

    // Set filter options
    levelTypeOptions.value = levelsResponse.levels || [];
    syllabusTypeOptions.value = syllabusResponse.syllabus || [];
    subjectOptions.value = subjectsResponse.subjects || [];
  } catch (err: any) {
    console.error('Error fetching filter options:', err);
    // Don't set error state for filter options, just log it
  }
};

const fetchSubjects = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const queryParams = new URLSearchParams();
    if (filters.levelType) queryParams.append('level_type', filters.levelType);
    if (filters.syllabusType) queryParams.append('syllabus_type', filters.syllabusType);
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.hasCreditsOnly) queryParams.append('has_credits', 'true');

    const response = await $fetch(`/api/study/subjects?${queryParams.toString()}`);

    if (response.success) {
      subjects.value = response.subjects;
    } else {
      error.value = 'Failed to load study subjects';
    }
  } catch (err: any) {
    console.error('Error fetching subjects:', err);
    error.value = err.data?.message || 'Failed to load study subjects';
  } finally {
    isLoading.value = false;
  }
};

const handleStudyAction = async (chapter: any, subjectName: string, subjectDisplayName: string, actionType: 'lesson' | 'practice' | 'quiz') => {
  try {
    // Check token limits - show toast if exceeded but allow action (soft limit)
    const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();
    await fetchTokenUsage();

    if (isLimitExceeded.value) {
      toast.add({
        title: 'Token limit reached',
        description: 'You have exceeded your token limit for this billing period.',
        color: 'red',
        timeout: 5000
      });
    }

    // Proceed with action (soft limit - always allow)
    const studyResult = generateStudyPrompt(chapter.display_name, subjectDisplayName, actionType);
    const upperCaseSubject = subjectName.toUpperCase();

    const queryParams = new URLSearchParams({
      study_prompt: studyResult.prompt
    });

    const character = getCharacterBySubject(upperCaseSubject);
    const characterSlug = character?.slug || 'eddy';

    await router.push(`/chat/${characterSlug}/new?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error handling study action:', error);
  }
};

const checkQuizExistence = async (chapters: any[]) => {
  // Collect all userTasksChapterIds
  const allIds: string[] = [];
  for (const chapter of chapters) {
    if (chapter.user_tasks_chapters?.length > 0) {
      for (const taskChapter of chapter.user_tasks_chapters) {
        if (taskChapter.id) {
          allIds.push(taskChapter.id);
        }
      }
    }
  }

  if (allIds.length === 0) return;

  try {
    // Single batch call to check all quiz existence
    const batchResponse = await $fetch('/api/quiz/check-existing-batch', {
      method: 'POST',
      body: { userTasksChapterIds: allIds },
    });

    // Process batch results
    const existingIds: string[] = [];
    for (const id of allIds) {
      const result = batchResponse.results[id];
      quizExists[id] = result?.exists || false;
      if (result?.exists) {
        existingIds.push(id);
      } else {
        quizCompleted[id] = false;
        quizMetadata[id] = { isCompleted: false };
      }
    }

    // Fetch metadata for quizzes that exist (parallel calls)
    await Promise.all(
      existingIds.map(async (id) => {
        try {
          const resultsResponse = await $fetch(`/api/quiz/${id}/results`, {
            method: 'GET',
          });
          quizCompleted[id] = resultsResponse.isCompleted || false;
          quizMetadata[id] = {
            isCompleted: resultsResponse.isCompleted,
            bestScore: resultsResponse.bestScore,
            bestPercentage: resultsResponse.bestPercentage,
            latestScore: resultsResponse.latestScore,
            latestPercentage: resultsResponse.latestPercentage,
            creditDisbursed: resultsResponse.creditDisbursed,
            creditReward: resultsResponse.creditReward,
            attemptCount: resultsResponse.attemptCount,
          };
        } catch (err) {
          console.error(`Error fetching quiz results for ${id}:`, err);
          quizCompleted[id] = false;
          quizMetadata[id] = { isCompleted: false };
        }
      })
    );
  } catch (err) {
    console.error('Error checking quiz existence batch:', err);
    // Mark all as non-existent on error
    for (const id of allIds) {
      quizExists[id] = false;
      quizCompleted[id] = false;
      quizMetadata[id] = { isCompleted: false };
    }
  }
};

const handleQuizClick = async (taskChapter: any, chapter: any, subjectName: string) => {
  const userTasksChapterId = taskChapter.id;

  try {
    // Set loading state
    quizButtonLoading[userTasksChapterId] = true;

    // Use cached quiz existence from batch check
    if (quizExists[userTasksChapterId]) {
      // Quiz already exists - open modal in attempt mode
      selectedUserTasksChapterId.value = userTasksChapterId;
      selectedChapterDisplayName.value = chapter.display_name;
      quizModalMode.value = 'attempt';
      isQuizModalOpen.value = true;
    } else {
      // No quiz exists - generate one
      console.log('Generating quiz for task-chapter:', userTasksChapterId);

      // Generate prompt using useStudy composable
      const numQuestions = taskChapter.user_tasks?.questions_per_quiz || 10;
      const studyResult = generateStudyPrompt(chapter.display_name, subjectName, 'quiz', numQuestions);

      const generateResponse = await $fetch('/api/quiz/generate', {
        method: 'POST',
        body: {
          prompt: studyResult.prompt,
          chapterName: chapter.name,
          chapterDisplayName: chapter.display_name,
          subjectName: subjectName,
          userLevel: meStore.level_type || '',
          syllabusType: meStore.syllabus_type || '',
          numQuestions,
          userTasksChapterId: userTasksChapterId,
        },
      });

      if (generateResponse.success) {
        quizExists[userTasksChapterId] = true;
        toast.add({
          title: 'Quiz Generated!',
          description: `${generateResponse.questionCount} questions created. You can now attempt the quiz.`,
          color: 'green',
          timeout: 6000
        });

        // Open modal immediately after generation
        selectedUserTasksChapterId.value = userTasksChapterId;
        selectedChapterDisplayName.value = chapter.display_name;
        quizModalMode.value = 'attempt';
        isQuizModalOpen.value = true;
      } else {
        throw new Error('Failed to generate quiz');
      }
    }
  } catch (err: any) {
    console.error('Error handling quiz click:', err);

    // Show user-friendly error message
    const errorMessage = err.data?.message || err.message || 'An error occurred while loading the quiz';
    toast.add({
      title: 'Quiz Error',
      description: errorMessage,
      color: 'red',
      timeout: 5000
    });
  } finally {
    // Clear loading state
    quizButtonLoading[userTasksChapterId] = false;
  }
};

const handleQuizReview = async (taskChapter: any, chapter: any) => {
  const userTasksChapterId = taskChapter.id;

  try {
    // Set loading state
    quizButtonLoading[userTasksChapterId] = true;

    // Open modal in review mode
    selectedUserTasksChapterId.value = userTasksChapterId;
    selectedChapterDisplayName.value = chapter.display_name;
    quizModalMode.value = 'review';
    isQuizModalOpen.value = true;
  } catch (err: any) {
    console.error('Error opening quiz review:', err);
    toast.add({
      title: 'Error',
      description: 'Failed to open quiz review',
      color: 'red',
      timeout: 5000
    });
  } finally {
    // Clear loading state
    quizButtonLoading[userTasksChapterId] = false;
  }
};

const selectSubject = async (subjectName: string) => {
  if (selectedSubject.value === subjectName) {
    selectedSubject.value = null;
  } else {
    selectedSubject.value = subjectName;
    // Check quiz existence when selecting subject
    const subject = subjects.value.find((s) => s.name === subjectName);
    if (subject?.chapters) {
      await checkQuizExistence(subject.chapters);
    }
  }
};

const clearFilters = () => {
  filters.levelType = '';
  filters.syllabusType = '';
  filters.subject = '';
  filters.hasCreditsOnly = false;
  fetchSubjects();
};

const handleQuizSubmitted = async (score: number, totalScore: number) => {
  toast.add({
    title: 'Quiz Completed!',
    description: `You scored ${score} out of ${totalScore} points`,
    color: score === totalScore ? 'green' : 'blue',
    timeout: 6000
  });

  // Refresh quiz metadata for the submitted quiz
  if (selectedUserTasksChapterId.value) {
    try {
      const resultsResponse = await $fetch(`/api/quiz/${selectedUserTasksChapterId.value}/results`, {
        method: 'GET',
      });

      quizCompleted[selectedUserTasksChapterId.value] = resultsResponse.isCompleted || false;
      quizMetadata[selectedUserTasksChapterId.value] = {
        isCompleted: resultsResponse.isCompleted,
        bestScore: resultsResponse.bestScore,
        bestPercentage: resultsResponse.bestPercentage,
        latestScore: resultsResponse.latestScore,
        latestPercentage: resultsResponse.latestPercentage,
        creditDisbursed: resultsResponse.creditDisbursed,
        creditReward: resultsResponse.creditReward,
        attemptCount: resultsResponse.attemptCount,
      };
    } catch (err) {
      console.error('Error refreshing quiz metadata:', err);
    }
  }

  // Refresh subjects to update completion status
  fetchSubjects();
};

// Initialize with user defaults
onMounted(async () => {
  // Load characters first to ensure getCharacterBySubject works
  await fetchCharacters();

  // Fetch filter options from database tables
  await fetchFilterOptions();

  // Set user's default syllabus if available, level can implement in future
  // if (meStore.level_type) {
  //   filters.levelType = meStore.level_type;
  // }
  if (meStore.syllabus_type) {
    filters.syllabusType = meStore.syllabus_type;
  }

  // Fetch subjects with applied filters
  await fetchSubjects();
});
</script>
