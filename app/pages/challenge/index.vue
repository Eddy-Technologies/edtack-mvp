<template>
  <div class="generate-challenge">
    <AppHeader />
    <main class="main-content">
      <div class="quiz-container">
        <h2 class="title text-primary">Challenge</h2>
        <QuizPage @quiz-submitted="updateCredits" :quiz="quiz" />
      </div>
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import QuizPage from '~/components/challenge/QuizPage.vue';
import data from '../../../assets/questions.json';
import {onBeforeMount} from "@vue/runtime-core";
import { useCreditStore } from "~/stores/credit"; // Import your store

export default {
  components: { QuizPage },
  setup() {
    const quiz = ref(null);
    const isLoading = ref(false);
    const creditStore = useCreditStore();

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

    const updateCredits = (newCredits) => {
      creditStore.childCredits[0] += newCredits;
    };

    onBeforeMount(() => {
      quiz.value = getRandomizedQuestions(data, 10);
    });

    return {
      quiz,
      isLoading,
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
  top: 1.5rem;
  z-index: 10;
  border-radius: 0;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.5rem;
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
