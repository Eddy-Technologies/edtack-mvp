<template>
  <div class="min-w-0 text-left @container">
    <!-- Slides Card with Thumbnails -->
    <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Icon name="i-heroicons-academic-cap" class="w-5 h-5 text-primary-600" />
          </div>
          <h3 class="font-semibold text-gray-800 text-base flex items-center gap-2">
            {{ slides.length }} {{ slides.length === 1 ? 'Slide' : 'Slides' }}
            <Icon
              v-if="isStreaming"
              name="i-heroicons-arrow-path"
              class="w-4 h-4 text-primary-600 animate-spin"
            />
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <!-- Stop button when streaming -->
          <button
            v-if="isStreaming"
            class="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            @click.stop="$emit('cancel')"
          >
            <UIcon name="i-lucide-stop-circle" class="w-4 h-4" />
            <span class="hidden sm:inline">Stop</span>
          </button>
        </div>
      </div>

      <!-- Thumbnail Grid - responsive to container width -->
      <div class="grid grid-cols-2 @xs:grid-cols-3 @sm:grid-cols-4 @md:grid-cols-5 gap-2">
        <div
          v-for="(slide, index) in displayedSlides"
          :key="slide.id"
          class="p-2 bg-white border border-gray-200 rounded cursor-pointer text-xs hover:border-primary-300 hover:bg-primary-50 transition-all"
          @click="openSlideAt(index)"
        >
          <div class="font-medium text-gray-800 truncate">{{ slide.part_label || `Slide ${index + 1}` }}</div>
          <div class="text-gray-500 truncate">{{ slide.title }}</div>
        </div>
        <!-- Show more button (when collapsed) -->
        <div
          v-if="!isExpanded && hiddenCount > 0"
          class="p-2 bg-white border border-gray-200 rounded cursor-pointer text-xs hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center"
          @click="isExpanded = true"
        >
          <span class="font-medium text-gray-600">+{{ hiddenCount }} more</span>
        </div>
      </div>

      <!-- Show less button (when expanded) -->
      <Button
        v-if="isExpanded && slides.length > MAX_VISIBLE"
        variant="secondary"
        size="sm"
        text="Show less"
        extra-classes="w-full mt-2"
        @clicked="isExpanded = false"
      />

      <!-- Loading indicator when more slides are being generated -->
      <div
        v-if="isStreaming"
        class="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-primary-100/50 rounded-lg"
      >
        <div class="flex gap-1">
          <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>
        <span class="text-sm text-primary-700">Generating more slides...</span>
      </div>
    </div>

    <!-- Message Actions (for copying, etc.) -->
    <MessageActions
      :message-text="slidesPreviewText"
      :message-id="messageId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MessageActions from '../chat/MessageActions.vue';
import Button from '../common/Button.vue';

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
  startPlayback?: boolean;
  messageId?: string;
  isStreaming?: boolean;
}>();

const emit = defineEmits(['finish', 'open-split-view', 'cancel']);

// Max visible slides (2 rows * 5 columns - 1 for "+more" button = 9)
const MAX_VISIBLE = 9;

// Expand/collapse state
const isExpanded = ref(false);

// Computed properties
const displayedSlides = computed(() => {
  if (isExpanded.value) return props.slides;
  if (props.slides.length <= MAX_VISIBLE + 1) return props.slides;
  return props.slides.slice(0, MAX_VISIBLE);
});

const hiddenCount = computed(() => {
  if (props.slides.length <= MAX_VISIBLE + 1) {
    return 0;
  }
  return props.slides.length - MAX_VISIBLE;
});

const slidesPreviewText = computed(() => {
  const titles = props.slides.map((slide) => slide.title || slide.part_label || 'Untitled').join(', ');
  return `Learning slides: ${titles}`;
});

// Methods
function openSlideAt(index: number) {
  emit('open-split-view', props.slides, index);
}

// Auto-finish when component loads (for playback flow)
if (props.startPlayback) {
  setTimeout(() => {
    emit('finish');
  }, 100);
}
</script>
