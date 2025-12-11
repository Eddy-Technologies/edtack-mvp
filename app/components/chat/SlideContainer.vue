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
      <div class="p-6 pb-24">
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
          <h2 v-if="currentSlide.title" class="text-sm text-gray-400 mb-3">
            {{ currentSlide.title }}
          </h2>
          <MDCRenderer
            v-if="slideMarkdownBody"
            :body="slideMarkdownBody"
            tag="div"
            class="prose prose-md max-w-none text-lg"
          />
          <div
            v-else-if="currentSlide.content"
            class="text-lg max-w-none"
            v-html="processedSlideContent"
          />

          <!-- Question Options for MCQ slides -->
          <div v-if="currentSlide.type === 'question' && currentSlide.options" class="mt-4">
            <div class="space-y-2">
              <div
                v-for="(option, index) in currentSlide.options"
                :key="option.id"
                :class="[
                  'p-3 border rounded-lg cursor-pointer transition-all',
                  selectedOptions[currentSlide.id]?.id === option.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                ]"
                @click="selectOption(option)"
              >
                <span class="font-medium">{{ String.fromCharCode(65 + index) }}.</span>
                {{ option.option_text }}
              </div>
            </div>

            <!-- Check Answer Button for Questions -->
            <div class="mt-4 flex justify-center">
              <button
                v-if="selectedOptions[currentSlide.id] && !answeredQuestions[currentSlide.id]"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                @click="checkAnswer(currentSlide)"
              >
                Check Answer
              </button>
            </div>

            <!-- Answer Feedback -->
            <div v-if="answeredQuestions[currentSlide.id]" class="mt-4">
              <div
                :class="[
                  'p-3 rounded-lg',
                  answeredQuestions[currentSlide.id]?.markingStatus === 'CORRECT'
                    ? 'bg-green-50 border border-green-200'
                    : answeredQuestions[currentSlide.id]?.markingStatus === 'PARTIALLY_CORRECT'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-red-50 border border-red-200'
                ]"
              >
                <p
                  :class="[
                    'text-sm font-semibold',
                    answeredQuestions[currentSlide.id]?.markingStatus === 'CORRECT'
                      ? 'text-green-800'
                      : answeredQuestions[currentSlide.id]?.markingStatus === 'PARTIALLY_CORRECT'
                        ? 'text-amber-800'
                        : 'text-red-800'
                  ]"
                >
                  {{ answeredQuestions[currentSlide.id]?.feedback }}
                </p>
              </div>
            </div>
          </div>

          <!-- Explanation (shown after answer) -->
          <div v-if="showExplanation && currentSlide.explanation" class="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p class="text-sm text-primary-800">
              <strong>Explanation:</strong> {{ currentSlide.explanation }}
            </p>
          </div>
        </div>

        <!-- Slide Thumbnail Overview -->
        <div v-if="showThumbnails" class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">All Slides</h4>
          <TransitionGroup
            name="slide-list"
            tag="div"
            class="grid grid-cols-2 gap-2"
          >
            <div
              v-for="(slide, index) in slides"
              :key="slide.id"
              :class="[
                'p-2 border rounded cursor-pointer text-xs transition-all duration-300',
                index === currentSlideIndex
                  ? 'border-primary-500 bg-primary-50 scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
              @click="jumpToSlide(index)"
            >
              <div class="font-medium">{{ slide.part_label }}</div>
              <div class="text-gray-600 truncate">{{ slide.title }}</div>
              <!-- NEW: Badge for newly added slides -->
              <span
                v-if="isSlideNew(index)"
                class="inline-block mt-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded-full animate-pulse"
              >
                NEW
              </span>
            </div>
          </TransitionGroup>
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
              ? 'bg-primary-500 text-white'
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
              ? 'bg-primary-500 text-white'
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
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import { useToast } from '#imports';
import { convertHighlights, convertImages } from '~/utils/markdownUtils';

const toast = useToast();

interface SlideData {
  id: string;
  part_label: string;
  title: string;
  content: string;
  type: string;
  question_type?: string;
  options?: Array<{
    id: string;
    option_text: string;
    imageUrl?: string;
  }>;
  answer: any[];
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

// Question and answer state
const selectedOptions = ref<Record<string, any>>({});
const answeredQuestions = ref<Record<string, { markingStatus: string; feedback: string }>>({});

// Refs
const rightPanel = ref<HTMLElement>();
const resizeHandle = ref<HTMLElement>();

// Track newly added slides for animation
const newSlideIndices = ref<Set<number>>(new Set());

watch(() => props.slides.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // Mark new slides
    for (let i = oldLength; i < newLength; i++) {
      newSlideIndices.value.add(i);
    }

    // Remove "new" badge after 3 seconds
    setTimeout(() => {
      for (let i = oldLength; i < newLength; i++) {
        newSlideIndices.value.delete(i);
      }
    }, 3000);
  }
});

const isSlideNew = (index: number) => {
  return newSlideIndices.value.has(index);
};

// Computed properties
const currentSlide = computed(() => props.slides[currentSlideIndex.value]);
const totalSlides = computed(() => props.slides.length);

const processedSlideContent = computed(() => {
  if (!currentSlide.value?.content) return '';
  let processed = convertImages(currentSlide.value.content, 'Slide image');
  processed = convertHighlights(processed);
  return processed;
});

// Parse markdown for slide content
const slideMarkdownBody = ref();

watchEffect(async () => {
  if (processedSlideContent.value) {
    try {
      const parsed = await parseMarkdown(processedSlideContent.value);
      slideMarkdownBody.value = parsed?.body;
    } catch (e) {
      console.error('Markdown parsing error:', e);
      // Fallback to raw content if parsing fails
      slideMarkdownBody.value = null;
    }
  } else {
    slideMarkdownBody.value = null;
  }
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
  // Store selected option for this slide
  selectedOptions.value[currentSlide.value.id] = option;

  // Clear any previous answer for this slide
  if (answeredQuestions.value[currentSlide.value.id]) {
    answeredQuestions.value[currentSlide.value.id] = undefined as any;
  }
}

// Check answer for questions
function checkAnswer(slide: SlideData) {
  const selectedOption = selectedOptions.value[slide.id];
  if (!selectedOption) return;

  if (slide.options && slide.answer && slide.answer.length > 0) {
    // Check if selected option matches the correct answer
    // TODO: currently only can check mcq and using index to check which is not very safe. should use ID matching instead
    const correctAnswerIndex = slide.answer[0].option_id;
    const correctOption = slide.options.find((option) => option.id === correctAnswerIndex);
    const markingStatus = (correctOption && selectedOption.id === correctOption.id) ? 'CORRECT' : 'INCORRECT';

    answeredQuestions.value[slide.id] = {
      markingStatus,
      feedback: markingStatus === 'CORRECT' ? '✅ Correct!' : '❌ Incorrect. Try again!'
    };

    // Show explanation if available
    if (slide.explanation) {
      showExplanation.value = true;
    }
  } else {
    // For other question types or questions without provided answers, show placeholder
    toast.add({
      title: 'Answer Checked',
      description: 'This question type will be supported soon!',
      color: 'primary'
    });
  }
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

// Keyboard navigation
function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') previousSlide();
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'Escape') emit('close-split-view');
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('keydown', handleKeyPress);
});
</script>
