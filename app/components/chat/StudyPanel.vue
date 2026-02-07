<template>
  <!-- Desktop: Side Panel -->
  <div
    v-if="!isMobile"
    class="flex-shrink-0 w-96 border-l border-gray-200 bg-white overflow-hidden flex flex-col h-full"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
      <h3 class="font-semibold text-gray-900">Study</h3>
      <button
        class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4 text-gray-500" />
      </button>
    </div>

    <!-- Filters -->
    <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-2">
      <USelect
        v-model="filters.syllabusType"
        :options="[{ label: 'All syllabuses', value: '' }, ...syllabusTypeOptions]"
        placeholder="All syllabuses"
        size="sm"
        @update:model-value="fetchSubjects"
      />
      <USelect
        v-model="filters.subject"
        :options="[{ label: 'All subjects', value: '' }, ...subjectOptions]"
        placeholder="All subjects"
        size="sm"
        @update:model-value="fetchSubjects"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-8">
        <UIcon name="i-lucide-alert-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p class="text-sm text-red-600">{{ error }}</p>
        <button class="mt-2 text-sm text-primary hover:underline" @click="fetchSubjects">
          Try again
        </button>
      </div>

      <!-- Subject List -->
      <div v-else-if="subjects.length > 0" class="space-y-2">
        <div v-for="subject in subjects" :key="subject.name" class="space-y-1">
          <!-- Subject Header -->
          <button
            class="w-full text-left px-3 py-2 rounded-lg transition-all"
            :class="selectedSubject === subject.name
              ? 'bg-primary-50 text-primary-700'
              : 'hover:bg-gray-50 text-gray-900'"
            @click="toggleSubject(subject.name)"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium truncate">{{ subject.display_name }}</span>
              <UIcon
                :name="selectedSubject === subject.name ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="w-4 h-4 text-gray-400 flex-shrink-0"
              />
            </div>
          </button>

          <!-- Chapters -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[1000px]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[1000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="selectedSubject === subject.name" class="ml-2 space-y-1 overflow-hidden">
              <div
                v-for="chapter in subject.chapters"
                :key="chapter.name"
                class="bg-gray-50 rounded-lg p-2"
              >
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-gray-700 flex-1">{{ chapter.display_name }}</span>
                  <div class="flex gap-1 flex-shrink-0">
                    <button
                      class="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      :disabled="loadingChapter === chapter.name"
                      @click="startStudy(chapter, subject, 'lesson')"
                    >
                      <template v-if="loadingChapter === chapter.name">
                        <UIcon name="i-lucide-loader-2" class="w-3 h-3 animate-spin" />
                      </template>
                      <template v-else>Lesson</template>
                    </button>
                    <button
                      class="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      @click="startStudy(chapter, subject, 'practice')"
                    >
                      Practice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-8">
        <UIcon name="i-lucide-book-open" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">No subjects available</p>
      </div>
    </div>
  </div>

  <!-- Mobile: Bottom Sheet Drawer -->
  <Teleport v-else to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/40"
        @click="$emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="modelValue"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
      >
        <!-- Drag Handle -->
        <div class="flex justify-center py-2">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Study</h3>
          <button
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Filters -->
        <div class="px-4 py-3 border-b border-gray-100 space-y-2">
          <USelect
            v-model="filters.syllabusType"
            :options="[{ label: 'All syllabuses', value: '' }, ...syllabusTypeOptions]"
            placeholder="All syllabuses"
            size="sm"
            @update:model-value="fetchSubjects"
          />
          <USelect
            v-model="filters.subject"
            :options="[{ label: 'All subjects', value: '' }, ...subjectOptions]"
            placeholder="All subjects"
            size="sm"
            @update:model-value="fetchSubjects"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Loading -->
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-center py-8">
            <UIcon name="i-lucide-alert-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p class="text-sm text-red-600">{{ error }}</p>
            <button class="mt-2 text-sm text-primary hover:underline" @click="fetchSubjects">
              Try again
            </button>
          </div>

          <!-- Subject List -->
          <div v-else-if="subjects.length > 0" class="space-y-2">
            <div v-for="subject in subjects" :key="subject.name" class="space-y-1">
              <!-- Subject Header -->
              <button
                class="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                :class="selectedSubject === subject.name
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50 text-gray-900'"
                @click="toggleSubject(subject.name)"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium truncate">{{ subject.display_name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">{{ subject.chapters.length }}</span>
                    <UIcon
                      :name="selectedSubject === subject.name ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-gray-400"
                    />
                  </div>
                </div>
              </button>

              <!-- Chapters -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[1000px]"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 max-h-[1000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="selectedSubject === subject.name" class="ml-2 space-y-1 overflow-hidden">
                  <div
                    v-for="chapter in subject.chapters"
                    :key="chapter.name"
                    class="bg-gray-50 rounded-lg p-2.5"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-sm text-gray-700 flex-1">{{ chapter.display_name }}</span>
                      <div class="flex gap-1.5 flex-shrink-0">
                        <button
                          class="px-2.5 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                          :disabled="loadingChapter === chapter.name"
                          @click="startStudy(chapter, subject, 'lesson')"
                        >
                          <template v-if="loadingChapter === chapter.name">
                            <UIcon name="i-lucide-loader-2" class="w-3.5 h-3.5 animate-spin" />
                          </template>
                          <template v-else>Lesson</template>
                        </button>
                        <button
                          class="px-2.5 py-1.5 rounded text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 transition-colors"
                          @click="startStudy(chapter, subject, 'practice')"
                        >
                          Practice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="text-center py-8">
            <UIcon name="i-lucide-book-open" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No subjects available</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useResponsive } from '~/composables/useResponsive';
import { useStudy, type StudyActionType } from '~/composables/useStudy';
import { useLessonStart } from '~/composables/useLessonStart';
import { useMeStore } from '~/stores/me';

interface Subject {
  name: string;
  subject_name: string;
  display_name: string;
  description: string | null;
  chapters: any[];
}

interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
});

const emit = defineEmits<{
  'close': [];
  'study-action': [{ prompt: string; subject: string; actionType: StudyActionType }];
}>();

const { isMobile } = useResponsive();
const { generateStudyPrompt } = useStudy();
const { startLesson } = useLessonStart();
const meStore = useMeStore();

// State
const subjects = ref<Subject[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const selectedSubject = ref<string | null>(null);
const loadingChapter = ref<string | null>(null);

// Filters
const filters = reactive({
  syllabusType: '',
  subject: '',
});

// Filter options
const syllabusTypeOptions = ref<Array<{ label: string; value: string }>>([]);
const subjectOptions = ref<Array<{ label: string; value: string }>>([]);

// Methods
const fetchFilterOptions = async () => {
  try {
    const [syllabusResponse, subjectsResponse] = await Promise.all([
      $fetch('/api/options/syllabus'),
      $fetch('/api/options/subjects'),
    ]);

    syllabusTypeOptions.value = syllabusResponse.syllabus || [];
    subjectOptions.value = subjectsResponse.subjects || [];
  } catch (err) {
    console.error('[StudyPanel] Error fetching filter options:', err);
  }
};

const fetchSubjects = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const queryParams = new URLSearchParams();
    if (filters.syllabusType) queryParams.append('syllabus_type', filters.syllabusType);
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (meStore.user_role) queryParams.append('role', meStore.user_role);

    const response = await $fetch(`/api/study/subjects?${queryParams.toString()}`);

    if (response.success) {
      subjects.value = response.subjects;
    } else {
      error.value = 'Failed to load subjects';
    }
  } catch (err: any) {
    console.error('[StudyPanel] Error fetching subjects:', err);
    error.value = err.data?.message || 'Failed to load subjects';
  } finally {
    isLoading.value = false;
  }
};

const toggleSubject = (subjectName: string) => {
  if (selectedSubject.value === subjectName) {
    selectedSubject.value = null;
  } else {
    selectedSubject.value = subjectName;
  }
};

const startStudy = async (chapter: any, subject: Subject, actionType: StudyActionType) => {
  loadingChapter.value = chapter.name;

  try {
    // For lessons, use the seeded lesson flow (same as dashboard)
    // This shows slides immediately if seeded content exists
    if (actionType === 'lesson') {
      await startLesson({
        chapterName: chapter.name,
        chapterDisplayName: chapter.display_name,
        subject: subject.subject_name,
        subjectDisplayName: subject.display_name,
      });

      // Close panel after navigation
      emit('close');
      return;
    }

    // For practice, use the existing prompt-based flow
    const studyResult = generateStudyPrompt(chapter.display_name, subject.display_name, actionType);

    emit('study-action', {
      prompt: studyResult.prompt,
      subject: subject.subject_name,
      actionType,
    });

    // Close panel on mobile after selection
    if (isMobile.value) {
      emit('close');
    }
  } catch (err) {
    console.error('[StudyPanel] Error starting study:', err);
  } finally {
    loadingChapter.value = null;
  }
};

// Initialize
onMounted(async () => {
  await fetchFilterOptions();

  // Set user's default syllabus if available
  if (meStore.syllabus_type) {
    filters.syllabusType = meStore.syllabus_type;
  }

  await fetchSubjects();
});

// Refresh when panel is opened
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && subjects.value.length === 0) {
      fetchSubjects();
    }
  }
);
</script>
