<template>
  <div class="generate-challenge">
    <AppHeader />
    <main :class="{ 'centered-bg': !quiz }" class="main-content">
      <div :class="{ 'compact-form': quiz, 'centered-form': !quiz }" class="form-container bg-gray-600/50 dark:bg-zinc-900/50">
        <h1 v-if="!quiz" class="title">
          <span class="title-highlight">Generate Your Practice</span>
        </h1>

        <form :class="{ 'challenge-form': !quiz, 'compact-challenge-form': quiz }" @submit.prevent="fetchAnswer">
          <div v-if="!quiz" class="form-grid">
            <div class="form-group">
              <label for="level" class="form-label">Level</label>
              <select id="level" v-model="selectedLevel" class="form-control bg-gray-100/70 dark:bg-zinc-800/70">
                <option value="" disabled>Select Level</option>
                <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="innerLevel" class="form-label">Inner Level</label>
              <select id="innerLevel" v-model="selectedInnerLevel" class="form-control bg-gray-100/70 dark:bg-zinc-800/70">
                <option value="" disabled>Select Inner Level</option>
                <option v-for="innerLevel in filteredInnerLevels" :key="innerLevel" :value="innerLevel">
                  {{ innerLevel }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="subject" class="form-label">Subject</label>
              <select id="subject" v-model="selectedSubject" class="form-control bg-gray-100/70 dark:bg-zinc-800/70">
                <option value="" disabled>Select Subject</option>
                <option v-for="subject in filteredSubjects" :key="subject" :value="subject">{{ subject }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="numberInput" class="form-label">Questions</label>
              <input
                  id="numberInput"
                  v-model="numberInput"
                  type="number"
                  class="form-control bg-gray-100/70 dark:bg-zinc-800/70 border border-gray-300 dark:border-zinc-600"
                  min="1"
                  max="99"
                  placeholder="Enter a number"
                  @input="validateInput"
              >
              <div v-if="errorMsg" class="text-danger">
                {{ errorMsg }}
              </div>
            </div>
          </div>

          <div v-if="quiz" class="compact-inputs">
            <div class="form-group">
              <label for="level" class="compact-label">Level</label>
              <select id="level" v-model="selectedLevel" class="compact-control">
                <option value="" disabled>Select Level</option>
                <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="innerLevel" class="compact-label">Inner Level</label>
              <select id="innerLevel" v-model="selectedInnerLevel" class="compact-control">
                <option value="" disabled>Select Inner Level</option>
                <option v-for="innerLevel in filteredInnerLevels" :key="innerLevel" :value="innerLevel">
                  {{ innerLevel }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="subject" class="compact-label">Subject</label>
              <select id="subject" v-model="selectedSubject" class="compact-control">
                <option value="" disabled>Select Subject</option>
                <option v-for="subject in filteredSubjects" :key="subject" :value="subject">{{ subject }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="numberInput" class="compact-label">Questions</label>
              <input
                  id="numberInput"
                  v-model="numberInput"
                  type="number"
                  class="compact-control"
                  min="1"
                  placeholder="#"
              >
            </div>
          </div>

          <button
              type="submit"
              :disabled="!selectedLevel || !selectedSubject || !numberInput || isLoading"
              :class="{ 'large-button': !quiz, 'compact-button': quiz }"
              class="submit-button"
          >
            {{ isLoading ? 'Generating...' : 'Generate' }}
          </button>
        </form>

        <div v-if="quiz" class="current-challenge-info">
          <p>Current challenge: {{ selectedLevel }} {{ selectedInnerLevel }} {{ selectedSubject }} ({{ numberInput }} questions)</p>
          <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>
        </div>
      </div>

      <div v-if="quiz" class="quiz-container">
        <QuizPage @quiz-submitted="updateCredits" :quiz="quiz" />
      </div>
    </main>
    <!-- <AppFooter /> -->
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import QuizPage from '~/components/challenge/QuizPage.vue';
import {useGetQuestionModelGP} from '~/composables/useGetQuestionModelGP.js';
import data from '../../../assets/questions.json';
import {useGetOptionModelGP} from "~/composables/useGetOptionModelGP.js";

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
      of the ${selectedLevel} ${selectedInnerLevel} ${selectedSubject} topic with varying difficulties.
      Provide a JSON of just what is declared in the schema, which is the question, explanation and the id without the question options.
      Generate questions of a mixture of topics and difficulties from the syllabus but do not include image related questions.
      Generate a fresh batch of questions that is different from the previous batch.
      Ensure there is no error in the question.
      Provide the most accurate and precise explanation to solve the question and then
      provide a concise summary on the steps to achieve the correct solution.
      Do not use $...$ delimiters for math equations.
      Always use Katex format $$...$$ as delimiters for all math equations.`
    };

    const fetchAnswer = async () => {
      isLoading.value = true;
      quiz.value = '';
      errorMsg.value = null;

      const questionPrompt = createPrompt(numberInput.value, selectedLevel.value, selectedInnerLevel.value, selectedSubject.value);

      try {
        const result = await useGetQuestionModelGP(questionPrompt);
        const optionPrompt = `With this JSON result ${result},
        Copy the correct answer in the explanation and insert it into the options array.
        Ensure that the correct answer is based on the explanation.
        Ensure that the correct answer is also one of the options.
        Do not use $...$ delimiters for math equations.
        Always use Katex format $$...$$ as delimiters for all math and scientific equations for all questions and options.
        Ensure that there is no error in the question and the options.
        Ensure that there is only one correct answer for correctAnswer.
        Ensure that the correct answer is the value of the option and not using alphabets.
        Ensure that the response only contains the json schema`;
        quiz.value = await useGetOptionModelGP(optionPrompt);
        //quiz.value = getRandomizedQuestions(data, numberInput.value);
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
      credits.value = parseInt(localStorage.getItem('credits')) || 0
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
  backdrop-filter: blur(10px);
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
}

.centered-bg {
  background-image: url('../../../assets/practice2.png'); /* Update with the correct path */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.centered-form {
  width: 100%;
  max-width: 27rem;
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
}

.title-highlight {
  color: #c8e6ce;
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
  font-size: 1rem;
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem;
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
  font-size: 1rem;
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
  background-color: #c8e6ce;
  color: black;
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
  margin: 1rem auto 0;
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
