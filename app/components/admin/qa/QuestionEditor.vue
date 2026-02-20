<template>
  <div v-if="currentQuestion" class="flex flex-col h-full">
    <!-- Scrollable form -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Title (readonly) -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Title</label>
        <div class="text-sm font-medium text-slate-800">{{ currentQuestion.title }}</div>
        <div class="text-xs text-slate-400 mt-0.5">{{ currentQuestion.part_label }}</div>
      </div>

      <!-- Chapter -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Chapter</label>
        <select
          v-model="currentQuestion.chapter_id"
          class="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5"
          @change="markDirty"
        >
          <option v-for="ch in chapters" :key="ch" :value="ch">{{ ch }}</option>
        </select>
      </div>

      <!-- Question text -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Question</label>
        <textarea
          v-model="currentQuestion.question"
          rows="9"
          class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
          @input="markDirty"
        />
        <!-- Highlight diagram placeholders -->
        <div v-if="diagramPlaceholders.length > 0" class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="ph in diagramPlaceholders"
            :key="ph"
            class="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded"
          >
            {{ ph }}
          </span>
        </div>
      </div>

      <!-- Options A-D -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-2">Options</label>
        <div class="space-y-2">
          <div
            v-for="(opt, idx) in currentQuestion.options"
            :key="opt.id"
            class="flex items-start gap-2"
          >
            <input
              type="radio"
              :name="'answer-' + currentQuestion.id"
              :checked="isCorrectOption(opt.id)"
              class="mt-1.5"
              @change="setCorrectAnswer(opt.id)"
            >
            <span class="text-sm font-medium text-slate-500 mt-1 w-5">{{ optionLabels[idx] }}</span>
            <input
              v-model="opt.option_text"
              type="text"
              :class="[
                'flex-1 text-sm border rounded-lg px-2 py-1.5',
                isCorrectOption(opt.id)
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-300',
              ]"
              @input="markDirty"
            >
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Explanation</label>
        <textarea
          v-model="currentQuestion.explanation"
          rows="3"
          class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
          placeholder="No explanation"
          @input="markDirty"
        />
      </div>

      <!-- Review Status -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-2">Review Status</label>
        <div class="flex gap-2">
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              currentQuestion.review_status === 'PENDING'
                ? 'bg-slate-200 text-slate-800'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
            ]"
            @click="setStatus('PENDING')"
          >
            Pending
          </button>
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              currentQuestion.review_status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-50 text-slate-400 hover:bg-green-50',
            ]"
            @click="setStatus('APPROVED')"
          >
            Approved
          </button>
          <button
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              currentQuestion.review_status === 'FLAGGED'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-slate-50 text-slate-400 hover:bg-orange-50',
            ]"
            @click="setStatus('FLAGGED')"
          >
            Flagged
          </button>
        </div>
      </div>

      <!-- Review Notes -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Review Notes</label>
        <textarea
          v-model="currentQuestion.review_notes"
          rows="2"
          class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Notes about this question..."
          @input="markDirty"
        />
      </div>

      <!-- Diagram Crops -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <label class="block text-xs font-medium text-slate-500">Cropped Diagrams</label>
          <button
            v-if="currentQuestion.has_diagram"
            class="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            @click="showCropPicker = !showCropPicker"
          >
            <UIcon name="i-lucide-image" class="w-3 h-3 mr-0.5 inline" />
            Reuse Image
          </button>
        </div>

        <!-- Crop picker -->
        <div
          v-if="showCropPicker"
          class="mb-2 border border-blue-200 rounded-lg p-2 bg-blue-50/50"
        >
          <div v-if="allUniqueCrops.length === 0" class="text-xs text-slate-400 py-2 text-center">
            No crops available yet
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="crop in allUniqueCrops"
              :key="crop.public_url"
              class="border border-slate-200 rounded overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all bg-white"
              :title="crop.placeholder"
              @click="applyExistingCrop(crop)"
            >
              <img
                :src="crop.public_url"
                :alt="crop.placeholder"
                class="h-16 w-auto object-contain"
              >
            </button>
          </div>
        </div>

        <!-- Current crops -->
        <div v-if="currentQuestion.diagram_crops?.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(crop, idx) in currentQuestion.diagram_crops"
            :key="crop.placeholder"
            class="relative border border-slate-200 rounded-lg overflow-hidden group"
          >
            <button
              class="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove crop"
              @click="removeCrop(idx)"
            >
              <UIcon name="i-lucide-x" class="w-3 h-3" />
            </button>
            <img
              :src="crop.public_url"
              :alt="crop.placeholder"
              class="h-20 w-auto object-contain"
            >
            <div class="px-1.5 py-1 text-xs text-slate-500 truncate max-w-[120px]">
              {{ crop.placeholder }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="flex items-center gap-2 px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
        @click="onFlag"
      >
        <UIcon name="i-lucide-flag" class="w-4 h-4 mr-1 inline" />
        Flag
      </button>

      <!-- Difficulty pills -->
      <div class="flex gap-1 ml-20">
        <button
          v-for="d in difficulties"
          :key="d"
          :class="[
            'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
            currentQuestion.difficulty === d
              ? difficultyColors[d]
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
          ]"
          @click="setDifficulty(d)"
        >
          {{ d }}
        </button>
      </div>

      <div class="flex-1" />

      <span v-if="isDirty" class="text-xs text-amber-600">Unsaved changes</span>
      <span v-if="saving" class="text-xs text-blue-600">Saving...</span>

      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-30"
        :disabled="saving || currentIndex <= 0"
        @click="goToPrev"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1 inline" />
        Back
      </button>

      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        :disabled="saving"
        @click="saveCurrentQuestion"
      >
        Save
      </button>

      <button
        class="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
        :disabled="saving"
        @click="approveAndNext"
      >
        Approve & Next
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1 inline" />
      </button>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="flex items-center justify-center h-full text-slate-400">
    Select a question to review
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const {
  currentQuestion,
  currentIndex,
  chapters,
  isDirty,
  saving,
  markDirty,
  saveCurrentQuestion,
  approveAndNext,
  flagQuestion,
  goToPrev,
} = useQAReview();

const showCropPicker = ref(false);
const allUniqueCrops = ref<Array<{ placeholder: string; public_url: string }>>([]);

// Fetch latest 5 crops each time picker opens
watch(showCropPicker, async (open) => {
  if (!open) return;
  allUniqueCrops.value = [];
  try {
    const res = await $fetch<{
      success: boolean;
      data: Array<{ placeholder: string; public_url: string }>;
    }>('/api/admin/qa/crops');
    if (res.success) {
      allUniqueCrops.value = res.data;
    }
  } catch {
    // ignore
  }
});

function applyExistingCrop(crop: { placeholder: string; public_url: string }) {
  if (!currentQuestion.value) return;
  currentQuestion.value.question_image_url = crop.public_url;
  if (!currentQuestion.value.diagram_crops) {
    currentQuestion.value.diagram_crops = [];
  }
  const existing = currentQuestion.value.diagram_crops.find(
    (c) => c.public_url === crop.public_url
  );
  if (!existing) {
    currentQuestion.value.diagram_crops.push({
      placeholder: crop.placeholder,
      storage_path: '',
      public_url: crop.public_url,
      crop_rect: { x: 0, y: 0, width: 0, height: 0 },
      page_number: 0,
      created_at: new Date().toISOString(),
    });
  }
  markDirty();
  showCropPicker.value = false;
}

const optionLabels = ['A', 'B', 'C', 'D'];
const difficulties = ['Basic', 'Intermediate', 'Challenging'];
const difficultyColors: Record<string, string> = {
  Basic: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Challenging: 'bg-red-100 text-red-700',
};

function setDifficulty(d: string) {
  if (!currentQuestion.value) return;
  currentQuestion.value.difficulty = d;
  markDirty();
}

const diagramPlaceholders = computed(() => {
  if (!currentQuestion.value) return [];
  const matches = currentQuestion.value.question.matchAll(/&&img&&\s*([\w]+)\s*&&img&&/g);
  return [...matches].map((m) => m[1]);
});

function isCorrectOption(optionId: string): boolean {
  if (!currentQuestion.value) return false;
  return currentQuestion.value.answer.some((a) => a.option_id === optionId);
}

function setCorrectAnswer(optionId: string) {
  if (!currentQuestion.value) return;
  if (currentQuestion.value.answer.length > 0) {
    currentQuestion.value.answer[0].option_id = optionId;
  } else {
    currentQuestion.value.answer.push({
      id: crypto.randomUUID(),
      question_id: currentQuestion.value.id,
      option_id: optionId,
      answer_text: null,
      answer_boolean: null,
      answer_draw_file: null,
      order_index: 1,
    });
  }
  markDirty();
}

function removeCrop(idx: number) {
  if (!currentQuestion.value) return;
  currentQuestion.value.diagram_crops.splice(idx, 1);
  if (currentQuestion.value.diagram_crops.length === 0) {
    currentQuestion.value.question_image_url = null;
  }
  markDirty();
}

function setStatus(status: 'PENDING' | 'APPROVED' | 'FLAGGED') {
  if (!currentQuestion.value) return;
  currentQuestion.value.review_status = status;
  markDirty();
}

function onFlag() {
  const notes = currentQuestion.value?.review_notes || '';
  flagQuestion(notes || 'Flagged for review');
}
</script>
