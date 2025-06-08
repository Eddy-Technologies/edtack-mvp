<template>
  <div class="generate-challenge min-h-screen bg-white text-zinc-900 relative">
    <AppHeader />
    <Loading v-if="isLoading" />

    <main class="relative z-10 flex items-center justify-center min-h-screen px-4 py-10 md:py-16">
      <img
        :src="background"
        class="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        alt="practice"
      >
      <div
        class="max-w-xl w-full bg-white/90 p-6 rounded-2xl shadow-xl ring-1 ring-black/5 backdrop-blur-md space-y-6 transition-all duration-300 ease-in-out"
      >
        <h1 class="text-2xl md:text-4xl font-bold text-center mb-8">
          <span class="text-primary">Generate Your Practice</span>
        </h1>

        <form class="flex flex-col gap-4" @submit.prevent="fetchAnswer">
          <div>
            <label for="level" class="block text-sm font-medium text-primary mb-1">Level</label>
            <select
              id="level"
              v-model="selectedLevel"
              class="w-full rounded-md border border-gray-300 bg-gray-100/70 px-3 py-2"
            >
              <option value="" disabled>Select Level</option>
              <option v-for="level in levels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="innerLevel"
              class="block text-sm font-medium text-primary mb-1"
            >Inner Level</label>
            <select
              id="innerLevel"
              v-model="selectedInnerLevel"
              class="w-full rounded-md border border-gray-300 bg-gray-100/70 px-3 py-2"
            >
              <option value="" disabled>Select Inner Level</option>
              <option
                v-for="innerLevel in filteredInnerLevels"
                :key="innerLevel"
                :value="innerLevel"
              >
                {{ innerLevel }}
              </option>
            </select>
          </div>

          <div>
            <label for="subject" class="block text-sm font-medium text-primary mb-1">Subject</label>
            <select
              id="subject"
              v-model="selectedSubject"
              class="w-full rounded-md border border-gray-300 bg-gray-100/70 px-3 py-2"
            >
              <option value="" disabled>Select Subject</option>
              <option v-for="subject in filteredSubjects" :key="subject" :value="subject">
                {{ subject }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="topic"
              class="block text-sm font-medium text-primary mb-1"
            >Topic (Optional)</label>
            <select
              id="topic"
              v-model="selectedTopic"
              :disabled="topics.length <= 0"
              class="w-full rounded-md border border-gray-300 bg-gray-100/70 px-3 py-2"
            >
              <option value="">Select Topic (Optional)</option>
              <option v-for="topic in topics" :key="topic" :value="topic">
                {{ topic }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="numberInput"
              class="block text-sm font-medium text-primary mb-1"
            >Questions</label>
            <select
              id="numberInput"
              v-model="numberInput"
              class="w-full rounded-md border border-gray-300 bg-gray-100/70 px-3 py-2"
            >
              <option value="" disabled>Select Number of Questions</option>
              <option v-for="option in numberInputOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <div v-if="errorMsg" class="text-red-600 text-sm mt-1">
              {{ errorMsg }}
            </div>
          </div>

          <div class="sm:col-span-2 lg:col-span-4 text-center pt-4">
            <button
              type="submit"
              :disabled="!selectedLevel || !selectedSubject || !numberInput || isLoading"
              class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {{ isLoading ? 'Generating' + loadingText : 'Generate' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import mathSyllabus from '../../../assets/primary-math-syllabus.json';
import scienceSyllabus from '../../../assets/primary-science-syllabus.json';
import background from '../../../assets/practice2.png';
import Loading from '~/components/common/Loading.vue';
import AppHeader from '~/components/AppHeader.vue';
import { useCreditStore } from '~/stores/credit';
import { useQuizStore } from '~/stores/quiz';

const router = useRouter();
const isLoading = ref(false);
const selectedLevel = ref('');
const selectedInnerLevel = ref('');
const selectedSubject = ref('');
const selectedTopic = ref('');
const numberInput = ref(10);
const errorMsg = ref<string | null>(null);
const loadingText = ref('');
let dotInterval: ReturnType<typeof setInterval> | null = null;

const levels = ['Primary', 'Secondary', 'Junior College'];
const primaryLvls = [1, 2, 3, 4, 5, 6];
const secondaryLvls = [1, 2, 3, 4];
const jcLvls = [1, 2];
const primarySubjects = ['Math', 'Science', 'English'];
const secondarySubjects = [
  'Elementary Mathematics',
  'Additional Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Social Studies',
];
const jcSubjects = [
  'H1 Math',
  'H2 Math',
  'H1 Physics',
  'H2 Physics',
  'H1 Chemistry',
  'H2 Chemistry',
  'H1 Biology',
  'H2 Biology',
  'H1 General Paper',
  'H1 History',
  'H2 History',
  'H1 Geography',
  'H2 Geography',
  'H1 Economics',
  'H2 Economics',
];
const numberInputOptions = [5, 10];

const creditStore = useCreditStore();
const quizStore = useQuizStore();

const filteredInnerLevels = computed(() => {
  switch (selectedLevel.value) {
    case 'Primary':
      return primaryLvls;
    case 'Secondary':
      return secondaryLvls;
    case 'Junior College':
      return jcLvls;
    default:
      return [];
  }
});

const topics = computed(() => {
  if (selectedLevel.value === 'Primary' && selectedInnerLevel.value) {
    const innerLevelKey = `P${selectedInnerLevel.value}`;
    if (selectedSubject.value === 'Math') {
      return mathSyllabus[innerLevelKey] || [];
    }
    if (selectedSubject.value === 'Science') {
      return scienceSyllabus[innerLevelKey] || [];
    }
  }
  return [];
});

const filteredSubjects = computed(() => {
  switch (selectedLevel.value) {
    case 'Primary':
      return primarySubjects;
    case 'Secondary':
      return secondarySubjects;
    case 'Junior College':
      return jcSubjects;
    default:
      return [];
  }
});

const fetchAnswer = async () => {
  isLoading.value = true;
  quizStore.setQuiz(null);
  errorMsg.value = null;

  if (import.meta.client && window.gtag) {
    window.gtag('event', 'user-action', {
      event_category: 'select-prompt',
      event_label: 'prompt',
      numberInput: numberInput.value,
      selectedLevel: selectedLevel.value,
      selectedInnerLevel: selectedInnerLevel.value,
      selectedSubject: selectedSubject.value,
      selectedTopic: selectedTopic.value,
    });
  }

  saveInputToLocalStorage();

  try {
    const quiz = await $fetch('/api/questions', {
      method: 'post',
      body: {
        numberInput: numberInput.value,
        selectedLevel: selectedLevel.value,
        selectedInnerLevel: selectedInnerLevel.value,
        selectedSubject: selectedSubject.value,
        selectedTopic: selectedTopic.value,
      },
    });

    quizStore.setQuiz(quiz.questions);
    router.push('practice');
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    errorMsg.value =
      error?.message === 'Exceeded limit' ?
        'Exceeded limit: Unable to generate questions. Please try again later.' :
        'An error occurred while generating the quiz.';
  } finally {
    isLoading.value = false;
  }
};
const getRandomizedQuestions = (data, numberOfQuestions) => {
  // Step 1: Randomize the questions array
  const shuffledQuestions = shuffleArray(data);

  // Step 2: Slice the array to get the desired number of questions
  return shuffledQuestions.slice(0, numberOfQuestions);
};

const shuffleArray = (array) => {
  // Fisher-Yates algorithm to shuffle the array
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap
  }
  return array;
};

const saveInputToLocalStorage = () => {
  const dataToSave = {
    selectedLevel: selectedLevel.value,
    selectedInnerLevel: selectedInnerLevel.value,
    selectedSubject: selectedSubject.value,
    numberInput: numberInput.value,
    selectedTopic: selectedTopic.value,
  };
  localStorage.setItem('lastUsedInputs', JSON.stringify(dataToSave));
};

const loadFromLocalStorage = () => {
  errorMsg.value = null;
  const savedData = localStorage.getItem('lastUsedInputs');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    selectedLevel.value = parsedData.selectedLevel || '';
    selectedInnerLevel.value = parsedData.selectedInnerLevel || '';
    selectedSubject.value = parsedData.selectedSubject || '';
    numberInput.value = parsedData.numberInput || 10;
    selectedTopic.value = parsedData.selectedTopic || '';
  }
};

onMounted(() => {
  loadFromLocalStorage();
});

watch(isLoading, (newVal) => {
  if (newVal) {
    let dotCount = 0;
    dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      loadingText.value = '.'.repeat(dotCount);
    }, 500);
  } else {
    loadingText.value = '';
    if (dotInterval) clearInterval(dotInterval);
  }
});

watch(selectedLevel, () => {
  selectedTopic.value = '';
});

watch(selectedInnerLevel, () => {
  selectedTopic.value = '';
});

watch(selectedSubject, () => {
  selectedTopic.value = '';
});
</script>
