<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ showResults ? 'Quiz Results' : chapterDisplayName }}
            </h2>
            <p v-if="!isLoading && !showResults && questions.length > 0" class="text-sm text-gray-500 mt-1">
              {{ questions.length }} questions
            </p>
            <p v-if="showResults" class="text-sm text-gray-500 mt-1">
              {{ chapterDisplayName }}
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

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

        <!-- Results View -->
        <div v-else-if="showResults && quizResults" class="space-y-6">
          <!-- Overall Score Card -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div class="text-center mb-4">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
              <div class="text-5xl font-bold mb-2" :class="quizResults.passedThreshold ? 'text-green-600' : 'text-orange-600'">
                {{ quizResults.percentage }}%
              </div>
              <p class="text-gray-600 mb-1">
                Score: {{ quizResults.score }} / {{ quizResults.totalScore }} points
              </p>
              <p class="text-sm text-gray-500">
                Required: {{ quizResults.requiredScore }}%
              </p>
            </div>

            <!-- Pass/Fail Badge -->
            <div class="flex justify-center mb-4">
              <span v-if="quizResults.passedThreshold" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 mr-2" />
                Passed!
              </span>
              <span v-else class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 mr-2" />
                Did not meet threshold
              </span>
            </div>

            <!-- Credits Earned -->
            <div v-if="quizResults.creditEarned > 0" class="text-center p-4 bg-white rounded-lg border border-green-200">
              <UIcon name="i-lucide-coins" class="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p class="font-semibold text-gray-900">Credits Earned!</p>
              <p class="text-2xl font-bold text-green-600">{{ (quizResults.creditEarned / 100).toFixed(2) }} SGD</p>
            </div>
          </div>

          <!-- Question-by-Question Results -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">Question Review</h4>

            <div
              v-for="(result, index) in quizResults.results"
              :key="result.questionId"
              class="border rounded-lg p-4"
              :class="result.isCorrect ? 'border-green-200 bg-green-50' : result.feedback.includes('manual grading') ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-start flex-1">
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-medium mr-3 flex-shrink-0"
                    :class="result.isCorrect ? 'bg-green-500' : result.feedback.includes('manual grading') ? 'bg-yellow-500' : 'bg-red-500'"
                  >
                    {{ index + 1 }}
                  </span>
                  <div class="flex-1">
                    <h5 class="font-medium text-gray-900">{{ questions[index]?.title }}</h5>
                    <p class="text-sm text-gray-600 mt-1">{{ questions[index]?.content }}</p>
                  </div>
                </div>
                <div class="ml-4">
                  <UIcon v-if="result.isCorrect" name="i-lucide-check-circle" class="w-6 h-6 text-green-600" />
                  <UIcon v-else-if="result.feedback.includes('manual grading')" name="i-lucide-clock" class="w-6 h-6 text-yellow-600" />
                  <UIcon v-else name="i-lucide-x-circle" class="w-6 h-6 text-red-600" />
                </div>
              </div>

              <!-- Feedback -->
              <div class="ml-9 mb-2">
                <p class="text-sm font-medium" :class="result.isCorrect ? 'text-green-700' : result.feedback.includes('manual grading') ? 'text-yellow-700' : 'text-red-700'">
                  {{ result.feedback }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Points: {{ result.pointsEarned }} / {{ result.pointsPossible }}
                </p>
              </div>

              <!-- User's Answer -->
              <div v-if="result.userAnswers && result.userAnswers.length > 0" class="ml-9 mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                <h6 class="text-sm font-semibold text-gray-700 mb-1">Your Answer:</h6>

                <!-- MCQ Answer -->
                <div v-if="result.questionType === 'mcq'" class="text-sm text-gray-600">
                  <ul class="list-disc list-inside">
                    <li v-for="(answer, idx) in result.userAnswers" :key="idx">
                      {{ answer.option_text }}
                    </li>
                  </ul>
                </div>

                <!-- Boolean Answer -->
                <div v-else-if="result.questionType === 'boolean'" class="text-sm text-gray-600">
                  {{ result.userAnswers[0].answer_boolean ? 'True' : 'False' }}
                </div>

                <!-- Fill/Open Answer -->
                <div v-else-if="result.questionType === 'fill' || result.questionType === 'open'" class="text-sm text-gray-600">
                  <div v-if="result.userAnswers.length === 1">
                    {{ result.userAnswers[0].answer_text }}
                  </div>
                  <ol v-else class="list-decimal list-inside">
                    <li v-for="(answer, idx) in result.userAnswers" :key="idx">
                      {{ answer.answer_text }}
                    </li>
                  </ol>
                </div>

                <!-- Draw Answer -->
                <div v-else-if="result.questionType === 'draw'" class="text-sm text-gray-600">
                  <img
                    v-if="result.userAnswers[0].answer_draw_file"
                    :src="result.userAnswers[0].answer_draw_file"
                    alt="Your drawing"
                    class="max-w-xs h-auto rounded border border-gray-300 mt-2"
                  >
                  <p v-else class="text-gray-400 italic">No drawing submitted</p>
                </div>
              </div>

              <!-- Explanation -->
              <div v-if="questions[index]?.explanation" class="ml-9 mt-3 p-3 bg-white rounded border border-gray-200">
                <h6 class="text-sm font-semibold text-gray-700 mb-1">Explanation:</h6>
                <p class="text-sm text-gray-600">{{ questions[index].explanation }}</p>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <div class="flex justify-center pt-4 border-t">
            <UButton
              color="primary"
              size="lg"
              @click="$emit('close')"
            >
              Close
            </UButton>
          </div>
        </div>

        <!-- Quiz Content -->
        <div v-else-if="questions.length > 0 && !showResults">
          <!-- Quiz Questions -->
          <div class="space-y-6 mb-6">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start mb-3">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-medium mr-3 flex-shrink-0">
                  {{ index + 1 }}
                </span>
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ question.title }}</h3>
                </div>
              </div>

              <!-- Question Display Component -->
              <QuizQuestion
                :question="question"
                :start-playback="() => {}"
                :hide-submit-button="true"
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
              @click="submitQuiz"
            >
              Submit Quiz
            </UButton>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import QuizQuestion from '~/components/playback/QuizQuestion.vue';

const props = defineProps<{
  isOpen: boolean;
  userTasksChapterId: string;
  chapterDisplayName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'quiz-submitted', score: number, totalScore: number): void;
}>();

// State
const questions = ref<any[]>([]);
const userAnswers = ref<Record<number, any>>({});
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);
const showResults = ref(false);
const quizResults = ref<any>(null);

// Computed
const allQuestionsAnswered = computed(() => {
  return questions.value.length > 0 && questions.value.every((_, index) => userAnswers.value[index] !== undefined);
});

// Methods
const loadQuestions = async () => {
  if (!props.userTasksChapterId) return;

  isLoading.value = true;
  error.value = null;

  try {
    // First check if quiz is already completed
    const resultsResponse = await $fetch(`/api/quiz/${props.userTasksChapterId}/results`, {
      method: 'GET',
    });

    if (resultsResponse.isCompleted) {
      // Quiz is completed - show results view
      questions.value = resultsResponse.questions || [];
      quizResults.value = resultsResponse;
      showResults.value = true;
      console.log('Loading completed quiz results');
      return;
    }

    // Quiz not completed - load questions for attempt
    const response = await $fetch(`/api/quiz/${props.userTasksChapterId}/questions`, {
      method: 'GET',
    });

    if (response.success) {
      // Transform database field names to match QuizQuestion component expectations
      questions.value = (response.questions || []).map((q: any) => ({
        ...q,
        question_type: q.type, // type → question_type
        content: q.question, // question → content
        options: q.question_options, // question_options → options
        answer: q.question_correct_answers, // question_correct_answers → answer
      }));
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

const submitQuiz = async () => {
  if (!allQuestionsAnswered.value) return;

  isSubmitting.value = true;

  try {
    const response = await $fetch('/api/quiz/attempt', {
      method: 'POST',
      body: {
        userTasksChapterId: props.userTasksChapterId,
        answers: userAnswers.value,
      },
    });

    if (response.success) {
      // Store results and show results view
      quizResults.value = response;
      showResults.value = true;

      // Emit event to refresh subjects list
      emit('quiz-submitted', response.score, response.totalScore);
    } else {
      throw new Error('Failed to submit quiz');
    }
  } catch (err: any) {
    console.error('Error submitting quiz:', err);
    error.value = err.data?.message || err.message || 'Failed to submit quiz';
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for modal open/close
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset state when modal opens
    questions.value = [];
    userAnswers.value = {};
    error.value = null;
    showResults.value = false;
    quizResults.value = null;
    // Load questions
    loadQuestions();
  }
});
</script>
