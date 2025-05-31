<template>
 <Modal :show="props.showReportModal" @close="closeReportModal">
 <template #title>
 <h4 class="text-lg font-bold text-primary">Report an Issue</h4>
 </template>

 <ul class="space-y-3 mb-4">
 <li v-for="reason in reasons" :key="reason">
 <label
 class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition
 border-slate-300 bg-white
 hover:border-primary hover:bg-blue-50
 text-zinc-800"
 :class="{
 'border-primary bg-blue-50 ':
 selectedReportReasons.includes(reason)
 }"
 >
 <input
 v-model="selectedReportReasons"
 type="checkbox"
 :value="reason"
 class="accent-primary-600"
 >
 {{ reason }}
 </label>
 </li>
 </ul>

 <textarea
 v-if="selectedReportReasons.includes('Other')"
 v-model="otherReasons"
 placeholder="Describe the issue..."
 class="w-full mt-2 min-h-[80px] rounded-md border border-slate-300 p-3 text-base bg-white text-zinc-800 focus:ring-primary-500 focus:border-primary-500"
 />

 <template #footer>
 <UButton
 color="primary"
 @click="submitReport"
 >
 Submit
 </UButton>
 <UButton
 variant="soft"
 color="gray"
 @click="closeReportModal"
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
