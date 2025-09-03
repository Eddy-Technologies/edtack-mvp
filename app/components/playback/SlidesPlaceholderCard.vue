<template>
  <div class="min-w-0 text-left">
    <!-- Simple Slides Button -->
    <button
      class="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg p-4 mb-4 text-left group"
      @click="openSplitView"
    >
      <div class="flex items-center justify-between">
        <!-- Left side: Icon and content info -->
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center">
            <Icon name="i-heroicons-academic-cap" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 text-base">
              {{ slides.length }} {{ slides.length === 1 ? 'Slide' : 'Slides' }}
            </h3>
          </div>
        </div>

        <!-- Right side: Action indicator -->
        <div class="flex items-center gap-2 text-blue-600">
          <span class="text-sm font-medium hidden sm:block">View Slides</span>
          <Icon name="i-heroicons-arrow-right" class="w-5 h-5" />
        </div>
      </div>
    </button>

    <!-- Message Actions (for copying, etc.) -->
    <MessageActions :message-text="slidesPreviewText" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MessageActions from '../chat/MessageActions.vue';

interface SlideData {
  id: string;
  part_label?: string;
  title?: string;
  content?: string;
  type?: string;
  question_type?: string;
}

const props = defineProps<{
  slides: SlideData[];
  slidesTitle?: string;
  startPlayback?: boolean;
}>();

const emit = defineEmits(['finish', 'open-split-view']);

// Computed properties
const slidesPreviewText = computed(() => {
  const titles = props.slides.map((slide) => slide.title || slide.part_label || 'Untitled').join(', ');
  return `Learning slides: ${titles}`;
});

// Methods
function openSplitView() {
  emit('open-split-view', props.slides);
}

// Auto-finish when component loads (for playback flow)
if (props.startPlayback) {
  setTimeout(() => {
    emit('finish');
  }, 100);
}
</script>
