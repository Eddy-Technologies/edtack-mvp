<template>
  <div class="flex flex-col min-h-screen bg-gray-100 dark:bg-zinc-800">
    <AppHeader />

    <main class="flex-grow flex flex-col items-center p-4 min-h-[calc(100vh-3.5rem)]">
      <div class="w-full max-w-6xl mt-4">
        <h2 class="text-3xl font-extrabold text-primary text-center mb-4">Challenge</h2>
        <QuizPage :quiz="quiz" @quiz-submitted="updateCredits" />
      </div>
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue';
import data from '../../../assets/questions.json';
import QuizPage from '~/components/challenge/QuizPage.vue';
import { useCreditStore } from '~/stores/credit';

const quiz = ref(null);
const isLoading = ref(false);
const creditStore = useCreditStore();

const getRandomizedQuestions = (data: any[], numberOfQuestions: number) => {
  const shuffled = shuffleArray([...data]);
  return shuffled.slice(0, numberOfQuestions);
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const updateCredits = (newCredits: number) => {
  const updatedCredits = [...creditStore.childCredits];
  updatedCredits[0] += newCredits * 10;
  creditStore.childCredits = updatedCredits;
};

onBeforeMount(() => {
  quiz.value = getRandomizedQuestions(data, 10);
});
</script>
