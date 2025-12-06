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
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Filters</h3>
        <UButton
          variant="ghost"
          size="sm"
          color="gray"
          @click="clearFilters"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4 mr-1" />
          Clear All
        </UButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Level Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Level</label>
          <USelect
            v-model="filters.levelType"
            :options="[{ label: 'All levels', value: '' }, ...levelTypeOptions]"
            placeholder="Select level"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Syllabus Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Syllabus</label>
          <USelect
            v-model="filters.syllabusType"
            :options="[{ label: 'All syllabuses', value: '' }, ...syllabusTypeOptions]"
            placeholder="Select syllabus"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Subject Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <USelect
            v-model="filters.subject"
            :options="[{ label: 'All subjects', value: '' }, ...subjectOptions]"
            placeholder="Select subject"
            @update:model-value="fetchSubjects"
          />
        </div>
      </div>

      <!-- Has Credits Filter -->
      <div class="mt-4">
        <UCheckbox
          v-model="filters.hasCreditsOnly"
          label="Show only subjects with available credits"
          @update:model-value="fetchSubjects"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
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

    <!-- Subjects Accordion -->
    <div v-else-if="subjects.length > 0" class="space-y-4">
      <div
        v-for="subject in subjects"
        :key="subject.name"
        class="bg-white rounded-lg shadow-sm border"
      >
        <!-- Accordion Header -->
        <button
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          @click="toggleAccordion(subject.name)"
        >
          <div class="flex items-center space-x-3">
            <span class="font-medium text-gray-900">{{ subject.display_name }}</span>
          </div>
          <UIcon
            :name="openSubjects.includes(subject.name) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-5 h-5 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-180': openSubjects.includes(subject.name) }"
          />
        </button>

        <!-- Accordion Content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[2000px] opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-[2000px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="openSubjects.includes(subject.name)" class="overflow-hidden">
            <div class="px-6 pb-6 space-y-4">
              <!-- Chapter Cards -->
              <div class="grid gap-4 mt-4">
                <div
                  v-for="chapter in subject.chapters"
                  :key="chapter.name"
                  class="border border-primary rounded-lg p-4"
                >
                  <div class="flex justify-between items-start">
                    <!-- Chapter Info -->
                    <div class="flex-1 mr-4">
                      <h4 class="font-medium text-gray-900 mb-1">{{ chapter.display_name }}</h4>
                      <p v-if="chapter.description" class="text-sm text-gray-600 mb-2">
                        {{ chapter.description }}
                      </p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span
                          v-if="chapter.user_tasks_chapters?.length > 0"
                          class="flex items-center"
                        >
                          <UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 text-green-500" />
                          Quiz available
                        </span>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex space-x-2">
                      <!-- Lesson Button -->
                      <!-- Height will offset from the outer div -->
                      <UButton
                        size="xl"
                        color="secondary"
                        variant="outline"
                        @click="handleStudyAction(chapter, subject.subject_name, subject.display_name, 'lesson')"
                      >
                        <div>
                          <UIcon name="i-lucide-book-open" size="24" />
                          <div>
                            Lesson
                          </div>
                        </div>
                      </UButton>

                      <!-- Practice Button -->
                      <UButton
                        size="xl"
                        variant="outline"
                        @click="handleStudyAction(chapter, subject.subject_name, subject.display_name, 'practice')"
                      >
                        <div>
                          <UIcon name="i-lucide-target" size="24" />
                          <div>
                            Practice
                          </div>
                        </div>
                      </UButton>
                    </div>
                  </div>

                  <!-- Quiz Tasks - Show each task-chapter assignment separately -->
                  <div
                    v-if="chapter.user_tasks_chapters?.length > 0"
                    class="mt-4 space-y-3 border-t pt-4"
                  >
                    <div
                      v-for="(taskChapter, index) in chapter.user_tasks_chapters"
                      :key="taskChapter.id"
                      class="bg-gray-50 rounded-lg p-3"
                    >
                      <div class="flex items-center justify-between">
                        <!-- Task Info -->
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold mr-2">
                              {{ index + 1 }}
                            </span>
                            <span class="text-sm font-medium text-gray-900">
                              {{ taskChapter.user_tasks?.name || 'Quiz Task' }}
                            </span>
                            <span v-if="taskChapter.user_tasks?.credit > 0" class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 ml-2">
                              {{ taskChapter.user_tasks.credit }} credits
                            </span>
                            <span v-if="taskChapter.user_tasks?.required_score" class="text-xs text-gray-600 ml-1">
                              · {{ taskChapter.user_tasks.required_score }}% required
                            </span>
                            <!-- Credit Status Pill -->
                            <span
                              v-if="quizMetadata[taskChapter.id]?.creditDisbursed"
                              class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700"
                            >
                              ✓ Credits Earned
                            </span>
                            <span
                              v-else-if="quizMetadata[taskChapter.id]?.isCompleted && quizMetadata[taskChapter.id]?.creditReward > 0"
                              class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"
                            >
                              Credits Pending
                            </span>
                          </div>

                          <!-- Scores -->
                          <div
                            v-if="quizMetadata[taskChapter.id]?.isCompleted"
                            class="flex items-center gap-4 text-xs text-gray-600"
                          >
                            <span>
                              Best: <strong>{{ quizMetadata[taskChapter.id]?.bestPercentage || 0 }}%</strong>
                            </span>
                            <span>
                              Latest: <strong>{{ quizMetadata[taskChapter.id]?.latestPercentage || 0 }}%</strong>
                            </span>
                            <span v-if="quizMetadata[taskChapter.id]?.attemptCount">
                              Attempts: {{ quizMetadata[taskChapter.id].attemptCount }}
                            </span>
                          </div>
                        </div>

                        <!-- Quiz Action Buttons -->
                        <div class="flex space-x-2">
                          <!-- Review Button -->
                          <UButton
                            v-if="quizMetadata[taskChapter.id]?.isCompleted"
                            size="sm"
                            color="gray"
                            variant="outline"
                            :loading="quizButtonLoading[taskChapter.id]"
                            @click="handleQuizReview(taskChapter, chapter, subject.subject_name)"
                          >
                            <UIcon name="i-lucide-eye" class="w-4 h-4 mr-1" />
                            Review Quiz
                          </UButton>

                          <!-- Reattempt / Attempt / Generate Button -->
                          <UButton
                            size="sm"
                            :color="quizMetadata[taskChapter.id]?.isCompleted ? 'primary' : 'blue'"
                            :loading="quizButtonLoading[taskChapter.id]"
                            @click="handleQuizClick(taskChapter, chapter, subject.subject_name)"
                          >
                            <UIcon
                              :name="quizMetadata[taskChapter.id]?.isCompleted ? 'i-lucide-refresh-cw' : 'i-lucide-brain'"
                              class="w-4 h-4 mr-1"
                            />
                            {{
                              quizMetadata[taskChapter.id]?.isCompleted
                                ? 'Reattempt Quiz'
                                : (quizExists[taskChapter.id] ? 'Attempt Quiz' : 'Generate Quiz')
                            }}
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
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
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMeStore } from '~/stores/me';
import { useStudy } from '~/composables/useStudy';
import { useCharacters } from '~/composables/useCharacters';
import { useTokenUsage } from '~/composables/useTokenUsage';
import QuizAttemptModal from '~/components/dashboard/quiz/QuizAttemptModal.vue';

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
const openSubjects = ref<string[]>([]);
const quizButtonLoading = reactive<Record<string, boolean>>({});
const quizExists = reactive<Record<string, boolean>>({});
const quizCompleted = reactive<Record<string, boolean>>({});
const quizMetadata = reactive<Record<string, any>>({}); // Store quiz metadata by taskChapterId

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
  for (const chapter of chapters) {
    if (chapter.user_tasks_chapters?.length > 0) {
      // Check ALL task-chapter assignments, not just the first one
      for (const taskChapter of chapter.user_tasks_chapters) {
        const userTasksChapterId = taskChapter.id;
        if (userTasksChapterId) {
          try {
            const checkResponse = await $fetch('/api/quiz/check-existing', {
              method: 'GET',
              query: {
                userTasksChapterId: userTasksChapterId,
              },
            });
            quizExists[userTasksChapterId] = checkResponse.exists;

            // Fetch quiz metadata (scores, completion, credits, etc.)
            if (checkResponse.exists) {
              const resultsResponse = await $fetch(`/api/quiz/${userTasksChapterId}/results`, {
                method: 'GET',
              });

              quizCompleted[userTasksChapterId] = resultsResponse.isCompleted || false;
              quizMetadata[userTasksChapterId] = {
                isCompleted: resultsResponse.isCompleted,
                bestScore: resultsResponse.bestScore,
                bestPercentage: resultsResponse.bestPercentage,
                latestScore: resultsResponse.latestScore,
                latestPercentage: resultsResponse.latestPercentage,
                creditDisbursed: resultsResponse.creditDisbursed,
                creditReward: resultsResponse.creditReward,
                attemptCount: resultsResponse.attemptCount,
              };
            } else {
              quizCompleted[userTasksChapterId] = false;
              quizMetadata[userTasksChapterId] = {
                isCompleted: false,
              };
            }
          } catch (err) {
            console.error(`Error checking quiz for task-chapter ${userTasksChapterId}:`, err);
            quizExists[userTasksChapterId] = false;
            quizCompleted[userTasksChapterId] = false;
            quizMetadata[userTasksChapterId] = {
              isCompleted: false,
            };
          }
        }
      }
    }
  }
};

const handleQuizClick = async (taskChapter: any, chapter: any, subjectName: string) => {
  const userTasksChapterId = taskChapter.id;

  try {
    // Set loading state
    quizButtonLoading[userTasksChapterId] = true;

    // Check if quiz already exists for this task-chapter
    const checkResponse = await $fetch('/api/quiz/check-existing', {
      method: 'GET',
      query: {
        userTasksChapterId: userTasksChapterId,
      },
    });

    if (checkResponse.exists) {
      // Quiz already exists - open modal in attempt mode
      selectedUserTasksChapterId.value = userTasksChapterId;
      selectedChapterDisplayName.value = chapter.display_name;
      quizModalMode.value = 'attempt';
      isQuizModalOpen.value = true;
    } else {
      // No quiz exists - generate one
      console.log('Generating quiz for task-chapter:', userTasksChapterId);

      // Generate prompt using useStudy composable
      const studyResult = generateStudyPrompt(chapter.display_name, subjectName, 'quiz');

      const generateResponse = await $fetch('/api/quiz/generate', {
        method: 'POST',
        body: {
          prompt: studyResult.prompt,
          chapterName: chapter.name,
          chapterDisplayName: chapter.display_name,
          subjectName: subjectName,
          userLevel: meStore.level_type || '',
          syllabusType: meStore.syllabus_type || '',
          numQuestions: 10,
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

const toggleAccordion = async (subjectName: string) => {
  const index = openSubjects.value.indexOf(subjectName);
  if (index > -1) {
    openSubjects.value.splice(index, 1);
  } else {
    openSubjects.value.push(subjectName);
    // Check quiz existence when opening accordion
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
