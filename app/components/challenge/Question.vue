<template>
  <div ref="content" class="question">
    <span class="text-primary font-bold text-2xl">Q{{ questionIndex + 1 }}.</span>
    <p class="text-xl mt-2">{{ question.title }}</p>

    <div v-for="(option, index) in question.options" :key="index">
      <label
        class="flex items-center gap-3 text-xl mt-4 p-4 rounded-lg border-2 transition-all cursor-pointer"
        :class="{
          'bg-blue-50 border-emerald-500 dark:bg-gray-800 dark:border-emerald-500': selectedAnswer === option,
          'hover:bg-blue-50 hover:border-emerald-500 dark:hover:bg-gray-800 dark:hover:border-gray-500': selectedAnswer !== option
        }"
      >
        <input
          type="radio"
          :value="option"
          :name="'question-' + questionIndex"
          :checked="selectedAnswer === option"
          class="appearance-none w-5 flex-shrink-0 h-5 rounded border-2 border-current grid place-content-center relative
                    before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-emerald-500 before:scale-0
                    checked:before:scale-100 transition-transform before:transition-transform before:duration-150"
          @change="selectAnswer(option)"
        >
        <span>{{ option }}</span>
      </label>
    </div>

    <UButton
      class="mt-4 px-3 py-1 text-sm bg-red-400 dark:bg-red-700 rounded hover:bg-red-300 dark:hover:bg-red-600 transition"
      @click="openReportModal"
    >
      Report Error
    </UButton>

    <ReportErrorModal
      :show-report-modal="showReport"
      :question="question"
      :selected-answer="null"
      @close="showReport = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import 'katex/dist/katex.min.css';
import { renderMath } from '../../utils/katexUtils.js';
import ReportErrorModal from '~/components/report/ReportErrorModal.vue';

const props = defineProps<{
  question: any;
  questionIndex: number;
  selectedAnswer: string;
}>();

const showReport = ref(false);
const content = ref<HTMLElement | null>(null);
const emit = defineEmits(['answer-selected']);

function selectAnswer(answer: string) {
  emit('answer-selected', answer);
}

function openReportModal() {
  showReport.value = true;
}

onMounted(() => {
  if (props.question?.title) {
    renderMath(content.value);
  }
});

watch(() => props.question, () => {
  if (props.question?.title) {
    renderMath(content.value);
  }
});
</script>
