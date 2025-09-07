<template>
  <div class="min-h-24">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
      <p class="text-gray-600 text-sm">Loading chapters...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="Object.keys(chapters).length === 0" class="text-center py-12">
      <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
        <UIcon name="i-lucide-book-open" size="64" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No chapters available</h3>
      <p class="text-gray-500">Try adjusting your filters or check back later.</p>
    </div>

    <!-- Accordion Layout -->
    <div v-else class="space-y-3">
      <div
        v-for="(group, subjectName) in chapters"
        :key="subjectName"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <!-- Accordion Header (Clickable) -->
        <button
          class="w-full bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200 hover:from-primary-100 hover:to-primary-150 transition-colors duration-150"
          @click="toggleAccordion(subjectName)"
        >
          <div class="flex items-center justify-between">
            <div class="text-left">
              <h3 class="text-lg font-semibold text-primary-900">
                {{ group.subject.display_name }}
              </h3>
              <p class="text-sm text-primary-700 mt-1">
                {{ group.chapters.length }} chapter{{ group.chapters.length === 1 ? '' : 's' }} available
              </p>
              <!-- Credits Information -->
              <div v-if="props.subjectCredits?.[group.subject.name]" class="text-sm text-orange-700 mt-1 font-medium">
                📋 {{ props.subjectCredits[group.subject.name].totalCredits }} credits allocated
                ({{ props.subjectCredits[group.subject.name].creditsPerQuiz }} per quiz)
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-book" class="w-5 h-5 text-primary-600" />
              <UIcon
                :name="expandedSubjects[subjectName] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="w-5 h-5 text-primary-600 transition-transform duration-200"
              />
            </div>
          </div>
        </button>

        <!-- Accordion Content (Collapsible) -->
        <div
          v-show="expandedSubjects[subjectName]"
          class="divide-y divide-gray-100 transition-all duration-300 ease-in-out"
        >
          <div
            v-for="chapter in group.chapters"
            :key="chapter.name"
            class="flex items-start justify-between p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <!-- Chapter Info -->
            <div class="flex-1 pr-4">
              <h4 class="font-medium text-gray-900 text-lg mb-2">{{ chapter.display_name }}</h4>
              <p v-if="chapter.description" class="text-sm text-gray-600 leading-relaxed">
                {{ chapter.description }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2 flex-shrink-0">
              <button
                class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-150"
                @click="handleChapterSelect(chapter, group.subject, 'lesson')"
              >
                <UIcon name="i-lucide-book-open" class="w-4 h-4 mr-1.5" />
                Lesson
              </button>
              <button
                class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors duration-150"
                @click="handleChapterSelect(chapter, group.subject, 'practice')"
              >
                <UIcon name="i-lucide-brain" class="w-4 h-4 mr-1.5" />
                Practice
              </button>
              <!-- Task Button (shown when credits available) -->
              <button
                v-if="props.subjectCredits?.[group.subject.name]?.availableTasks?.length > 0"
                class="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors duration-150"
                @click="handleTaskButtonClick(group.subject)"
              >
                <UIcon name="i-lucide-target" class="w-4 h-4 mr-1.5" />
                Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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

// Props
const props = defineProps<{
  chapters: GroupedChapters;
  subjectCredits?: Record<string, any>;
  isLoading?: boolean;
}>();

// Emits
const emit = defineEmits<{
  chapterSelected: [chapter: Chapter, subject: Subject, ActionType: StudyActionType];
  taskSelected: [subject: Subject, threadId: string];
}>();

// Accordion state
const expandedSubjects = ref<Record<string, boolean>>({});

// Initialize accordion state - expand subjects with credits by default
const initializeAccordionState = () => {
  const newState: Record<string, boolean> = {};
  Object.keys(props.chapters).forEach((subjectName) => {
    // Expand subjects with credits by default, collapse others
    const hasCredits = props.subjectCredits?.[subjectName]?.totalCredits > 0;
    newState[subjectName] = hasCredits;
  });
  expandedSubjects.value = newState;
};

// Watch for changes in chapters and initialize accordion state
watch(
  () => props.chapters,
  () => {
    if (Object.keys(props.chapters).length > 0) {
      initializeAccordionState();
    }
  },
  { immediate: true }
);

// Methods
const toggleAccordion = (subjectName: string) => {
  expandedSubjects.value[subjectName] = !expandedSubjects.value[subjectName];
};

const handleChapterSelect = (chapter: Chapter, subject: Subject, ActionType: StudyActionType) => {
  emit('chapterSelected', chapter, subject, ActionType);
};

const handleTaskButtonClick = (subject: Subject) => {
  const subjectCredits = props.subjectCredits?.[subject.name];
  if (subjectCredits?.availableTasks?.length > 0) {
    // Get the first available task
    const task = subjectCredits.availableTasks[0];
    emit('taskSelected', subject, task.threadId);
  }
};
</script>
