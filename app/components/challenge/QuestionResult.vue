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
            : 'border-red-600 bg-red-100 text-red-600'
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
          ? 'bg-[#d0f6d6] border-[#00a152] text-[#007e33] font-bold shadow-[0_0_14px_rgba(0,161,82,0.3)] hover:bg-[#9ddb8f] hover:shadow-[0_0_22px_rgba(0,161,82,0.5)] dark:bg-[#1b5e20] dark:text-[#a5d6a7] dark:border-[#00e676] dark:hover:bg-[#238c4b] dark:hover:shadow-[0_0_18px_rgba(0,230,118,0.7)]'
          : '',

        // ❌ Selected wrong answer (red)
        selectedAnswer === option && option !== question.correctAnswer
          ? 'bg-[#ffebee] border-[#d32f2f] text-[#b71c1c] font-bold shadow-[0_0_8px_rgba(211,47,47,0.2)] hover:bg-[#ffcdd2] hover:shadow-[0_0_12px_rgba(211,47,47,0.4)] dark:bg-[#b71c1c] dark:text-[#ffcdd2] dark:border-[#ef5350] dark:hover:bg-[#ef9a9a] dark:hover:shadow-[0_0_14px_rgba(239,83,80,0.7)]'
          : '',

        // ✅ Correct answer (not selected) – dotted
        selectedAnswer !== option && option === question.correctAnswer
          ? 'bg-[#c8e6ce] border-dotted border-[#388e3c] text-[#1b5e20] font-bold shadow-[0_0_6px_rgba(56,142,60,0.15)] hover:bg-[#a2d190] hover:shadow-[0_0_12px_rgba(56,142,60,0.35)] dark:bg-[#1b5e20] dark:text-[#a5d6a7] dark:border-[#00e676] dark:shadow-[0_0_8px_rgba(0,230,118,0.5)] dark:hover:bg-[#238c4b] dark:hover:shadow-[0_0_14px_rgba(0,230,118,0.6)]'
          : ''
      ]"
      >
        <span>{{ option }}</span>
      </div>
    </div>

    <p v-if="showDebugInfo" class="mt-4 p-4 rounded-lg text-lg font-medium bg-[#e8f5e9] border-2 border-[#00c853] text-[#1b5e20] dark:bg-[#1b5e20] dark:border-[#00e676] dark:text-[#a5d6a7]">
      <strong>Correct Answer:</strong> {{ question.correctAnswer }}
    </p>

    <div
      v-if="selectedAnswer !== question.correctAnswer"
      ref="explanation"
      class="mt-4 p-4 rounded-lg text-lg font-medium bg-[#fff8e1] border-2 border-[#ffb300] text-[#795548] dark:bg-[#3e2723] dark:border-[#ffca28] dark:text-[#ffe0b2]"
    >
      <p>
        <strong>Explanation:</strong> {{ question.explanation }}
      </p>
      <UButton
        v-if="!showChatPanel"
        class="mt-4 px-3 py-1 text-sm rounded bg-primary hover:bg-gray-300 dark:hover:bg-gray-300 transition"
        @click="showChatPanel = true"
      >
        Talk to Eddy
      </UButton>
    </div>

    <ChatPanel v-if="showChatPanel" :question="question" class="mt-4" />

    <UButton
      class="mt-4 px-3 py-1 text-sm rounded bg-red-400 dark:bg-red-700 hover:bg-red-300 dark:hover:bg-red-600 transition"
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

function openChatPanel() {
  showChatPanel.value = true;
}

onMounted(() => {
  if (props.question && props.question.title) {
    renderMath(content.value);
  }
});
</script>
