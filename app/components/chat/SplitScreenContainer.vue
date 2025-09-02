<template>
  <div class="flex h-full">
    <!-- Left Panel: Conversation -->
    <div
      :class="[
        'flex-1 flex flex-col overflow-hidden',
        isMobile ? (mobileActiveTab === 'chat' ? 'w-full' : 'hidden') : ''
      ]"
    >
      <div class="flex-1 overflow-y-auto">
        <slot name="conversation" />
      </div>
    </div>

    <!-- Resize Handle (Desktop only) -->
    <div
      v-if="!isMobile"
      ref="resizeHandle"
      class="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize"
      @mousedown="startResize"
    />

    <!-- Right Panel: Slide Content -->
    <div
      ref="rightPanel"
      :class="[
        'flex-shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto relative',
        isMobile ? (mobileActiveTab === 'slides' ? 'w-full' : 'hidden') : ''
      ]"
      :style="{ width: isMobile ? '100%' : `${rightPanelWidth}%` }"
    >
      <div class="p-6">
        <!-- Close Split View Button -->
        <button
          class="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Close split view"
          @click="$emit('close-split-view')"
        >
          <Icon name="i-heroicons-x-mark" size="16" />
        </button>
        <!-- Slide Navigation Header -->
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ currentSlide?.part_label || 'Slide' }}
          </h3>
          <div class="flex items-center gap-2">
            <button
              v-if="currentSlideIndex > 0"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
              :disabled="currentSlideIndex === 0"
              @click="previousSlide"
            >
              ←
            </button>
            <span class="text-sm text-gray-600">
              {{ currentSlideIndex + 1 }} / {{ totalSlides }}
            </span>
            <button
              v-if="currentSlideIndex < totalSlides - 1"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
              :disabled="currentSlideIndex === totalSlides - 1"
              @click="nextSlide"
            >
              →
            </button>
          </div>
        </div>

        <!-- Current Slide Display -->
        <div v-if="currentSlide" class="bg-white rounded-lg p-4 shadow-sm">
          <h2 v-if="currentSlide.title" class="text-xl font-semibold mb-3">
            {{ currentSlide.title }}
          </h2>
          <div
            v-if="currentSlide.content"
            class="prose prose-sm max-w-none"
            v-html="processedSlideContent"
          />

          <!-- Question Options for MCQ slides -->
          <div v-if="currentSlide.type === 'question' && currentSlide.options" class="mt-4">
            <div class="space-y-2">
              <div
                v-for="(option, index) in currentSlide.options"
                :key="option.id"
                class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                @click="selectOption(option)"
              >
                <span class="font-medium">{{ String.fromCharCode(65 + index) }}.</span>
                {{ option.option_text }}
              </div>
            </div>
          </div>

          <!-- Explanation (shown after answer) -->
          <div v-if="showExplanation && currentSlide.explanation" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Explanation:</strong> {{ currentSlide.explanation }}
            </p>
          </div>
        </div>

        <!-- Slide Thumbnail Overview -->
        <div v-if="showThumbnails" class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">All Slides</h4>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(slide, index) in slides"
              :key="slide.id"
              :class="[
                'p-2 border rounded cursor-pointer text-xs transition-colors',
                index === currentSlideIndex
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
              @click="jumpToSlide(index)"
            >
              <div class="font-medium">{{ slide.part_label }}</div>
              <div class="text-gray-600 truncate">{{ slide.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Tab Switcher -->
    <div v-if="isMobile" class="fixed bottom-16 left-0 right-0 bg-white border-t p-2">
      <div class="flex">
        <button
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-l',
            mobileActiveTab === 'chat'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          @click="mobileActiveTab = 'chat'"
        >
          Chat
        </button>
        <button
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-r',
            mobileActiveTab === 'slides'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          @click="mobileActiveTab = 'slides'"
        >
          Slides
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface SlideData {
  id: string;
  part_label: string;
  title: string;
  content: string;
  type: string;
  options?: Array<{
    id: string;
    option_text: string;
    imageUrl?: string;
  }>;
  explanation?: string;
}

const props = defineProps<{
  slides: SlideData[];
  initialSlideIndex?: number;
  showThumbnails?: boolean;
}>();

const emit = defineEmits(['slide-changed', 'option-selected', 'close-split-view']);

// Responsive state
const isMobile = ref(false);
const rightPanelWidth = ref(40);
const mobileActiveTab = ref<'slides' | 'chat'>('chat');

// Slide navigation
const currentSlideIndex = ref(props.initialSlideIndex || 0);
const showExplanation = ref(false);

// Refs
const rightPanel = ref<HTMLElement>();
const resizeHandle = ref<HTMLElement>();

// Computed properties
const currentSlide = computed(() => props.slides[currentSlideIndex.value]);
const totalSlides = computed(() => props.slides.length);

const processedSlideContent = computed(() => {
  if (!currentSlide.value?.content) return '';

  // Convert &&img&& markers to actual images
  return currentSlide.value.content.replace(
    /&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g,
    '<img src="$1" alt="Slide image" class="my-2 max-w-full rounded-md"/>'
  );
});

// Methods
function previousSlide() {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--;
    showExplanation.value = false;
    emit('slide-changed', currentSlideIndex.value);
  }
}

function nextSlide() {
  if (currentSlideIndex.value < totalSlides.value - 1) {
    currentSlideIndex.value++;
    showExplanation.value = false;
    emit('slide-changed', currentSlideIndex.value);
  }
}

function jumpToSlide(index: number) {
  currentSlideIndex.value = index;
  showExplanation.value = false;
  emit('slide-changed', index);
}

function selectOption(option: any) {
  showExplanation.value = true;
  emit('option-selected', {
    slideId: currentSlide.value.id,
    selectedOption: option,
    slide: currentSlide.value
  });
}

// Resize functionality
let isResizing = false;

function startResize(e: MouseEvent) {
  isResizing = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  e.preventDefault();
}

function handleResize(e: MouseEvent) {
  if (!isResizing) return;

  const container = rightPanel.value?.parentElement;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const newWidth = 100 - ((e.clientX - containerRect.left) / containerRect.width) * 100;

  // Constrain between 25% and 65%
  rightPanelWidth.value = Math.min(Math.max(newWidth, 25), 65);
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

// Responsive handling
function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});

// Watch mobile tab changes
watch(mobileActiveTab, (newTab) => {
  // Could emit events to parent to handle mobile tab switching
});

// Keyboard navigation
function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') previousSlide();
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'Escape') emit('close-split-view');
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);
});
</script>
