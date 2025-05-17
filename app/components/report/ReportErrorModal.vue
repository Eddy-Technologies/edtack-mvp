<template>
  <div v-if="props.showReportModal" class="modal-overlay" @click.self="closeReportModal">
    <div class="modal-content">
      <h4>Report an Issue</h4>
      <ul class="report-options">
        <li v-for="reason in reasons" :key="reason">
          <label :class="['option-item', { selected: selectedReportReasons.includes(reason) }]">
            <input
              type="checkbox"
              :value="reason"
              v-model="selectedReportReasons"
            />
            {{ reason }}
          </label>
        </li>
      </ul>
      <textarea
        v-if="selectedReportReasons.includes('Other')"
        v-model="otherReasons"
        placeholder="Describe the issue..."
      ></textarea>
      <div class="modal-actions">
        <button @click="submitReport">Submit</button>
        <button @click="closeReportModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import { handleReportSubmit, QuestionReportReason, ResultReportReason } from '~/utils/submitReportUtils.js';

const props = defineProps<{
  showReportModal: boolean,
  question: object,
  selectedAnswer: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: {
    reasons: string[],
    otherReasons: string | null,
    question: object,
    selectedAnswer: string | null
  }): void
}>()

// Choose which reasons to use (ResultReportReason or QuestionReportReason)
const reasons = computed(() => {
  if (props.selectedAnswer === null)
    return Object.values(QuestionReportReason).map(String)
  else
    return Object.values(ResultReportReason).map(String)
})

const selectedReportReasons = ref<string[]>([])
const otherReasons = ref('')

const toast = useToast()

function closeReportModal() {
  emit('close')
  selectedReportReasons.value = []
  otherReasons.value = ''
}

function submitReport() {
  if (selectedReportReasons.value.length === 0) {
    closeReportModal()
    return
  }

  handleReportSubmit(
    props.question,
    props.selectedAnswer,
    selectedReportReasons.value,
    otherReasons.value,
  )

  toast.add({
    title: 'Success',
    description: 'Report sent. Thank you!',
    timeout: 2000,
    icon: 'check',
    color: "green"
  });

  emit('submit', {
    reasons: selectedReportReasons.value,
    otherReasons: otherReasons.value,
    question: props.question,
    selectedAnswer: props.selectedAnswer
  })
  closeReportModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #f8fafc; /* match question bg */
  color: #22223b;
  padding: 2rem 1.5rem;
  border-radius: 0.75em; /* match .option-item */
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  width: 90%;
  max-width: 420px;
  font-size: 1.1rem;
}

.dark .modal-content {
  background: #23272f;
  color: #f3f4f6;
}

h4 {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #4f46e5; /* text-primary */
}

.report-options {
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
}

.report-options li {
  margin-bottom: 0.75em;
}

.report-options label {
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

input[type="radio"] {
  accent-color: rebeccapurple; /* match --form-control-color */
  margin-right: 0.5em;
}

textarea {
  width: 100%;
  margin-top: 10px;
  min-height: 80px;
  border-radius: 0.5em;
  border: 1px solid #cbd5e1;
  padding: 0.75em;
  font-size: 1rem;
  background: #fff;
  color: #22223b;
}

.dark textarea {
  background: #23272f;
  color: #f3f4f6;
  border: 1.5px solid #444;
}

.modal-actions {
  margin-top: 1.5em;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 0.5em 1.2em;
  border-radius: 0.5em;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-actions button:first-child {
  background-color: #4f46e5; /* text-primary */
  color: white;
}

.modal-actions button:first-child:hover {
  background-color: #6366f1;
}

.modal-actions button:last-child {
  background-color: #e5e7eb;
  color: #22223b;
}

.dark .modal-actions button:last-child {
  background-color: #374151;
  color: #f3f4f6;
}

.dark .modal-actions button:last-child:hover {
  background-color: #4b5563;
}

.modal-actions button:last-child:hover {
  background-color: #cbd5e1;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75em;
  padding: 0.75em 1em;
  border: 2px solid #cbd5e1;
  border-radius: 0.75em;
  background: #fff;
  cursor: pointer;
  margin-bottom: 0.5em;
  transition: border-color 0.2s, background 0.2s;
  font-size: 1rem;
}

.option-item.selected,
.option-item:hover {
  border-color: rebeccapurple;
  background: #f3e8ff;
}

.dark .option-item {
  background: #23272f;
  color: #f3f4f6;
  border-color: #444;
}

.dark .option-item.selected,
.dark .option-item:hover {
  background: #3b3663;
  border-color: #a78bfa;
}

input[type="checkbox"] {
  accent-color: rebeccapurple;
  margin-right: 0.5em;
}

.dark input[type="checkbox"] {
  accent-color: #a78bfa;
}
</style>
