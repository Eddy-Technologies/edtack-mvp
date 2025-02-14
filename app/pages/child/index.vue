<template>
  <div class="home">
    <AppHeader />
    <main class="main-content flex items-center justify-center h-screen">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-blue-600 transition duration-300 ease-in-out px-6 py-3 rounded-lg"
            to="/challenge"
            style="display: flex; flex-direction: column; justify-content: flex-start;"
        >
          Challenge Yourself
          <span class="credits-amount text-sm" style="margin-top: auto;">Earn up to 10 credits</span>
        </ULink>
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-blue-600 transition duration-300 ease-in-out px-6 py-3 rounded-lg"
            to="/practice"
            style="display: flex; flex-direction: column; justify-content: flex-start;"
        >
          Practice
          <span class="credits-amount text-sm" style="margin-top: auto;">Try a sample challenge</span>
        </ULink>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import QuizPage from '~/components/challenge/QuizPage.vue';
import { useGetGenerativeModelGP } from '~/composables/useGetGenerativeModelGP.js';
import data from '../../../assets/questions.json';
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
.generate-challenge {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 1rem;
  min-height: calc(100vh - 3.5rem);
}

.form-container {
  width: 100%;
  max-width: 64rem;
  background-color: rgba(42, 42, 42, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
}

.centered-form {
  margin: auto;
  padding: 2rem;
}

.compact-form {
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  position: sticky;
  top: 3.5rem;
  z-index: 10;
  border-radius: 0;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
}

.title-highlight {
  color: #4a90e2;
}

.challenge-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-challenge-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem;
  font-size: 1rem;
  color: #e0e0e0;
  background-color: rgba(58, 58, 58, 0.7);
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.compact-inputs {
  display: flex;
  gap: 0.5rem;
  flex-grow: 1;
}

.compact-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 0.25rem;
}

.compact-control {
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #e0e0e0;
  background-color: rgba(58, 58, 58, 0.7);
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .compact-control:focus {
  border-color: #4a90e2;
  outline: 0;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.25);
}

.submit-button {
  background-color: #4a90e2;
  color: white;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, transform 0.1s ease-in-out;
}

.large-button {
  font-size: 1.25rem;
  padding: 1rem 2rem;
}

.compact-button {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #3a80d2;
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-challenge-info {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #b0b0b0;
}

.quiz-container {
  width: 100%;
  max-width: 64rem;
  margin: 2rem auto 0;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 2rem;
  }

  .compact-challenge-form {
    flex-direction: column;
    align-items: stretch;
  }

  .compact-inputs {
    flex-direction: column;
  }

  .submit-button {
    width: 100%;
  }
}

.error-message {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 0.5rem;
}
</style>
