<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Study</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Access lessons, practice, and quizzes by subject</p>
      </div>
    </div>

    <!-- How Study Works -->
    <StudyInstructions />

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
      <div class="flex flex-wrap items-end gap-4">
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

        <!-- Clear Button -->
        <button
          v-if="filters.syllabusType || filters.subject"
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

    <!-- MOBILE: Accordion Layout -->
    <div v-else-if="subjects.length > 0 && isMobile" class="space-y-2">
      <div v-for="subject in subjects" :key="subject.name" class="space-y-2">
        <!-- Subject Card (clickable header) -->
        <button
          class="w-full text-left bg-white rounded-lg border p-2 transition-all"
          :class="selectedSubject === subject.name
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-gray-300'"
          @click="selectSubject(subject.name)"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon
                :name="selectedSubject === subject.name ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="w-4 h-4 text-gray-400 shrink-0"
              />
              <h3 class="font-medium text-sm text-gray-900 truncate">{{ subject.display_name }}</h3>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-gray-500">{{ subject.chapters.length }} ch</span>
            </div>
          </div>
        </button>

        <!-- Expanded Chapters - appears directly under THIS subject (Mobile accordion) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div v-if="selectedSubject === subject.name" class="ml-2 space-y-1">
            <div
              v-for="chapter in subject.chapters"
              :key="chapter.name"
              class="bg-stone-50 rounded-lg p-2 border border-gray-100"
            >
              <!-- Chapter Row: Title + Action Icons -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900">{{ chapter.display_name }}</h4>
                  <p v-if="chapter.description" class="text-xs text-gray-500 mt-0.5">
                    {{ chapter.description }}
                  </p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button
                    class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                    title="Lesson"
                    :disabled="lessonButtonLoading[chapter.name]"
                    @click.stop="handleStudyAction(chapter, subject.subject_name, subject.display_name, 'lesson')"
                  >
                    <UIcon v-if="lessonButtonLoading[chapter.name]" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                    <UIcon v-else name="i-lucide-book-open" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 transition-colors"
                    title="Practice"
                    @click.stop="handleStudyAction(chapter, subject.subject_name, subject.display_name, 'practice')"
                  >
                    <UIcon name="i-lucide-target" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- DESKTOP: Grid + Expanded Section Layout -->
    <div v-else-if="subjects.length > 0" class="space-y-6">
      <!-- Grid of Subject Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <button
          v-for="subject in subjects"
          :key="subject.name"
          class="text-left bg-white rounded-xl border p-5 transition-all"
          :class="selectedSubject === subject.name
            ? 'border-2 border-primary shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'"
          @click="selectSubject(subject.name)"
        >
          <div>
            <h3 class="font-semibold text-gray-900">{{ subject.display_name }}</h3>
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span>{{ subject.chapters.length }} {{ subject.chapters.length === 1 ? 'chapter' : 'chapters' }}</span>
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
                    :loading="lessonButtonLoading[chapter.name]"
                    :disabled="lessonButtonLoading[chapter.name]"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMeStore } from '~/stores/me';
import { useStudy } from '~/composables/useStudy';
import { useCharacters } from '~/composables/useCharacters';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useThreads } from '~/composables/useThreads';
import { useAnalytics } from '~/composables/useAnalytics';
import { useResponsive } from '~/composables/useResponsive';
import DashboardSkeleton from '~/components/common/DashboardSkeleton.vue';
import StudyInstructions from '~/components/dashboard/StudyInstructions.vue';

const { isMobile } = useResponsive();

const router = useRouter();
const { generateStudyPrompt } = useStudy();
const meStore = useMeStore();
const { getCharacterBySubject, fetchCharacters } = useCharacters();
const toast = useToast();
const analytics = useAnalytics();

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
const lessonButtonLoading = reactive<Record<string, boolean>>({}); // Track lesson button loading state

// Computed: Selected subject data for desktop expanded view
const selectedSubjectData = computed(() => {
  if (!selectedSubject.value) return null;
  return subjects.value.find((s) => s.name === selectedSubject.value) || null;
});

// Filters
const filters = reactive({
  syllabusType: '',
  subject: ''
});

// Filter options (will be populated from data)
const syllabusTypeOptions = ref<Array<{ label: string; value: string }>>([]);
const subjectOptions = ref<Array<{ label: string; value: string }>>([]);

// Methods
const fetchFilterOptions = async () => {
  try {
    // Fetch filter options in parallel
    const [syllabusResponse, subjectsResponse] = await Promise.all([
      $fetch('/api/options/syllabus'),
      $fetch('/api/options/subjects')
    ]);

    // Set filter options
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
    if (filters.syllabusType) queryParams.append('syllabus_type', filters.syllabusType);
    if (filters.subject) queryParams.append('subject', filters.subject);
    // Pass role to avoid redundant DB query on backend
    if (meStore.user_role) queryParams.append('role', meStore.user_role);

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
  // Set loading state for lesson button
  if (actionType === 'lesson') {
    lessonButtonLoading[chapter.name] = true;
  }

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

    const upperCaseSubject = subjectName.toUpperCase();
    const character = getCharacterBySubject(upperCaseSubject);
    const characterSlug = character?.slug || 'eddy';

    // For lessons, try seeded lesson first
    if (actionType === 'lesson') {
      try {
        const lessonResponse = await $fetch<{
          success: boolean;
          hasSeededLesson: boolean;
          thread?: { id: string; title: string; subject: string | null; created_at?: string; updated_at?: string };
          slideCount?: number;
        }>('/api/lesson/start', {
          method: 'POST',
          body: {
            chapterName: chapter.name,
            subject: subjectName,
          },
        });

        if (lessonResponse.success && lessonResponse.hasSeededLesson && lessonResponse.thread) {
          // Track lesson start
          analytics.learning.lessonStart({
            chapterId: chapter.name,
            subjectId: subjectName,
            lessonType: 'seeded',
          });
          // Refresh thread list from database to include newly created thread
          const { fetchThreads } = useThreads();
          await fetchThreads(true); // forceRefresh = true to reload from DB
          // Navigate directly to the created thread with seeded lesson
          await router.push(`/chat/${characterSlug}/${lessonResponse.thread.id}`);
          return;
        }
        // If no seeded lesson, fall through to AI generation
      } catch (lessonError) {
        console.warn('Seeded lesson not available, falling back to AI generation:', lessonError);
        toast.add({
          title: 'Generating lesson',
          description: 'Creating a fresh lesson for you...',
          color: 'blue',
          timeout: 3000,
        });
        // Fall through to AI generation
      }
    }

    // Proceed with AI generation (fallback for lessons, default for practice/quiz)
    const studyResult = generateStudyPrompt(chapter.display_name, subjectDisplayName, actionType);

    // Track AI-generated lesson/practice start
    if (actionType === 'lesson') {
      analytics.learning.lessonStart({
        chapterId: chapter.name,
        subjectId: subjectName,
        lessonType: 'ai',
      });
    }

    const queryParams = new URLSearchParams({
      study_prompt: studyResult.prompt
    });

    await router.push(`/chat/${characterSlug}/new?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error handling study action:', error);
  } finally {
    // Clear loading state for lesson button
    if (actionType === 'lesson') {
      lessonButtonLoading[chapter.name] = false;
    }
  }
};

const selectSubject = async (subjectName: string) => {
  if (selectedSubject.value === subjectName) {
    selectedSubject.value = null;
  } else {
    selectedSubject.value = subjectName;
  }
};

const clearFilters = () => {
  filters.syllabusType = '';
  filters.subject = '';
  fetchSubjects();
};

// Initialize with user defaults
onMounted(async () => {
  // Load characters and filter options in parallel (independent data)
  await Promise.all([
    fetchCharacters(),
    fetchFilterOptions(),
  ]);

  // Set user's default syllabus if available
  if (meStore.syllabus_type) {
    filters.syllabusType = meStore.syllabus_type;
  }

  // Fetch subjects with applied filters (depends on filters being set)
  await fetchSubjects();
});
</script>
