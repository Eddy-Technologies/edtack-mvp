<template>
  <div class="flex flex-col gap-3 relative">
    <!-- Input container -->
    <div class="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
      <!-- Keyword hint -->
      <p class="text-sm text-gray-400 text-center mb-2">
        Use keywords <span class="font-medium text-primary">"lesson"</span> or
        <span class="font-medium text-secondary">"quiz"</span> to generate interactive content
      </p>

      <div class="flex items-center gap-2">
        <UTextarea
          v-model="input"
          placeholder="How can I help you today?"
          :maxlength="1000"
          :rows="2"
          :autoresize="true"
          :resize="false"
          class="flex-1"
          style="max-height: 7.5rem; font-size: 16px;"
          textarea-class="text-gray-600 focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          @keydown.enter="handleEnterKey"
        />
        <button
          :class="[
            'p-3 rounded-lg transition-colors duration-200 flex items-center justify-center',
            isDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-blue-700 text-white'
          ]"
          :disabled="isDisabled"
          @click="emitMessage"
        >
          <Icon
            :name="isDisabled ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
            :class="['w-5 h-5', isDisabled ? 'animate-spin text-white' : '']"
          />
        </button>
      </div>
    </div>

    <!-- Suggestions - only show on new chat, fade out when typing -->
    <div v-if="showSuggestions" :class="['flex flex-wrap gap-2 transition-opacity duration-200', shouldShowPills ? 'opacity-100' : 'opacity-0 pointer-events-none']">
      <!-- Lesson Pill -->
      <button
        :class="[
          'text-white bg-primary border border-gray-200 rounded-xl hover:bg-primary-400 hover:border-gray-300 active:bg-primary-500 transition-colors flex items-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :title="isMobile ? 'Give me a lesson on...' : undefined"
        @click="toggleDropdown('lesson', $event)"
      >
        <Icon v-if="isMobile" name="i-lucide-book-open" class="w-5 h-5" />
        <template v-else>
          Give me a lesson on...
          <Icon name="i-heroicons-chevron-down" class="w-3 h-3" />
        </template>
      </button>

      <!-- Quiz Pill -->
      <button
        :class="[
          'text-white bg-secondary border border-gray-200 rounded-xl hover:bg-secondary-400 hover:border-gray-300 active:bg-secondary-500 transition-colors flex items-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :title="isMobile ? 'Quiz me on...' : undefined"
        @click="toggleDropdown('quiz', $event)"
      >
        <Icon v-if="isMobile" name="i-lucide-clipboard-list" class="w-5 h-5" />
        <template v-else>
          Quiz me on...
          <Icon name="i-heroicons-chevron-down" class="w-3 h-3" />
        </template>
      </button>

      <!-- Homework (no dropdown) -->
      <button
        :class="[
          'text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-stone-100 hover:border-gray-300 active:bg-stone-200 transition-colors flex items-center justify-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm'
        ]"
        :title="isMobile ? 'Help me with my schoolwork on...' : undefined"
        @click="appendText('Help me with my schoolwork on ')"
      >
        <Icon v-if="isMobile" name="i-lucide-life-buoy" class="w-5 h-5" />
        <span v-else>Help me with my schoolwork on...</span>
      </button>
    </div>

    <!-- Dropdown menus (positioned relative to parent container) -->
    <div
      v-if="openDropdown === 'lesson'"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
      @click.stop
    >
      <button
        v-for="(suggestion, index) in currentSuggestions.lesson"
        :key="index"
        class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <div
      v-if="openDropdown === 'quiz'"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
      @click.stop
    >
      <button
        v-for="(suggestion, index) in currentSuggestions.quiz"
        :key="index"
        class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useResponsive } from '~/composables/useResponsive';

const { isMobile } = useResponsive();

const props = defineProps({
  showSuggestions: {
    type: Boolean,
    default: true,
  },
  subject: {
    type: String,
    default: 'GENERAL',
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['send']);
const input = ref('');
const toast = useToast();

// Hide pills when input has 5+ chars or multiple lines
const shouldShowPills = computed(() => input.value.length < 5 && !input.value.includes('\n'));
const isSending = ref(false);
const DEBOUNCE_MS = 2000; // 2 second cooldown to prevent spam

// Combined disabled state: local debounce OR parent processing state
const isDisabled = computed(() => isSending.value || props.isProcessing);

const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();

// Reset sending state (can be called by parent when response received)
const resetSendState = () => {
  isSending.value = false;
};

// Expose methods for parent component
defineExpose({ resetSendState });

// Hardcoded suggestions by subject
const subjectSuggestions: Record<string, { lesson: string[]; quiz: string[] }> = {
  BIOLOGY: {
    lesson: [
      'Give me a lesson on photosynthesis and chlorophyll',
      'Give me a lesson on the human digestive system',
      'Give me a lesson on cell division and mitosis',
    ],
    quiz: [
      'Quiz me on the parts of a plant cell',
      'Quiz me on the respiratory system',
      'Quiz me on DNA and genetics',
    ],
  },
  CHEMISTRY: {
    lesson: [
      'Give me a lesson on the periodic table',
      'Give me a lesson on chemical bonding',
      'Give me a lesson on acids and bases',
    ],
    quiz: [
      'Quiz me on balancing chemical equations',
      'Quiz me on atomic structure',
      'Quiz me on oxidation and reduction',
    ],
  },
  PHYSICS: {
    lesson: [
      'Give me a lesson on Newton\'s laws of motion',
      'Give me a lesson on electricity and circuits',
      'Give me a lesson on waves and sound',
    ],
    quiz: [
      'Quiz me on forces and motion',
      'Quiz me on energy and work',
      'Quiz me on light and optics',
    ],
  },
  GENERAL: {
    lesson: [
      'Give me a lesson on a topic of your choice',
      'Give me a lesson on study techniques',
      'Give me a lesson on time management',
    ],
    quiz: [
      'Quiz me on general knowledge',
      'Quiz me on something fun',
      'Quiz me on a random topic',
    ],
  },
};

// Dropdown state
const openDropdown = ref<string | null>(null);

const toggleDropdown = (key: string, event: MouseEvent) => {
  event.stopPropagation();
  openDropdown.value = openDropdown.value === key ? null : key;
};

const closeDropdown = () => {
  openDropdown.value = null;
};

const selectSuggestion = (text: string) => {
  input.value = text;
  closeDropdown();
};

const currentSuggestions = computed(() => {
  return subjectSuggestions[props.subject] || subjectSuggestions.GENERAL;
});

// Click outside handler
const handleClickOutside = () => {
  closeDropdown();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();
  emitMessage();
};

const emitMessage = async () => {
  if (!input.value.trim() || isDisabled.value) return;

  // Check token limit - show toast if exceeded but allow action (soft limit)
  await fetchTokenUsage();

  if (isLimitExceeded.value) {
    toast.add({
      title: 'Token limit reached',
      description: 'You have exceeded your token limit for this billing period.',
      color: 'red',
      timeout: 5000
    });
  }

  // Set sending state to prevent spam clicks
  isSending.value = true;

  // Proceed with message (soft limit - always allow)
  emit('send', input.value);
  input.value = '';

  // Auto-reset after cooldown (in case parent doesn't call resetSendState)
  setTimeout(() => {
    isSending.value = false;
  }, DEBOUNCE_MS);
};

const appendText = (text: string) => {
  input.value = text;
};
</script>
