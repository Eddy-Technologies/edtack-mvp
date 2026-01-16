<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p class="text-gray-500">Loading quiz results...</p>
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
    <div v-else-if="quizResults" class="space-y-6">
      <p class="text-sm text-gray-500">{{ chapterDisplayName }}</p>

      <!-- Overall Score Card -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <!-- Score Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div class="text-center p-3 sm:p-4 bg-white rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Latest Attempt</p>
            <div class="text-2xl sm:text-3xl font-bold" :class="(quizResults.latestPercentage ?? 0) >= quizResults.requiredScore ? 'text-green-600' : 'text-orange-600'">
              {{ quizResults.latestPercentage ?? 0 }}%
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ quizResults.latestScore ?? 0 }} / {{ quizResults.latestTotalScore ?? 0 }}
            </p>
          </div>

          <div class="text-center p-3 sm:p-4 bg-white rounded-lg border-2 border-blue-300">
            <p class="text-sm text-gray-600 mb-1">Best Score</p>
            <div class="text-2xl sm:text-3xl font-bold text-blue-600">
              {{ quizResults.bestPercentage }}%
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ quizResults.bestScore }} / {{ quizResults.bestTotalScore }}
            </p>
          </div>

          <div class="text-center p-3 sm:p-4 bg-white rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Required</p>
            <div class="text-2xl sm:text-3xl font-bold text-gray-700">
              {{ quizResults.requiredScore }}%
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Attempts: {{ quizResults.attemptCount || 1 }}
            </p>
          </div>
        </div>

        <!-- Pass/Fail Badge -->
        <div class="flex justify-center mb-4">
          <span v-if="quizResults.passedThreshold" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 mr-2" />
            Passed! (Best Score)
          </span>
          <span v-else class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            <UIcon name="i-lucide-x-circle" class="w-5 h-5 mr-2" />
            Keep trying!
          </span>
        </div>

        <!-- Credits Status -->
        <div class="text-center p-4 bg-white rounded-lg border" :class="quizResults.creditDisbursed ? 'border-green-200' : 'border-yellow-200'">
          <UIcon :name="quizResults.creditDisbursed ? 'i-lucide-check-circle' : 'i-lucide-coins'" class="w-6 h-6 mx-auto mb-2" :class="quizResults.creditDisbursed ? 'text-green-500' : 'text-yellow-500'" />
          <p class="font-semibold text-gray-900">
            {{ quizResults.creditDisbursed ? 'Credits Earned!' : (quizResults.creditReward > 0 ? 'Credits Pending' : 'No Credits') }}
          </p>
          <p v-if="quizResults.creditDisbursed" class="text-2xl font-bold text-green-600">
            {{ quizResults.creditEarned }} Credits
          </p>
          <p v-else-if="quizResults.creditReward > 0" class="text-sm text-gray-600 mt-1">
            Reach {{ quizResults.requiredScore }}% to earn {{ quizResults.creditReward }} Credits.
          </p>
        </div>

        <!-- Attempt History -->
        <div v-if="quizResults.attempts && quizResults.attempts.length > 1" class="mt-4 p-4 bg-white rounded-lg">
          <h5 class="text-sm font-medium text-gray-700 mb-3">Attempt History</h5>
          <div class="space-y-2">
            <div
              v-for="attempt in quizResults.attempts"
              :key="attempt.attemptNumber"
              class="flex items-center justify-between text-sm p-2 rounded"
              :class="{
                'bg-blue-50 border border-blue-200': attempt.percentage === quizResults.bestPercentage,
                'bg-gray-50': attempt.percentage !== quizResults.bestPercentage
              }"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">Attempt {{ attempt.attemptNumber }}</span>
                <span v-if="attempt.percentage === quizResults.bestPercentage" class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  ⭐ Best
                </span>
                <span v-if="attempt.attemptNumber === quizResults.attemptCount" class="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                  📍 Latest
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-semibold" :class="attempt.percentage >= quizResults.requiredScore ? 'text-green-600' : 'text-gray-700'">
                  {{ attempt.percentage }}%
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(attempt.submittedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question-by-Question Results -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900">Question Review</h4>

        <div
          v-for="(result, index) in quizResults.results"
          :key="result.questionId"
          class="border rounded-lg p-4"
          :class="{
            'border-green-200 bg-green-50': result.markingStatus === MARKING_STATUS.CORRECT,
            'border-amber-200 bg-amber-50': result.markingStatus === MARKING_STATUS.PARTIALLY_CORRECT,
            'border-red-200 bg-red-50': result.markingStatus === MARKING_STATUS.INCORRECT,
            'border-gray-200 bg-gray-50': !result.markingStatus
          }"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start flex-1">
              <span
                class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-medium mr-3 flex-shrink-0"
                :class="{
                  'bg-green-500': result.markingStatus === MARKING_STATUS.CORRECT,
                  'bg-amber-500': result.markingStatus === MARKING_STATUS.PARTIALLY_CORRECT,
                  'bg-red-500': result.markingStatus === MARKING_STATUS.INCORRECT,
                  'bg-gray-500': !result.markingStatus
                }"
              >
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <h5 class="font-medium text-gray-900">{{ questions[index]?.title }}</h5>
                <p class="text-sm text-gray-600 mt-1">{{ questions[index]?.content }}</p>
              </div>
            </div>
            <div class="ml-4">
              <UIcon v-if="result.markingStatus === 'CORRECT'" name="i-lucide-check-circle" class="w-6 h-6 text-green-600" />
              <UIcon v-else-if="result.markingStatus === 'PARTIALLY_CORRECT'" name="i-lucide-alert-circle" class="w-6 h-6 text-amber-600" />
              <UIcon v-else-if="result.markingStatus === 'INCORRECT'" name="i-lucide-x-circle" class="w-6 h-6 text-red-600" />
              <UIcon v-else name="i-lucide-clock" class="w-6 h-6 text-gray-600" />
            </div>
          </div>

          <!-- Feedback -->
          <div class="ml-9 mb-2">
            <!-- Simple feedback for MCQ/Boolean -->
            <p
              v-if="!result.feedbackPositive && !result.feedbackGaps && !result.feedbackImprovement"
              class="text-sm font-medium"
              :class="{
                'text-green-700': result.markingStatus === MARKING_STATUS.CORRECT,
                'text-amber-700': result.markingStatus === MARKING_STATUS.PARTIALLY_CORRECT,
                'text-red-700': result.markingStatus === MARKING_STATUS.INCORRECT,
                'text-gray-700': !result.markingStatus
              }"
            >
              {{ result.feedback }}
            </p>

            <!-- Detailed marking feedback for Open/Fill/Draw -->
            <div v-else-if="result.feedbackPositive || result.feedbackGaps || result.feedbackImprovement" class="space-y-2">
              <!-- Positive Feedback -->
              <div v-if="result.feedbackPositive" class="p-2 bg-green-50 border border-green-200 rounded">
                <p class="text-xs font-semibold text-green-800 mb-1">What you did well:</p>
                <p class="text-sm text-green-700">{{ result.feedbackPositive }}</p>
              </div>

              <!-- Knowledge Gaps -->
              <div v-if="result.feedbackGaps" class="p-2 bg-orange-50 border border-orange-200 rounded">
                <p class="text-xs font-semibold text-orange-800 mb-1">Areas to review:</p>
                <p class="text-sm text-orange-700">{{ result.feedbackGaps }}</p>
              </div>

              <!-- Improvement Suggestions -->
              <div v-if="result.feedbackImprovement" class="p-2 bg-blue-50 border border-blue-200 rounded">
                <p class="text-xs font-semibold text-blue-800 mb-1">How to improve:</p>
                <p class="text-sm text-blue-700">{{ result.feedbackImprovement }}</p>
              </div>

              <!-- Key Concepts -->
              <div v-if="result.keyConcepts && result.keyConcepts.length > 0" class="p-2 bg-purple-50 border border-purple-200 rounded">
                <p class="text-xs font-semibold text-purple-800 mb-1">Concepts assessed:</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="concept in result.keyConcepts"
                    :key="concept"
                    class="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                  >
                    {{ concept }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-2">
              Points: {{ result.pointsEarned }} / {{ result.pointsPossible }}
            </p>
          </div>

          <!-- User's Answer -->
          <div v-if="result.userAnswers && result.userAnswers.length > 0" class="ml-9 mb-3 p-3 bg-gray-50 rounded border border-gray-200">
            <h6 class="text-sm font-semibold text-gray-700 mb-1">Your Answer:</h6>

            <!-- MCQ Answer -->
            <div v-if="result.questionType === QUESTION_TYPE.MCQ" class="space-y-2">
              <div
                v-for="option in questions[index].options"
                :key="option.id"
                class="flex items-start gap-3 p-3 rounded-lg border"
                :class="getOptionClasses(option.id, questions[index], result)"
              >
                <!-- Checkbox/Radio Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <UIcon
                    :name="getOptionIcon(option.id, questions[index], result)"
                    class="w-5 h-5"
                    :class="getOptionIconColor(option.id, questions[index], result)"
                  />
                </div>

                <!-- Option Content -->
                <div class="flex-1">
                  <!-- Option Text -->
                  <div class="text-sm" :class="getOptionTextColor(option.id, questions[index], result)">
                    {{ option.option_text }}
                  </div>

                  <!-- Option Image (if available) -->
                  <img
                    v-if="option.imageUrl"
                    :src="option.imageUrl"
                    alt="Option image"
                    class="mt-2 max-w-xs rounded border"
                  >
                </div>

                <!-- Status Badge -->
                <div class="flex-shrink-0">
                  <span
                    v-if="isUserSelection(option.id, result)"
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="isCorrectOption(option.id, questions[index]) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ isCorrectOption(option.id, questions[index]) ? 'Your answer ✓' : 'Your answer ✗' }}
                  </span>
                  <span
                    v-else-if="isCorrectOption(option.id, questions[index])"
                    class="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700"
                  >
                    Correct answer
                  </span>
                </div>
              </div>
            </div>

            <!-- Boolean Answer -->
            <div v-else-if="result.questionType === QUESTION_TYPE.BOOLEAN" class="text-sm text-gray-600">
              {{ result.userAnswers[0].answer_boolean ? 'True' : 'False' }}
            </div>

            <!-- Fill/Open Answer -->
            <div v-else-if="result.questionType === QUESTION_TYPE.FILL || result.questionType === QUESTION_TYPE.OPEN" class="text-sm text-gray-600">
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
            <div v-else-if="result.questionType === QUESTION_TYPE.DRAW" class="text-sm text-gray-600">
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
            <h6 class="text-sm font-semibold text-gray-700 mb-2">Explanation:</h6>
            <div v-if="explanationBodies[index]" class="prose prose-sm max-w-none prose-slate">
              <MDCRenderer :body="explanationBodies[index]" tag="div" />
            </div>
            <p v-else class="text-sm text-gray-600">{{ questions[index].explanation }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-4 border-t">
        <UButton
          color="gray"
          variant="outline"
          size="lg"
          @click="$emit('close')"
        >
          Close
        </UButton>
        <UButton
          v-if="mode === 'review'"
          color="primary"
          size="lg"
          @click="$emit('reattempt', userTasksChapterId)"
        >
          <UIcon name="i-lucide-refresh-cw" class="w-5 h-5" />
          Reattempt Quiz
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import { MARKING_STATUS, QUESTION_TYPE } from '~~/shared/constants';

const { formatDate } = useDateFormat();

const props = defineProps<{
  userTasksChapterId?: string;
  chapterDisplayName: string;
  mode: 'review' | 'parent-review';
  assigneeUserInfoId?: string; // For parent-review mode
}>();

const _emit = defineEmits<{
  (e: 'reattempt', chapterId: string): void;
  (e: 'close'): void;
}>();

// State
const quizResults = ref<any>(null);
const questions = ref<any[]>([]);
const explanationBodies = ref<Record<number, any>>({});
const isLoading = ref(false);
const error = ref<string | null>(null);

// Helper function to parse explanations as markdown
const formatQuestionExplanation = async (explanation: string) => {
  if (!explanation) return null;

  try {
    const parsed = await parseMarkdown(explanation);
    return parsed?.body;
  } catch (e) {
    console.error('Error parsing explanation:', e);
    return null;
  }
};

// Watch questions and parse explanations
watch(questions, async (newQuestions) => {
  if (!newQuestions || newQuestions.length === 0) return;

  for (let i = 0; i < newQuestions.length; i++) {
    if (newQuestions[i]?.explanation) {
      explanationBodies.value[i] = await formatQuestionExplanation(newQuestions[i].explanation);
    }
  }
}, { immediate: true });

const loadResults = async () => {
  if (!props.userTasksChapterId) return;

  isLoading.value = true;
  error.value = null;

  try {
    let resultsResponse;

    // Use different endpoint for parent review mode
    if (props.mode === 'parent-review' && props.assigneeUserInfoId) {
      resultsResponse = await $fetch(`/api/quiz/${props.userTasksChapterId}/attempts/${props.assigneeUserInfoId}`, {
        method: 'GET',
      });
    } else {
      resultsResponse = await $fetch(`/api/quiz/${props.userTasksChapterId}/results`, {
        method: 'GET',
      });
    }

    if (resultsResponse.isCompleted) {
      questions.value = resultsResponse.questions || [];
      quizResults.value = resultsResponse;
    } else {
      error.value = 'Quiz has not been completed yet';
    }
  } catch (err: any) {
    console.error('Error loading quiz results:', err);
    error.value = err.data?.message || err.message || 'Failed to load quiz results';
  } finally {
    isLoading.value = false;
  }
};

// Helper methods for MCQ options display
const isUserSelection = (optionId: string, result: any): boolean => {
  return result.userAnswers?.some((answer: any) => answer.option_id === optionId) || false;
};

const isCorrectOption = (optionId: string, question: any): boolean => {
  return question.answer?.some((ans: any) => ans.option_id === optionId) || false;
};

const getOptionClasses = (optionId: string, question: any, result: any): string => {
  const isSelected = isUserSelection(optionId, result);
  const isCorrect = isCorrectOption(optionId, question);

  if (isSelected && isCorrect) {
    return 'border-green-300 bg-green-50';
  } else if (isSelected && !isCorrect) {
    return 'border-red-300 bg-red-50';
  } else if (isCorrect) {
    return 'border-blue-200 bg-blue-50';
  } else {
    return 'border-gray-200 bg-gray-50';
  }
};

const getOptionIcon = (optionId: string, question: any, result: any): string => {
  const isSelected = isUserSelection(optionId, result);
  const isCorrect = isCorrectOption(optionId, question);

  if (isSelected && isCorrect) {
    return 'i-lucide-check-circle';
  } else if (isSelected && !isCorrect) {
    return 'i-lucide-x-circle';
  } else if (isCorrect) {
    return 'i-lucide-check';
  } else {
    return 'i-lucide-circle';
  }
};

const getOptionIconColor = (optionId: string, question: any, result: any): string => {
  const isSelected = isUserSelection(optionId, result);
  const isCorrect = isCorrectOption(optionId, question);

  if (isSelected && isCorrect) {
    return 'text-green-600';
  } else if (isSelected && !isCorrect) {
    return 'text-red-600';
  } else if (isCorrect) {
    return 'text-blue-600';
  } else {
    return 'text-gray-400';
  }
};

const getOptionTextColor = (optionId: string, question: any, result: any): string => {
  const isSelected = isUserSelection(optionId, result);
  const isCorrect = isCorrectOption(optionId, question);

  if (isSelected && isCorrect) {
    return 'text-green-900 font-medium';
  } else if (isSelected && !isCorrect) {
    return 'text-red-900 font-medium';
  } else if (isCorrect) {
    return 'text-blue-900 font-medium';
  } else {
    return 'text-gray-700';
  }
};

// Watch for userTasksChapterId changes and load results
watch(() => props.userTasksChapterId, async (newValue) => {
  if (newValue) {
    // Reset state when chapter changes
    quizResults.value = null;
    questions.value = [];
    explanationBodies.value = {};
    error.value = null;

    await loadResults();
  }
}, { immediate: true });
</script>
