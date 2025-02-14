<template>
  <div class="app-container grid grid-cols-1 md:grid-cols-2 gap-4">
    <ULink
        class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-blue-600 transition duration-300 ease-in-out px-6 py-3 rounded-lg"
        to="/parent"
    >
      Are you a parent?
    </ULink>
    <ULink
        class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-yellow-300 transition duration-300 ease-in-out px-6 py-3 rounded-lg"
        to="/child"
    >
      Are you a child?
    </ULink>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import QuizPage from '~/components/challenge/QuizPage.vue';
import { useGetGenerativeModelGP } from '~/composables/useGetGenerativeModelGP.js';
import data from '../../assets/questions.json';
import { useCreditStore } from "~/stores/credit"; // Import your store

export default {
  components: { QuizPage },
  setup() {
    const quiz = ref(null);
    const isLoading = ref(false);
    const selectedLevel = ref('');
    const selectedInnerLevel = ref('');
    const selectedSubject = ref('');
    const numberInput = ref(null);
    const errorMsg = ref(null);
    let credits = ref(0);
    const creditStore = useCreditStore();

    const levels = ['Primary', 'Secondary', 'Junior College'];
    const primaryLvls = [1, 2, 3, 4, 5, 6];
    const secondaryLvls = [1, 2, 3, 4];
    const jcLvls = [1, 2];
    const primarySubjects = ['Math', 'Science', 'English'];
    const secondarySubjects = ['Elementary Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Social Studies'];
    const jcSubjects = ['H1 Math', 'H2 Math', 'H1 Physics', 'H2 Physics', 'H1 Chemistry', 'H2 Chemistry', 'H1 Biology', 'H2 Biology', 'H1 General Paper', 'H1 History', 'H2 History', 'H1 Geography', 'H2 Geography', 'H1 Economics', 'H2 Economics'];

    const filteredInnerLevels = computed(() => {
      switch (selectedLevel.value) {
        case 'Primary': return primaryLvls;
        case 'Secondary': return secondaryLvls;
        case 'Junior College': return jcLvls;
        default: return [];
      }
    });

    const filteredSubjects = computed(() => {
      switch (selectedLevel.value) {
        case 'Primary': return primarySubjects;
        case 'Secondary': return secondarySubjects;
        case 'Junior College': return jcSubjects;
        default: return [];
      }
    });

    const createPrompt = (numberInput, selectedLevel, selectedInnerLevel, selectedSubject) => {
      if (import.meta.client && window.gtag) {
        window.gtag('event', 'user-action', {
          event_category: 'select-prompt',
          event_label: 'prompt',
          numberInput,
          selectedLevel,
          selectedInnerLevel,
          selectedSubject,
        });
      }
      return `From the Singapore syllabus, how would you as an examiner create ${numberInput} multiple choice questions
      of 4 options of the ${selectedLevel} ${selectedInnerLevel} ${selectedSubject} topic with varying difficulties.
      Ensure there are questions with options such as "statement 1, 2, 3 are true" or "all of the above are true".
      Provide detailed but concise steps on how to achieve the correct solution in the explanation.
      Ensure that there must be a correct answer and only one correct answer for correctAnswer.
      Ensure the correctAnswer is one of the option in the options array in the JSON schema for each question.
      Ensure that the correctAnswer is given in full and is the same as one of the options in the options array.`;
    };

    const fetchAnswer = async () => {
      isLoading.value = true;
      quiz.value = '';
      errorMsg.value = null;

      const prompt = createPrompt(numberInput.value, selectedLevel.value, selectedInnerLevel.value, selectedSubject.value);

      try {
        //quiz.value = await useGetGenerativeModelGP(prompt);
        quiz.value = getRandomizedQuestions(data, numberInput.value);
        saveInputToLocalStorage();
        if (quiz.value && quiz.value.length > 0) {
          //saveQuestionsToLocalStorage(quiz.value);
        } else {
          throw new Error('Exceeded limit');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        if (error.message === 'Exceeded limit') {
          errorMsg.value = 'Exceeded limit: Unable to generate questions. Please try again later.';
        } else {
          errorMsg.value = 'An error occurred while generating the quiz.';
        }
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
        numberInput: numberInput.value
      };
      localStorage.setItem('lastUsedInputs', JSON.stringify(dataToSave));
    };

    const saveQuestionsToLocalStorage = (questions) => {
      localStorage.setItem('savedQuestions', JSON.stringify(questions));
    };

    const loadFromLocalStorage = () => {
      errorMsg.value = null;
      const savedData = localStorage.getItem('lastUsedInputs');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        selectedLevel.value = parsedData.selectedLevel || '';
        selectedInnerLevel.value = parsedData.selectedInnerLevel || '';
        selectedSubject.value = parsedData.selectedSubject || '';
        numberInput.value = parsedData.numberInput || null;
      }
      /*
      const savedQuestions = localStorage.getItem('savedQuestions');
      if (savedQuestions) {
        quiz.value = JSON.parse(savedQuestions);
      }
       */
    };
    const updateCredits = (newCredits) => {
      credits.value = parseInt(localStorage.getItem('credits')) + newCredits;
      localStorage.setItem('credits', credits.value); // Update local storage again just in case.
    };

    onMounted(() => {
      loadFromLocalStorage();
      credits.value = creditStore.count || 0
    });

    watch([selectedLevel, selectedInnerLevel, selectedSubject, numberInput], () => {
      saveInputToLocalStorage();
    });

    return {
      quiz,
      isLoading,
      selectedLevel,
      selectedInnerLevel,
      selectedSubject,
      numberInput,
      levels,
      filteredInnerLevels,
      filteredSubjects,
      credits,
      fetchAnswer,
      updateCredits
    };
  }
};
</script>

<style lang="scss" scoped>
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 1rem;
  min-height: calc(100vh - 3.5rem);
}
</style>
