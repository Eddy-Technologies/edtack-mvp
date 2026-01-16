<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p class="text-gray-500">Loading quiz questions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
      <UButton
        color="red"
        variant="soft"
        size="sm"
        class="mt-3"
        @click="$emit('close')"
      >
        Close
      </UButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="questions.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-help-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">No questions found for this quiz.</p>
      <UButton
        variant="secondary"
        size="sm"
        class="mt-3"
        @click="$emit('close')"
      >
        Close
      </UButton>
    </div>

    <!-- Quiz Content -->
    <div v-else>
      <p class="text-sm text-gray-500 mb-6">{{ questions.length }} questions</p>

      <!-- Question Navigation Pills -->
      <div class="sticky top-0 z-10 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-sm font-medium text-gray-700">Quick Navigation:</span>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-primary" />
              <span>Answered</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-white border-2 border-gray-300" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(question, index) in questions"
            :key="question.id"
            class="w-10 h-10 rounded-lg font-medium transition-all"
            :class="{
              'bg-primary text-white': userAnswers[index] !== undefined,
              'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:bg-blue-50': userAnswers[index] === undefined
            }"
            @click="scrollToQuestion(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>

      <!-- Quiz Questions -->
      <div class="space-y-6 mb-6">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          :ref="el => { if (el) questionRefs[index] = el as HTMLElement }"
          class="border border-gray-200 rounded-lg p-4 scroll-mt-32"
        >
          <!-- Question Display Component (includes title) -->
          <QuizQuestion
            :question="question"
            :start-playback="() => {}"
            :hide-submit-button="true"
            :disabled="isSubmitting"
            @answer-submitted="handleAnswerSubmit(index, $event)"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <UButton
          variant="secondary"
          :disabled="isSubmitting"
          @click="$emit('close')"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || !allQuestionsAnswered"
          @click="$emit('submit-quiz', userAnswers)"
        >
          {{ isSubmitting ? 'Marking Quiz' : 'Submit Quiz' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import QuizQuestion from '~/components/playback/QuizQuestion.vue';

const props = defineProps<{
  userTasksChapterId?: string;
  chapterDisplayName: string;
  isSubmitting: boolean;
}>();

const _emit = defineEmits<{
  (e: 'submit-quiz', answers: Record<number, any>): void;
  (e: 'close'): void;
}>();

// State
const questions = ref<any[]>([]);
const userAnswers = ref<Record<number, any>>({});
const isLoading = ref(false);
const error = ref<string | null>(null);
const questionRefs = ref<HTMLElement[]>([]);

// Computed
const allQuestionsAnswered = computed(() => {
  return questions.value.length > 0 && questions.value.every((_, index) => userAnswers.value[index] !== undefined);
});

// Methods
const scrollToQuestion = (index: number) => {
  const element = questionRefs.value[index];
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const loadQuestions = async () => {
  if (!props.userTasksChapterId) return;

  isLoading.value = true;
  error.value = null;

  try {
    const response = await $fetch(`/api/quiz/${props.userTasksChapterId}/questions`, {
      method: 'GET',
    });

    if (response.success) {
      questions.value = response.questions || [];
    } else {
      throw new Error('Failed to load questions');
    }
  } catch (err: any) {
    console.error('Error loading quiz questions:', err);
    error.value = err.data?.message || err.message || 'Failed to load quiz questions';
  } finally {
    isLoading.value = false;
  }
};

const handleAnswerSubmit = (questionIndex: number, answer: any) => {
  userAnswers.value[questionIndex] = answer;
};

// Watch for userTasksChapterId changes and load questions
watch(() => props.userTasksChapterId, async (newValue) => {
  if (newValue) {
    // Reset state when chapter changes
    questions.value = [];
    userAnswers.value = {};
    questionRefs.value = [];
    error.value = null;

    await loadQuestions();
  }
}, { immediate: true });
</script>
