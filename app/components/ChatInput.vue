<template>
  <div class="flex flex-col gap-3 relative">
    <!-- Input container -->
    <div class="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
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
            isSending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-blue-700 text-white'
          ]"
          :disabled="isSending"
          @click="emitMessage"
        >
          <Icon
            :name="isSending ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
            :class="['w-5 h-5', isSending ? 'animate-spin text-white' : '']"
          />
        </button>
      </div>
    </div>

    <!-- Suggestions - only show on new chat, fade out when typing -->
    <div v-if="showSuggestions" :class="['flex flex-wrap gap-2 transition-opacity duration-200', shouldShowPills ? 'opacity-100' : 'opacity-0 pointer-events-none']">
      <!-- Lesson Pill -->
      <button
        class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-stone-100 hover:border-gray-300 transition-colors flex items-center gap-1"
        @click="toggleDropdown('lesson', $event)"
      >
        Give me a lesson on...
        <Icon name="i-heroicons-chevron-down" class="w-3 h-3" />
      </button>

      <!-- Quiz Pill -->
      <button
        class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-stone-100 hover:border-gray-300 transition-colors flex items-center gap-1"
        @click="toggleDropdown('quiz', $event)"
      >
        Quiz me on...
        <Icon name="i-heroicons-chevron-down" class="w-3 h-3" />
      </button>

      <!-- Homework (no dropdown) -->
      <button
        class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-stone-100 hover:border-gray-300 transition-colors"
        @click="appendText('Help me with my schoolwork on ')"
      >
        Help me with my schoolwork on...
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

const props = defineProps({
  showSuggestions: {
    type: Boolean,
    default: true,
  },
  subject: {
    type: String,
    default: 'GENERAL',
  },
});

const emit = defineEmits(['send']);
const input = ref('');
const toast = useToast();

// Hide pills when input has 5+ chars or multiple lines
const shouldShowPills = computed(() => input.value.length < 5 && !input.value.includes('\n'));
const isSending = ref(false);
const DEBOUNCE_MS = 2000; // 2 second cooldown to prevent spam

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
  if (!input.value.trim() || isSending.value) return;

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
