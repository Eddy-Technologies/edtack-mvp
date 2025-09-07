<template>
  <div class="dashboard-study">
    <div class="study-container">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Study Practice</h2>
        <p class="text-gray-600">Choose a subject and chapter to start practicing</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-gray-600">Loading chapters...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <Button
          variant="primary"
          text="Try Again"
          @clicked="loadChapters"
        />
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Filters -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Subject Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Subject:</label>
              <select
                v-model="selectedSubject"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 min-w-[180px]"
                @change="handleSubjectChange"
              >
                <option value="">All Subjects</option>
                <option
                  v-for="subject in availableSubjects"
                  :key="subject.name"
                  :value="subject.name"
                >
                  {{ subject.display_name }}
                </option>
              </select>
            </div>

            <!-- Syllabus Type Filter -->
            <div v-if="syllabusOptions.length > 0" class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Syllabus:</label>
              <select
                v-model="selectedSyllabusType"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900 min-w-[150px]"
                @change="handleFilterChange"
              >
                <option value="">Auto-detect</option>
                <option
                  v-for="syllabus in syllabusOptions"
                  :key="syllabus.value"
                  :value="syllabus.value"
                >
                  {{ syllabus.label }}
                </option>
              </select>
            </div>

            <!-- Credits Filter -->
            <div class="flex items-center space-x-2">
              <input
                id="credits-first"
                v-model="showCreditsFirst"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              >
              <label for="credits-first" class="text-sm font-medium text-gray-700">
                Show subjects with credits first
              </label>
            </div>

            <!-- Clear Filters -->
            <Button
              v-if="selectedSubject || selectedSyllabusType || showCreditsFirst"
              variant="secondary"
              text="Clear Filters"
              size="sm"
              @clicked="clearFilters"
            />
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div class="text-sm text-gray-600">
              {{ totalChapters }} chapters available
              <span v-if="selectedSubject" class="text-primary-600 font-medium">
                in {{ getSubjectDisplayName(selectedSubject) }}
              </span>
            </div>
            <div class="text-sm text-gray-500">
              Select a chapter to start studying
            </div>
          </div>
        </div>

        <!-- Chapter Browser -->
        <ChapterSelector
          :chapters="filteredChapters"
          :subject-credits="subjectCredits"
          :is-loading="isLoadingChapters"
          @chapter-selected="handleChapterSelected"
          @task-selected="handleTaskSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ChapterSelector from '~/components/dashboard/study/ChapterSelector.vue';
import Button from '~/components/common/Button.vue';
import { useMeStore } from '~/stores/me';
import { useCharacters } from '~/composables/useCharacters';
import { useStudy, type StudyActionType } from '~/composables/useStudy';
import { useTask } from '~/composables/useTask';

// Types
interface Subject {
  name: string;
  display_name: string;
  subject_name: string;
}

interface Chapter {
  name: string;
  display_name: string;
  description: string | null;
  level: number;
  parent_id: string | null;
  subject_id: string;
}

interface GroupedChapters {
  [subjectName: string]: {
    subject: Subject;
    chapters: Chapter[];
  };
}

// Store
const meStore = useMeStore();
const router = useRouter();
const { getCharacterBySubject } = useCharacters();
const { loadSubjectCredits: loadCredits } = useTask();

// Reactive state
const chapters = ref<GroupedChapters>({});
const allChapters = ref<GroupedChapters>({}); // Keep unfiltered chapters for dropdown
const syllabusOptions = ref<Array<{ value: string; label: string }>>([]);
const subjectCredits = ref<Record<string, any>>({});
const isLoading = ref(true);
const isLoadingChapters = ref(false);
const error = ref<string | null>(null);

// Filters - initialize with user's syllabus type
const selectedSubject = ref('');
const selectedSyllabusType = ref(meStore.syllabus_type || '');
const showCreditsFirst = ref(false);

// Computed properties
const availableSubjects = computed(() => {
  return Object.values(allChapters.value).map((group) => group.subject);
});

const filteredChapters = computed(() => {
  let chapters = allChapters.value;

  // Filter by selected subject if any
  if (selectedSubject.value) {
    const filtered: GroupedChapters = {};
    if (chapters[selectedSubject.value]) {
      filtered[selectedSubject.value] = chapters[selectedSubject.value];
    }
    chapters = filtered;
  }

  // Sort subjects with credits first if filter is enabled
  if (showCreditsFirst.value) {
    const subjectEntries = Object.entries(chapters);

    // Sort subjects: those with credits first, then alphabetically
    subjectEntries.sort(([subjectA], [subjectB]) => {
      const hasCreditsA = subjectCredits.value[subjectA]?.totalCredits > 0;
      const hasCreditsB = subjectCredits.value[subjectB]?.totalCredits > 0;

      if (hasCreditsA && !hasCreditsB) return -1;
      if (!hasCreditsA && hasCreditsB) return 1;
      return subjectA.localeCompare(subjectB);
    });

    // Rebuild the object with sorted entries
    const sortedChapters: GroupedChapters = {};
    subjectEntries.forEach(([key, value]) => {
      sortedChapters[key] = value;
    });

    return sortedChapters;
  }

  return chapters;
});

const totalChapters = computed(() => {
  return Object.values(filteredChapters.value)
    .reduce((total, group) => total + group.chapters.length, 0);
});

// Methods
const loadSyllabusOptions = async () => {
  try {
    const response = await $fetch('/api/options/syllabus');
    syllabusOptions.value = response.syllabus || [];
  } catch (err) {
    console.error('Failed to load syllabus options:', err);
  }
};

const loadSubjectCredits = async () => {
  subjectCredits.value = await loadCredits();
};

const loadChapters = async () => {
  try {
    isLoadingChapters.value = true;
    error.value = null;

    const query: Record<string, string> = {};
    if (selectedSubject.value) {
      query.subject = selectedSubject.value;
    }
    if (selectedSyllabusType.value) {
      query.syllabus_type = selectedSyllabusType.value;
    }

    const response = await $fetch('/api/chapters/by-curriculum', {
      query
    });

    if (response.success) {
      allChapters.value = response.chapters;
      chapters.value = response.chapters;
    } else {
      throw new Error('Failed to load chapters');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load chapters';
    console.error('Failed to load chapters:', err);
  } finally {
    isLoadingChapters.value = false;
  }
};

const handleSubjectChange = () => {
  loadChapters();
};

const handleFilterChange = () => {
  loadChapters();
};

const clearFilters = () => {
  selectedSubject.value = '';
  selectedSyllabusType.value = '';
  showCreditsFirst.value = false;
  loadChapters();
};

const getSubjectDisplayName = (subjectName: string) => {
  const group = allChapters.value[subjectName];
  return group ? group.subject.display_name : subjectName;
};

const handleChapterSelected = async (chapter: Chapter, subject: Subject, actionType: StudyActionType) => {
  try {
    // Try different variations of the subject name to find a matching character
    let character = await getCharacterBySubject(subject.subject_name.toUpperCase());

    if (!character) {
      character = await getCharacterBySubject(subject.name.toUpperCase());
    }

    if (!character) {
      character = await getCharacterBySubject(subject.display_name.toUpperCase());
    }

    if (!character) {
      // Log available characters for debugging
      console.error('No character found for subject:', {
        subject_name: subject.subject_name,
        name: subject.name,
        display_name: subject.display_name
      });
      error.value = `No character available for ${subject.display_name}. Please contact support.`;
      return;
    }

    // Generate prompt using the client-side composable
    const { generateStudyPrompt } = useStudy();
    const promptResult = generateStudyPrompt(
      chapter.name,
      subject.name,
      actionType
    );

    // Navigate to chat with the generated prompt
    router.push(`/chat/${character.slug}/new?study_prompt=${encodeURIComponent(promptResult.prompt)}&study_title=${encodeURIComponent(promptResult.taskTitle)}`);
  } catch (err: any) {
    console.error('Failed to generate study prompt:', err);
    error.value = 'Failed to generate study prompt. Please try again.';
  }
};

const handleTaskSelected = async (subject: Subject, threadId: string) => {
  console.log(subject, threadId);
  try {
    // Try different variations of the subject name to find a matching character
    let character = await getCharacterBySubject(subject.subject_name.toUpperCase());

    if (!character) {
      character = await getCharacterBySubject(subject.name.toUpperCase());
    }

    if (!character) {
      character = await getCharacterBySubject(subject.display_name.toUpperCase());
    }

    if (!character) {
      // Log available characters for debugging
      console.error('No character found for subject:', {
        subject_name: subject.subject_name,
        name: subject.name,
        display_name: subject.display_name
      });
      error.value = `No character available for ${subject.display_name}. Please contact support.`;
      return;
    }

    // Navigate to chat with the generated prompt
    router.push(`/chat/${character.slug}/${threadId}`);
  } catch (err: any) {
    console.error('Failed to generate task:', err);
    error.value = 'Failed to generate task. Please try again.';
  }
};

// Lifecycle
onMounted(async () => {
  isLoading.value = true;
  try {
    // Initialize characters and load data in parallel
    const { initializeStore } = useCharacters();
    await Promise.all([
      initializeStore(),
      loadSyllabusOptions(),
      loadChapters(),
      loadSubjectCredits()
    ]);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.dashboard-study {
  height: 100%;
  overflow-y: auto;
}

.study-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
  max-width: 6xl;
  margin: 0 auto;
}
</style>
