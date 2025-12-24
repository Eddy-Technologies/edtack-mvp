<template>
  <!-- Slides Panel - standalone column -->
  <div
    ref="slidesPanel"
    class="flex-shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto relative h-full"
    :style="{ width: isMobile ? '100%' : `${panelWidth}px` }"
  >
    <!-- Resize Handle (Desktop only) -->
    <div
      v-if="!isMobile"
      ref="resizeHandle"
      class="sticky left-0 top-0 h-screen w-1 bg-gray-200 hover:bg-primary-400 cursor-col-resize z-10 float-left -ml-0"
      @mousedown="startResize"
    />

    <div class="p-4 h-full flex flex-col">
      <!-- Top Navigation Bar - Inline -->
      <div class="flex items-center gap-2 mb-4 flex-shrink-0">
        <!-- Close Button -->
        <button
          class="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors p-1.5"
          title="Close slides"
          @click="$emit('close-split-view')"
        >
          <Icon name="i-heroicons-x-mark" size="20" />
        </button>

        <!-- Previous Button -->
        <button
          class="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentSlideIndex === 0"
          @click="previousSlide"
        >
          <Icon name="i-heroicons-chevron-left" size="20" />
        </button>

        <!-- Title Dropdown -->
        <UPopover :popper="{ placement: 'bottom-start' }" class="flex-1 min-w-0">
          <button class="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex-1 min-w-0 text-left">
              <div class="text-sm font-semibold text-gray-800 truncate">
                {{ currentSlide?.part_label || 'Slide' }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ currentSlide?.title || '' }}
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <span class="text-xs text-gray-400">{{ currentSlideIndex + 1 }}/{{ totalSlides }}</span>
              <Icon name="i-heroicons-chevron-down" size="16" class="text-gray-400" />
            </div>
          </button>

          <template #panel="{ close }">
            <div class="max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200" :style="{ width: dropdownWidth }" @vue:mounted="scrollToSelectedSlide">
              <div
                v-for="(slide, index) in slides"
                :key="slide.id"
                :ref="(el) => { if (index === currentSlideIndex) selectedSlideRef = el as HTMLElement }"
                :class="[
                  'px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors',
                  index === currentSlideIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                ]"
                @click="jumpToSlide(index); close()"
              >
                <div class="flex items-center gap-2">
                  <Icon
                    v-if="index === currentSlideIndex"
                    name="i-heroicons-check"
                    size="16"
                    class="text-primary-600 flex-shrink-0"
                  />
                  <div v-else class="w-4 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">
                      {{ slide.part_label || `Slide ${index + 1}` }}
                    </div>
                    <div v-if="slide.title" class="text-xs text-gray-500 truncate">
                      {{ slide.title }}
                    </div>
                  </div>
                  <span
                    v-if="isSlideNew(index)"
                    class="px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded-full"
                  >
                    NEW
                  </span>
                </div>
              </div>
            </div>
          </template>
        </UPopover>

        <!-- Next Button -->
        <button
          class="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentSlideIndex === totalSlides - 1"
          @click="nextSlide"
        >
          <Icon name="i-heroicons-chevron-right" size="20" />
        </button>
      </div>

      <!-- Current Slide Display - Fit content, scroll if needed -->
      <div v-if="currentSlide" ref="slideContentRef" class="bg-white rounded-lg p-4 shadow-sm min-h-0 overflow-y-auto">
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
        <div v-if="currentSlide.type === 'question' && currentSlide.question_type === 'mcq' && currentSlide.options?.length" class="mt-4">
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
              <span v-if="containsMath(option.option_text)" v-html="renderInlineMath(option.option_text)" />
              <span v-else>{{ option.option_text }}</span>
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

        <!-- OPEN Question Input -->
        <div v-else-if="currentSlide.type === 'question' && currentSlide.question_type === 'open'" class="mt-4">
          <!-- Show saved answer if exists -->
          <div v-if="currentSlide.userAnswer?.text || currentSlide.markingResult" class="space-y-3">
            <!-- Saved Answer Display -->
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
              <p class="text-gray-800 whitespace-pre-wrap">{{ currentSlide.userAnswer?.text }}</p>
            </div>

            <!-- Marking Feedback -->
            <div
              v-if="currentSlide.markingResult"
              :class="[
                'p-3 rounded-lg',
                currentSlide.markingResult.status === 'correct'
                  ? 'bg-green-50 border border-green-200'
                  : currentSlide.markingResult.status === 'partially_correct'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              ]"
            >
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    currentSlide.markingResult.status === 'correct'
                      ? 'bg-green-200 text-green-800'
                      : currentSlide.markingResult.status === 'partially_correct'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-red-200 text-red-800'
                  ]"
                >
                  {{ currentSlide.markingResult.status === 'correct' ? 'Correct' :
                    currentSlide.markingResult.status === 'partially_correct' ? 'Partially Correct' : 'Incorrect' }}
                </span>
                <span class="text-sm text-gray-600">
                  Score: {{ currentSlide.markingResult.score.awarded }}/{{ currentSlide.markingResult.score.total }}
                </span>
              </div>
              <p v-if="currentSlide.markingResult.feedback?.positive" class="text-sm text-green-700 mb-1">
                <strong>+</strong> {{ currentSlide.markingResult.feedback.positive }}
              </p>
              <p v-if="currentSlide.markingResult.feedback?.gaps" class="text-sm text-amber-700 mb-1">
                <strong>Gaps:</strong> {{ currentSlide.markingResult.feedback.gaps }}
              </p>
              <p v-if="currentSlide.markingResult.feedback?.improvement" class="text-sm text-blue-700">
                <strong>Tip:</strong> {{ currentSlide.markingResult.feedback.improvement }}
              </p>
            </div>
          </div>

          <!-- Input for new answer -->
          <div v-else class="space-y-3">
            <textarea
              v-model="textAnswers[currentSlide.id]"
              maxlength="500"
              class="w-full p-3 border-2 border-gray-200 rounded-lg resize-y min-h-24 focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="Enter your answer here..."
              rows="4"
              :disabled="isSubmitting[currentSlide.id]"
            />
            <div class="flex justify-center">
              <button
                v-if="textAnswers[currentSlide.id]?.trim()"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                :disabled="isSubmitting[currentSlide.id]"
                @click="submitOpenAnswer(currentSlide)"
              >
                <span v-if="isSubmitting[currentSlide.id]" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                {{ isSubmitting[currentSlide.id] ? 'Marking...' : 'Submit Answer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- FILL Question Input -->
        <div v-else-if="currentSlide.type === 'question' && currentSlide.question_type === 'fill'" class="mt-4">
          <!-- Show saved answer if exists -->
          <div v-if="currentSlide.userAnswer?.text || currentSlide.userAnswer?.texts || currentSlide.markingResult" class="space-y-3">
            <!-- Saved Answers Display -->
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-sm font-medium text-gray-600 mb-1">Your Answer(s):</p>
              <div v-if="currentSlide.userAnswer?.texts" class="space-y-1">
                <p v-for="(ans, idx) in currentSlide.userAnswer.texts" :key="idx" class="text-gray-800">
                  {{ idx + 1 }}. {{ ans }}
                </p>
              </div>
              <p v-else class="text-gray-800">{{ currentSlide.userAnswer?.text }}</p>
            </div>

            <!-- Marking Feedback (same as OPEN) -->
            <div
              v-if="currentSlide.markingResult"
              :class="[
                'p-3 rounded-lg',
                currentSlide.markingResult.status === 'correct'
                  ? 'bg-green-50 border border-green-200'
                  : currentSlide.markingResult.status === 'partially_correct'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              ]"
            >
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    currentSlide.markingResult.status === 'correct'
                      ? 'bg-green-200 text-green-800'
                      : currentSlide.markingResult.status === 'partially_correct'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-red-200 text-red-800'
                  ]"
                >
                  {{ currentSlide.markingResult.status === 'correct' ? 'Correct' :
                    currentSlide.markingResult.status === 'partially_correct' ? 'Partially Correct' : 'Incorrect' }}
                </span>
                <span class="text-sm text-gray-600">
                  Score: {{ currentSlide.markingResult.score.awarded }}/{{ currentSlide.markingResult.score.total }}
                </span>
              </div>
              <p v-if="currentSlide.markingResult.feedback?.positive" class="text-sm text-green-700 mb-1">
                <strong>+</strong> {{ currentSlide.markingResult.feedback.positive }}
              </p>
              <p v-if="currentSlide.markingResult.feedback?.gaps" class="text-sm text-amber-700 mb-1">
                <strong>Gaps:</strong> {{ currentSlide.markingResult.feedback.gaps }}
              </p>
              <p v-if="currentSlide.markingResult.feedback?.improvement" class="text-sm text-blue-700">
                <strong>Tip:</strong> {{ currentSlide.markingResult.feedback.improvement }}
              </p>
            </div>
          </div>

          <!-- Input for new answer -->
          <div v-else class="space-y-3">
            <!-- Single blank -->
            <div v-if="!currentSlide.answer || currentSlide.answer.length <= 1">
              <input
                v-model="textAnswers[currentSlide.id]"
                maxlength="500"
                type="text"
                class="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="Fill in the blank..."
                :disabled="isSubmitting[currentSlide.id]"
              >
            </div>
            <!-- Multiple blanks -->
            <div v-else class="space-y-2">
              <div v-for="(answer, index) in currentSlide.answer" :key="answer.id || index" class="flex items-center gap-2">
                <span class="font-medium text-gray-600 w-6">{{ index + 1 }}.</span>
                <input
                  v-model="getFillAnswerArray(currentSlide.id, currentSlide.answer.length)[index]"
                  type="text"
                  class="flex-1 p-2 border-2 border-gray-200 rounded focus:border-primary-500 focus:outline-none transition-colors"
                  :placeholder="`Answer ${index + 1}...`"
                  :disabled="isSubmitting[currentSlide.id]"
                >
              </div>
            </div>
            <div class="flex justify-center">
              <button
                v-if="hasFillAnswer(currentSlide)"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                :disabled="isSubmitting[currentSlide.id]"
                @click="submitFillAnswer(currentSlide)"
              >
                <span v-if="isSubmitting[currentSlide.id]" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                {{ isSubmitting[currentSlide.id] ? 'Marking...' : 'Submit Answer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- BOOLEAN Question Input -->
        <div v-else-if="currentSlide.type === 'question' && currentSlide.question_type === 'boolean'" class="mt-4">
          <div class="flex gap-4">
            <button
              class="flex-1 p-3 rounded-lg border-2 font-medium transition-all"
              :class="{
                'bg-green-50 border-green-500 text-green-700': booleanAnswers[currentSlide.id] === true,
                'hover:bg-green-50 hover:border-green-300 border-gray-200': booleanAnswers[currentSlide.id] !== true
              }"
              @click="selectBoolean(currentSlide.id, true)"
            >
              True
            </button>
            <button
              class="flex-1 p-3 rounded-lg border-2 font-medium transition-all"
              :class="{
                'bg-red-50 border-red-500 text-red-700': booleanAnswers[currentSlide.id] === false,
                'hover:bg-red-50 hover:border-red-300 border-gray-200': booleanAnswers[currentSlide.id] !== false
              }"
              @click="selectBoolean(currentSlide.id, false)"
            >
              False
            </button>
          </div>

          <!-- Check Answer Button -->
          <div class="mt-4 flex justify-center">
            <button
              v-if="booleanAnswers[currentSlide.id] !== undefined && !answeredQuestions[currentSlide.id]"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              @click="checkBooleanAnswer(currentSlide)"
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
                  : 'bg-red-50 border border-red-200'
              ]"
            >
              <p
                :class="[
                  'text-sm font-semibold',
                  answeredQuestions[currentSlide.id]?.markingStatus === 'CORRECT'
                    ? 'text-green-800'
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect, watch, nextTick } from 'vue';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import { useToast } from '#imports';
import { convertHighlights, convertImages } from '~/utils/markdownUtils';
import { renderInlineMath, containsMath } from '~/utils/mathUtils';

const toast = useToast();

interface MarkingResult {
  status: 'correct' | 'partially_correct' | 'incorrect';
  score: { awarded: number; total: number };
  feedback: {
    positive: string;
    gaps: string;
    improvement: string;
  };
  key_concepts_assessed?: string[];
  marking_rationale?: string;
  markedAt?: string;
}

interface UserAnswer {
  text?: string;
  texts?: string[];
  boolean?: boolean;
  submittedAt?: string;
}

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
  userAnswer?: UserAnswer;
  markingResult?: MarkingResult;
}

const props = defineProps<{
  slides: SlideData[];
  initialSlideIndex?: number;
  showThumbnails?: boolean;
  messageId?: string | null;
}>();

const emit = defineEmits(['slide-changed', 'option-selected', 'close-split-view', 'answer-submitted']);

// Responsive state
const isMobile = ref(false);
const panelWidth = ref(480); // Default width in pixels

// Slide navigation
const currentSlideIndex = ref(props.initialSlideIndex || 0);
const showExplanation = ref(false);

// Watch for initialSlideIndex prop changes (when user clicks a specific thumbnail)
watch(() => props.initialSlideIndex, (newIndex) => {
  if (newIndex !== undefined && newIndex !== currentSlideIndex.value) {
    currentSlideIndex.value = newIndex;
    showExplanation.value = false;
    scrollContentToTop();
  }
});

// Question and answer state
const selectedOptions = ref<Record<string, any>>({});
const answeredQuestions = ref<Record<string, { markingStatus: string; feedback: string }>>({});

// Text answer state for OPEN/FILL/BOOLEAN questions
const textAnswers = ref<Record<string, string>>({});
const fillAnswers = ref<Record<string, string[]>>({});
const booleanAnswers = ref<Record<string, boolean | undefined>>({});
const isSubmitting = ref<Record<string, boolean>>({});

// Refs
const slidesPanel = ref<HTMLElement>();
const resizeHandle = ref<HTMLElement>();
const selectedSlideRef = ref<HTMLElement | null>(null);
const slideContentRef = ref<HTMLElement | null>(null);

// Scroll content to top (called on slide change)
function scrollContentToTop() {
  nextTick(() => {
    if (slideContentRef.value) {
      slideContentRef.value.scrollTop = 0;
    }
  });
}

// Scroll to selected slide when dropdown opens
function scrollToSelectedSlide() {
  // Use setTimeout instead of nextTick - ensures v-for items are fully rendered
  setTimeout(() => {
    selectedSlideRef.value?.scrollIntoView({ block: 'center' });
  }, 0);
}

// Dropdown width matches trigger button (panelWidth - padding - buttons - gaps)
// Buttons: 3 x 36px = 108, gaps: 4 x 8px = 32, padding: 2 x 16px = 32
const dropdownWidth = computed(() => `${panelWidth.value - 32 - 108 - 32}px`);

// Track newly added slides for animation
const newSlideIndices = ref<Set<number>>(new Set());
let previousSlidesId: string | null = null;

watch(() => props.slides, (newSlides, oldSlides) => {
  // Detect if this is a completely different slides array (different message)
  const newSlidesId = newSlides?.[0]?.id || null;
  const isNewArray = previousSlidesId !== null && newSlidesId !== previousSlidesId;

  if (isNewArray) {
    // Clear all badges when switching to different slides array
    newSlideIndices.value.clear();
    previousSlidesId = newSlidesId;
    return;
  }

  // Same array, check for new slides added
  const oldLength = oldSlides?.length || 0;
  const newLength = newSlides?.length || 0;

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

  previousSlidesId = newSlidesId;
}, { deep: false });

// Reset slide index when slides array changes to a different set
watch(() => props.slides?.[0]?.id, (newFirstId, oldFirstId) => {
  if (newFirstId && oldFirstId && newFirstId !== oldFirstId) {
    currentSlideIndex.value = 0;
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
  if (isSubmitting.value[currentSlide.value?.id]) {
    toast.add({
      title: 'Please wait',
      description: 'Your answer is being marked. Please wait before navigating.',
      color: 'warning'
    });
    return;
  }
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--;
    showExplanation.value = false;
    scrollContentToTop();
    emit('slide-changed', currentSlideIndex.value);
  }
}

function nextSlide() {
  if (isSubmitting.value[currentSlide.value?.id]) {
    toast.add({
      title: 'Please wait',
      description: 'Your answer is being marked. Please wait before navigating.',
      color: 'warning'
    });
    return;
  }
  if (currentSlideIndex.value < totalSlides.value - 1) {
    currentSlideIndex.value++;
    showExplanation.value = false;
    scrollContentToTop();
    emit('slide-changed', currentSlideIndex.value);
  }
}

function jumpToSlide(index: number) {
  if (isSubmitting.value[currentSlide.value?.id]) {
    toast.add({
      title: 'Please wait',
      description: 'Your answer is being marked. Please wait before navigating.',
      color: 'warning'
    });
    return;
  }
  currentSlideIndex.value = index;
  showExplanation.value = false;
  scrollContentToTop();
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

// Helper to get/initialize fill answers array
function getFillAnswerArray(slideId: string, length: number): string[] {
  if (!fillAnswers.value[slideId]) {
    fillAnswers.value[slideId] = new Array(length).fill('');
  }
  return fillAnswers.value[slideId];
}

// Check if fill answer is complete
function hasFillAnswer(slide: SlideData): boolean {
  if (!slide.answer || slide.answer.length <= 1) {
    return !!textAnswers.value[slide.id]?.trim();
  }
  const answers = fillAnswers.value[slide.id];
  return answers && answers.some((a) => a.trim().length > 0);
}

// Submit OPEN question answer
async function submitOpenAnswer(slide: SlideData) {
  const answer = textAnswers.value[slide.id]?.trim();
  if (!answer || !props.messageId) {
    if (!props.messageId) {
      toast.add({
        title: 'Error',
        description: 'Cannot submit answer: message context not available.',
        color: 'red'
      });
    }
    return;
  }

  isSubmitting.value[slide.id] = true;

  try {
    const response = await $fetch<{ success: boolean; result: MarkingResult }>('/api/chat/slide/mark', {
      method: 'POST',
      body: {
        messageId: props.messageId,
        slideId: slide.id,
        question: {
          id: slide.id,
          question_type: slide.question_type,
          title: slide.title,
          content: slide.content,
          answer: slide.answer,
          explanation: slide.explanation
        },
        userAnswer: answer
      }
    });

    if (response.success) {
      // Update local slide state
      slide.userAnswer = { text: answer, submittedAt: new Date().toISOString() };
      slide.markingResult = response.result;
      showExplanation.value = true;

      emit('answer-submitted', {
        slideId: slide.id,
        answer,
        result: response.result
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to mark your answer. Please try again.',
      color: 'red'
    });
  } finally {
    isSubmitting.value[slide.id] = false;
  }
}

// Submit FILL question answer
async function submitFillAnswer(slide: SlideData) {
  let userAnswer: string | string[];

  if (!slide.answer || slide.answer.length <= 1) {
    userAnswer = textAnswers.value[slide.id]?.trim();
  } else {
    userAnswer = fillAnswers.value[slide.id]?.map((a) => a.trim()).filter((a) => a.length > 0);
  }

  if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0) || !props.messageId) {
    if (!props.messageId) {
      toast.add({
        title: 'Error',
        description: 'Cannot submit answer: message context not available.',
        color: 'red'
      });
    }
    return;
  }

  isSubmitting.value[slide.id] = true;

  try {
    const response = await $fetch<{ success: boolean; result: MarkingResult }>('/api/chat/slide/mark', {
      method: 'POST',
      body: {
        messageId: props.messageId,
        slideId: slide.id,
        question: {
          id: slide.id,
          question_type: slide.question_type,
          title: slide.title,
          content: slide.content,
          answer: slide.answer,
          explanation: slide.explanation
        },
        userAnswer
      }
    });

    if (response.success) {
      // Update local slide state
      slide.userAnswer = {
        text: typeof userAnswer === 'string' ? userAnswer : undefined,
        texts: Array.isArray(userAnswer) ? userAnswer : undefined,
        submittedAt: new Date().toISOString()
      };
      slide.markingResult = response.result;
      showExplanation.value = true;

      emit('answer-submitted', {
        slideId: slide.id,
        answer: userAnswer,
        result: response.result
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to mark your answer. Please try again.',
      color: 'red'
    });
  } finally {
    isSubmitting.value[slide.id] = false;
  }
}

// Select boolean answer
function selectBoolean(slideId: string, value: boolean) {
  booleanAnswers.value[slideId] = value;

  // Clear previous answer to allow retry (same pattern as MCQ selectOption)
  if (answeredQuestions.value[slideId]) {
    answeredQuestions.value[slideId] = undefined as any;
  }
}

// Check BOOLEAN question answer (local check like MCQ - no API call needed)
function checkBooleanAnswer(slide: SlideData) {
  const selectedBoolean = booleanAnswers.value[slide.id];
  if (selectedBoolean === undefined) return;

  // Check answer locally against correct answer from JSON
  const correctAnswer = slide.answer?.[0]?.answer_boolean;
  const markingStatus = (selectedBoolean === correctAnswer) ? 'CORRECT' : 'INCORRECT';

  // Update answeredQuestions state (same pattern as MCQ)
  answeredQuestions.value[slide.id] = {
    markingStatus,
    feedback: markingStatus === 'CORRECT' ? '✅ Correct!' : '❌ Incorrect. Try again!'
  };

  // Show explanation if available
  if (slide.explanation) {
    showExplanation.value = true;
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

  const container = slidesPanel.value?.parentElement;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  // Calculate width from right edge
  const newWidth = containerRect.right - e.clientX;

  // Constrain between 320px and 1200px
  panelWidth.value = Math.min(Math.max(newWidth, 320), 1200);
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

// Check if any submission is in progress
const isAnySubmitting = computed(() => {
  return Object.values(isSubmitting.value).some((v) => v);
});

// Warn user before leaving page during submission
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (isAnySubmitting.value) {
    e.preventDefault();
    e.returnValue = 'Your answer is being marked. Are you sure you want to leave?';
    return e.returnValue;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('keydown', handleKeyPress);
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// Expose state for parent component navigation guards
defineExpose({
  isAnySubmitting
});
</script>
