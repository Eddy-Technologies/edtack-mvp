<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
      <div class="p-4 sm:p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ modalTitle }}
            </h2>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleClose"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Screen Router -->
        <QuizReviewScreen
          v-if="showResults"
          :user-tasks-chapter-id="userTasksChapterId"
          :chapter-display-name="chapterDisplayName"
          :mode="localMode"
          :assignee-user-info-id="assigneeUserInfoId"
          @reattempt="handleReattempt"
          @close="$emit('close')"
        />

        <QuizAttemptScreen
          v-else
          :user-tasks-chapter-id="userTasksChapterId"
          :chapter-display-name="chapterDisplayName"
          :is-submitting="isSubmitting"
          @submit-quiz="handleQuizSubmit"
          @close="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import QuizAttemptScreen from './QuizAttemptScreen.vue';
import QuizReviewScreen from './QuizReviewScreen.vue';

const props = defineProps<{
  isOpen: boolean;
  userTasksChapterId?: string;
  chapterDisplayName: string;
  mode?: 'attempt' | 'review' | 'parent-review';
  assigneeUserInfoId?: string; // For parent review mode
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'quiz-submitted', score: number, totalScore: number): void;
  (e: 'reattempt', chapterId: string): void;
}>();

// State for screen routing
const showResults = ref(false);
const localMode = ref<'attempt' | 'review' | 'parent-review'>(props.mode || 'attempt');
const isSubmitting = ref(false);
const childName = ref<string>(''); // For parent review mode

// Computed title based on mode and state
const modalTitle = computed(() => {
  if (props.mode === 'parent-review' && childName.value) {
    return `${childName.value}'s Quiz Results`;
  }
  if (showResults.value) {
    return 'Quiz Results';
  }
  return props.chapterDisplayName;
});

// Handle quiz submission
const handleQuizSubmit = async (answers: Record<number, any>) => {
  isSubmitting.value = true;

  try {
    const response = await $fetch('/api/quiz/attempt', {
      method: 'POST',
      body: {
        userTasksChapterId: props.userTasksChapterId,
        answers: answers,
      },
    });

    if (response.success) {
      // Transition to results screen
      showResults.value = true;
      localMode.value = 'review';

      // Emit event to refresh subjects list
      emit('quiz-submitted', response.latestScore, response.latestTotalScore);
    } else {
      throw new Error('Failed to submit quiz');
    }
  } catch (err: any) {
    console.error('Error submitting quiz:', err);
    alert(err.data?.message || err.message || 'Failed to submit quiz');
  } finally {
    isSubmitting.value = false;
  }
};

// Handle close with submission check
const handleClose = () => {
  if (isSubmitting.value) {
    alert('Quiz is being marked. Please wait for the results.');
    return;
  }
  emit('close');
};

// Handle reattempt
const handleReattempt = (chapterId: string) => {
  emit('reattempt', chapterId);
};

// Watch for modal open/close and manage screen state
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset state when modal opens
    showResults.value = props.mode === 'review' || props.mode === 'parent-review';
    localMode.value = props.mode || 'attempt';
    childName.value = '';
    isSubmitting.value = false;
  }
});

// Sync localMode with props.mode changes
watch(() => props.mode, (newMode) => {
  if (newMode) {
    localMode.value = newMode;
  }
}, { immediate: true });
</script>
