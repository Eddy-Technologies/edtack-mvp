<template>
  <div class="min-w-0 text-left">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2 whitespace-pre-wrap">
        {{ displayedTitle }}
      </h3>
      <div class="mb-4" v-html="processedContentHtml" />
    </div>

    <!-- Question Type Specific UI -->
    <div class="space-y-4">
      <!-- MCQ Questions -->
      <div v-if="question.question_type === 'mcq'" class="space-y-3">
        <div
          v-for="option in question.options"
          :key="option.id"
          class="flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer"
          :class="{
            'bg-blue-50 border-blue-500': isSelected(option.id),
            'hover:bg-blue-50 hover:border-blue-300 border-gray-200': !isSelected(option.id)
          }"
          @click="selectMCQOption(option.id)"
        >
          <input
            type="radio"
            :value="option.id"
            :name="`question-${question.id}`"
            :checked="isSelected(option.id)"
            class="appearance-none w-4 h-4 rounded border-2 border-current grid place-content-center relative before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:scale-0 checked:before:scale-100 transition-transform"
            @change="selectMCQOption(option.id)"
          >
          <div v-if="option.option_text" class="flex-1">{{ option.option_text }}</div>
          <img
            v-if="option.imageUrl"
            :src="option.imageUrl"
            alt="Option image"
            class="max-w-32 h-auto rounded"
          >
        </div>
      </div>

      <!-- Open Questions -->
      <div v-if="question.question_type === 'open'" class="space-y-3">
        <textarea
          v-model="userAnswer"
          class="w-full p-3 border-2 border-gray-200 rounded-lg resize-y min-h-24 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your answer here..."
          rows="4"
        />
      </div>

      <!-- Fill Questions -->
      <div v-if="question.question_type === 'fill'" class="space-y-3">
        <div v-if="question.answer.length === 1">
          <input
            v-model="userAnswer"
            type="text"
            class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Fill in the blank..."
          >
        </div>
        <div v-else class="space-y-2">
          <div v-for="(answer, index) in question.answer" :key="answer.id" class="flex items-center gap-2">
            <span class="font-medium">{{ index + 1 }}.</span>
            <input
              v-model="fillAnswers[index]"
              type="text"
              class="flex-1 p-2 border-2 border-gray-200 rounded focus:border-blue-500 focus:outline-none"
              :placeholder="`Answer ${index + 1}...`"
            >
          </div>
        </div>
      </div>

      <!-- Boolean Questions -->
      <div v-if="question.question_type === 'boolean'" class="flex gap-4">
        <button
          class="flex-1 p-3 rounded-lg border-2 font-medium transition-all"
          :class="{
            'bg-green-50 border-green-500 text-green-700': userAnswer === 'true',
            'hover:bg-green-50 hover:border-green-300 border-gray-200': userAnswer !== 'true'
          }"
          @click="selectBoolean(true)"
        >
          True
        </button>
        <button
          class="flex-1 p-3 rounded-lg border-2 font-medium transition-all"
          :class="{
            'bg-red-50 border-red-500 text-red-700': userAnswer === 'false',
            'hover:bg-red-50 hover:border-red-300 border-gray-200': userAnswer !== 'false'
          }"
          @click="selectBoolean(false)"
        >
          False
        </button>
      </div>

      <!-- Draw Questions -->
      <div v-if="question.question_type === 'draw'" class="space-y-3">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div v-if="!drawingFile">
            <p class="text-gray-500 mb-4">Draw your answer or upload an image</p>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileUpload"
            >
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="$refs.fileInput.click()"
            >
              Upload Image
            </button>
          </div>
          <div v-else>
            <img :src="drawingFile" alt="Uploaded drawing" class="max-w-full h-auto rounded mb-2">
            <button
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              @click="clearDrawing"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center mt-6">
        <Button
          variant="primary"
          :disabled="!hasAnswer"
          @click="submitAnswer"
        >
          Submit Answer
        </Button>
      </div>

      <!-- Explanation (shown after submission) -->
      <div v-if="showExplanation && question.explanation" class="mt-6 p-4 rounded-lg" :class="isCorrect ? 'bg-green-100' : 'bg-red-200'">
        <h4 class="font-semibold mb-2">Explanation:</h4>
        <div v-html="processedExplanationHtml" />
        <div v-if="isCorrect !== undefined" class="mt-3 flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="isCorrect ? 'bg-green-300 text-green-800' : 'bg-red-300 text-red-800'"
          >
            {{ isCorrect ? 'Correct!' : 'Incorrect' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QuizQuestion } from '~/types/quiz.types';
import Button from '~/components/common/Button.vue';

const props = defineProps<{
  question: QuizQuestion;
  startPlayback: boolean;
}>();

const emit = defineEmits(['finish', 'answer-submitted']);

const displayedTitle = ref((props.question.part_label ? `${props.question.part_label} ` : '') + props.question.title);
const userAnswer = ref('');
const selectedOptions = ref<string[]>([]);
const fillAnswers = ref<string[]>(new Array(props.question.answer.length).fill(''));
const drawingFile = ref<string | null>(null);
const showExplanation = ref(false);
const isCorrect = ref<boolean | undefined>(undefined);

const processedContentHtml = computed(() => convertImages(props.question.content || ''));
const processedExplanationHtml = computed(() => convertImages(props.question.explanation || ''));

const hasAnswer = computed(() => {
  switch (props.question.question_type) {
    case 'mcq':
      return selectedOptions.value.length > 0;
    case 'open':
      return userAnswer.value.trim().length > 0;
    case 'fill':
      if (props.question.answer.length === 1) {
        return userAnswer.value.trim().length > 0;
      }
      return fillAnswers.value.every((answer) => answer.trim().length > 0);
    case 'boolean':
      return userAnswer.value !== '';
    case 'draw':
      return drawingFile.value !== null;
    default:
      return false;
  }
});

function convertImages(raw: string) {
  return raw.replace(
    /&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g,
    '<img src="$1" alt="Question image" class="my-2 max-w-full rounded-md"/>'
  );
}

function isSelected(optionId: string) {
  return selectedOptions.value.includes(optionId);
}

function selectMCQOption(optionId: string) {
  selectedOptions.value = [optionId];
}

function selectBoolean(value: boolean) {
  userAnswer.value = value.toString();
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      drawingFile.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function clearDrawing() {
  drawingFile.value = null;
}

function submitAnswer() {
  let userAnswers: string[] = [];

  switch (props.question.question_type) {
    case 'mcq':
      userAnswers = selectedOptions.value;
      break;
    case 'open':
      userAnswers = [userAnswer.value.trim()];
      break;
    case 'fill':
      if (props.question.answer.length === 1) {
        userAnswers = [userAnswer.value.trim()];
      } else {
        userAnswers = fillAnswers.value.map((a) => a.trim());
      }
      break;
    case 'boolean':
      userAnswers = [userAnswer.value];
      break;
    case 'draw':
      userAnswers = [drawingFile.value || ''];
      break;
  }

  isCorrect.value = checkAnswer(userAnswers);
  showExplanation.value = true;

  emit('answer-submitted', {
    questionId: props.question.id,
    answers: userAnswers,
    isCorrect: isCorrect.value
  });
}

function checkAnswer(userAnswers: string[]): boolean {
  const correctAnswers = props.question.answer;

  switch (props.question.question_type) {
    case 'mcq': {
      const correctOptionIds = correctAnswers.map((a) => a.option_id).filter(Boolean);
      return correctOptionIds.every((id) => userAnswers.includes(id)) &&
        userAnswers.every((id) => correctOptionIds.includes(id));
    }
    case 'boolean': {
      const correctBoolean = correctAnswers[0]?.answer_boolean;
      return userAnswers[0] === correctBoolean?.toString();
    }
    case 'open':
    case 'fill': {
      const correctTexts = correctAnswers.map((a) => a.answer_text?.toLowerCase().trim()).filter(Boolean);
      const userTexts = userAnswers.map((a) => a.toLowerCase().trim());
      return correctTexts.every((correct, index) => userTexts[index] === correct);
    }
    case 'draw':
      return true;

    default:
      return false;
  }
}

// Initialize fillAnswers on component setup
fillAnswers.value = new Array(props.question.answer.length).fill('');

// Emit finish immediately when component is mounted
onMounted(() => {
  emit('finish');
});
</script>
