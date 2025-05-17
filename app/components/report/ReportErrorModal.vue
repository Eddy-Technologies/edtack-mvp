<template>
  <Modal :show="props.showReportModal" @close="closeReportModal">
    <template #title>
      <h4 class="text-lg font-bold text-primary">Report an Issue</h4>
    </template>

    <ul class="space-y-3 mb-4">
      <li v-for="reason in reasons" :key="reason">
        <label
            class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition
            border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900
            hover:border-primary hover:bg-[#f0f8ff] dark:hover:bg-zinc-700
            text-zinc-800 dark:text-zinc-100"
            :class="{
            'border-primary bg-[#f0f8ff] dark:border-primary dark:bg-zinc-700':
              selectedReportReasons.includes(reason)
          }"
        >
          <input
              type="checkbox"
              v-model="selectedReportReasons"
              :value="reason"
              class="accent-purple-600 dark:accent-purple-400"
          />
          {{ reason }}
        </label>
      </li>
    </ul>

    <textarea
        v-if="selectedReportReasons.includes('Other')"
        v-model="otherReasons"
        placeholder="Describe the issue..."
        class="w-full mt-2 min-h-[80px] rounded-md border border-slate-300 dark:border-zinc-600 p-3 text-base bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
    />

    <template #footer>
      <UButton
          @click="submitReport"
          class="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-600 transition"
      >
        Submit
      </UButton>
      <UButton
          @click="closeReportModal"
          class="bg-slate-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100 px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-zinc-600 transition"
      >
        Cancel
      </UButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from '~/components/common/Modal.vue';
import { handleReportSubmit, QuestionReportReason, ResultReportReason } from '~/utils/submitReportUtils.js';

const props = defineProps<{
  showReportModal: boolean;
  question: object;
  selectedAnswer: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: {
    reasons: string[];
    otherReasons: string | null;
    question: object;
    selectedAnswer: string | null;
  }): void;
}>();

const reasons = computed(() => {
  if (props.selectedAnswer === null)
    return Object.values(QuestionReportReason).map(String);
  else
    return Object.values(ResultReportReason).map(String);
});

const selectedReportReasons = ref<string[]>([]);
const otherReasons = ref('');

const toast = useToast();

function closeReportModal() {
  emit('close');
  selectedReportReasons.value = [];
  otherReasons.value = '';
}

function submitReport() {
  if (selectedReportReasons.value.length === 0) {
    closeReportModal();
    return;
  }

  handleReportSubmit(
      props.question,
      props.selectedAnswer,
      selectedReportReasons.value,
      otherReasons.value,
  );

  toast.add({
    title: 'Success',
    description: 'Report sent. Thank you!',
    timeout: 2000,
    icon: 'check',
    color: 'green'
  });

  emit('submit', {
    reasons: selectedReportReasons.value,
    otherReasons: otherReasons.value,
    question: props.question,
    selectedAnswer: props.selectedAnswer
  });
  closeReportModal();
}
</script>
