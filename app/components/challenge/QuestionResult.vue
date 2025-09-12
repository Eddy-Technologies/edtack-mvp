<template>
  <div ref="content" class="p-5">
    <div class="flex justify-between items-center mb-2">
      <div class="text-primary text-2xl font-bold">Q{{ questionIndex + 1 }}.</div>
      <div
        class="py-1 px-2 rounded-md border-2 shadow-md font-semibold"
        :class="[
          selectedAnswer === question.correctAnswer
            ? 'border-green-600 bg-green-100 text-green-600'
            : selectedAnswer === undefined || selectedAnswer === null
              ? 'border-gray-600 bg-gray-100 text-gray-600'
              : 'border-red-600 bg-red-100 text-red-600',
        ]"
      >
        <p v-if="selectedAnswer === question.correctAnswer">✅</p>
        <p v-else-if="selectedAnswer === undefined || selectedAnswer === null">Not attempted</p>
        <p v-else>❌</p>
      </div>
    </div>

    <p class="text-xl">{{ question.title }}</p>

    <div v-for="(option, index) in question.options" :key="index">
      <div
        class="mt-4 text-xl border-2 p-3 rounded-lg transition-all duration-200"
        :class="[
          // ✅ Selected correct answer (green solid)
          selectedAnswer === option && option === question.correctAnswer
            ? 'bg-green-100 border-green-600 text-green-800 font-bold shadow-lg hover:bg-green-200 hover:shadow-xl '
            : '',

          // ❌ Selected wrong answer (red)
          selectedAnswer === option && option !== question.correctAnswer
            ? 'bg-red-50 border-red-600 text-red-800 font-bold shadow-md hover:bg-red-100 hover:shadow-lg '
            : '',

          // ✅ Correct answer (not selected) – dotted
          selectedAnswer !== option && option === question.correctAnswer
            ? 'bg-green-100 border-dotted border-green-700 text-green-900 font-bold shadow-sm hover:bg-green-200 hover:shadow-md '
            : '',
        ]"
      >
        <span>{{ option }}</span>
      </div>
    </div>

    <p
      v-if="showDebugInfo"
      class="mt-4 p-4 rounded-lg text-lg font-medium bg-green-50 border-2 border-green-500 text-green-900"
    >
      <strong>Correct Answer:</strong> {{ question.correctAnswer }}
    </p>

    <div
      v-if="selectedAnswer !== question.correctAnswer"
      ref="explanation"
      class="mt-4 p-4 rounded-lg text-lg font-medium bg-yellow-50 border-2 border-yellow-500 text-yellow-800"
    >
      <p><strong>Explanation:</strong> {{ question.explanation }}</p>
      <UButton
        v-if="!showChatPanel"
        class="mt-4 px-3 py-1 text-sm rounded bg-primary hover:bg-gray-300 transition"
        @click="showChatPanel = true"
      >
        Talk to Eddy
      </UButton>
    </div>

    <ChatPanel v-if="showChatPanel" :question="question" class="mt-4" />

    <UButton
      class="mt-4 px-3 py-1 text-sm rounded bg-red-400 hover:bg-red-300 transition"
      @click="openReportModal"
    >
      Report Error
    </UButton>

    <ReportErrorModal
      :show-report-modal="showReport"
      :question="question"
      :selected-answer="selectedAnswer"
      @close="showReport = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import 'katex/dist/katex.min.css';
import { renderMath } from '~/utils/katexUtils.js';
import ReportErrorModal from '~/components/report/ReportErrorModal.vue';

const props = defineProps({
  question: Object,
  questionIndex: Number,
  selectedAnswer: String,
});

const showDebugInfo = ref(false);
const showReport = ref(false);
const showChatPanel = ref(false);
const content = ref(null);

function openReportModal() {
  showReport.value = true;
}

onMounted(() => {
  if (props.question && props.question.title) {
    renderMath(content.value);
  }
});
</script>
