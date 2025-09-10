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
            <UBadge v-if="subject.totalCredits > 0" color="primary" size="xs">
              {{ subject.totalCredits }} credits
            </UBadge>
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
              <div class="grid gap-4">
                <div
                  v-for="chapter in subject.chapters"
                  :key="chapter.name"
                  class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start">
                    <!-- Chapter Info -->
                    <div class="flex-1 mr-4">
                      <h4 class="font-medium text-gray-900 mb-1">{{ chapter.display_name }}</h4>
                      <p v-if="chapter.description" class="text-sm text-gray-600 mb-2">
                        {{ chapter.description }}
                      </p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span v-if="chapter.credits > 0" class="flex items-center">
                          <UIcon name="i-lucide-coins" class="w-3 h-3 mr-1" />
                          {{ chapter.credits }} credits
                        </span>
                        <span v-if="chapter.taskThreads && chapter.taskThreads.length > 0" class="flex items-center">
                          <UIcon name="i-lucide-check-circle" class="w-3 h-3 mr-1 text-green-500" />
                          Quiz available
                        </span>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex space-x-2">
                      <!-- Lesson Button -->
                      <UButton
                        size="sm"
                        color="blue"
                        variant="soft"
                        @click="handleStudyAction(chapter, subject.name, 'lesson')"
                      >
                        <UIcon name="i-lucide-book-open" class="w-4 h-4 mr-1" />
                        Lesson
                      </UButton>

                      <!-- Practice Button -->
                      <UButton
                        size="sm"
                        color="green"
                        variant="soft"
                        @click="handleStudyAction(chapter, subject.name, 'practice')"
                      >
                        <UIcon name="i-lucide-target" class="w-4 h-4 mr-1" />
                        Practice
                      </UButton>

                      <!-- Quiz Button (only if chapter has tasks) -->
                      <UButton
                        v-if="chapter.hasUserTasks"
                        size="sm"
                        color="primary"
                        variant="soft"
                        :loading="quizButtonLoading[chapter.name]"
                        @click="handleQuizClick(chapter, subject.name)"
                      >
                        <UIcon name="i-lucide-brain" class="w-4 h-4 mr-1" />
                        Quiz
                      </UButton>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMeStore } from '~/stores/me';
import { useStudy } from '~/composables/useStudy';
import { useCharacters } from '~/composables/useCharacters';

const router = useRouter();
const { generateStudyPrompt, handleQuizAction } = useStudy();
const meStore = useMeStore();
const { getCharacterBySubject, fetchCharacters } = useCharacters();

interface Chapter {
  name: string;
  display_name: string;
  description: string | null;
  hasUserTasks: boolean;
  taskThreads: any[];
  credits: number;
}

interface Subject {
  name: string;
  display_name: string;
  description: string | null;
  level_type: string;
  level_type_description?: string;
  syllabus_type: string;
  syllabus_type_description?: string;
  chapters: Chapter[];
  totalCredits: number;
}

// State
const subjects = ref<Subject[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const quizButtonLoading = reactive<Record<string, boolean>>({});
const openSubjects = ref<string[]>([]);

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
      populateFilterOptions(response.availableLevelTypes, response.availableSyllabusTypes);
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

const populateFilterOptions = (availableLevelTypes?: Record<string, string>, availableSyllabusTypes?: Record<string, string>) => {
  // Use the comprehensive level and syllabus data from the API
  if (availableLevelTypes) {
    levelTypeOptions.value = Object.entries(availableLevelTypes)
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({
        label,
        value
      }));
  }

  if (availableSyllabusTypes) {
    syllabusTypeOptions.value = Object.entries(availableSyllabusTypes)
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({
        label,
        value
      }));
  }

  // Build subject options from subjects data
  const subjectList: Array<{ label: string; value: string }> = [];
  subjects.value.forEach((subject) => {
    subjectList.push({ label: subject.display_name, value: subject.name });
  });
  subjectOptions.value = subjectList.sort((a, b) => a.label.localeCompare(b.label));
};

const handleStudyAction = async (chapter: Chapter, subjectName: string, actionType: 'lesson' | 'practice') => {
  try {
    const studyResult = generateStudyPrompt(chapter.display_name, subjectName, actionType);

    // Navigate to chat with study prompt
    const queryParams = new URLSearchParams({
      study_prompt: studyResult.prompt
    });

    // Get the appropriate character for this subject
    const character = getCharacterBySubject(subjectName);
    const characterSlug = character?.slug || 'eddy';

    await router.push(`/chat/${characterSlug}/new?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error handling study action:', error);
  }
};

const handleQuizClick = async (chapter: Chapter, subjectName: string) => {
  try {
    await handleQuizAction(chapter, subjectName, quizButtonLoading);
  } catch (error: any) {
    console.error('Error handling quiz click:', error);
    error.value = error.data?.message || 'Failed to create quiz session';
  }
};

const toggleAccordion = (subjectName: string) => {
  const index = openSubjects.value.indexOf(subjectName);
  if (index > -1) {
    openSubjects.value.splice(index, 1);
  } else {
    openSubjects.value.push(subjectName);
  }
};

const clearFilters = () => {
  filters.levelType = '';
  filters.syllabusType = '';
  filters.subject = '';
  filters.hasCreditsOnly = false;
  fetchSubjects();
};

// Initialize with user defaults
onMounted(async () => {
  // Load characters first to ensure getCharacterBySubject works
  await fetchCharacters();

  // Set user's default level and syllabus if available
  if (meStore.level_type) {
    filters.levelType = meStore.level_type;
  }
  if (meStore.syllabus_type) {
    filters.syllabusType = meStore.syllabus_type;
  }

  // Fetch subjects (this will also populate filter options)
  await fetchSubjects();
});
</script>
