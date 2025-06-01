<template>
  <div class="relative flex flex-col min-h-screen bg-gray-100">
    <AppHeader />

    <!-- Fullscreen overlay within the parent -->
    <Loading v-if="isLoading" />

    <!-- Main content is visually underneath, but interaction will be blocked -->
    <main v-else class="flex-grow flex flex-col items-center p-4 min-h-[calc(100vh-3.5rem)]">
      <div class="w-full max-w-6xl mt-4">
        <h2 class="text-3xl font-extrabold text-primary text-center mb-4">Challenge</h2>
        <QuizPage :quiz="quiz" @quiz-submitted="updateCredits" />
      </div>
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, onMounted } from 'vue';
import data from '../../../assets/questions.json';
import QuizPage from '~/components/challenge/QuizPage.vue';
import { useCreditStore } from '~/stores/credit';
import { useMinimumLoader } from '~/composables/useMinimumLoader';
import Loading from '~/components/common/Loading.vue'; // your loader component

const { isLoading, loadWithMinimum } = useMinimumLoader();
const quiz = ref(null);
const creditStore = useCreditStore();

const getRandomizedQuestions = (data: any[], numberOfQuestions: number) => {
  const shuffled = shuffleArray([...data]);
  return shuffled.slice(0, numberOfQuestions);
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const updateCredits = (newCredits: number) => {
  const updatedCredits = [...creditStore.childCredits];
  updatedCredits[0] += newCredits * 10;
  creditStore.childCredits = updatedCredits;

  // Scroll the page to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onBeforeMount(() => {
  quiz.value = getRandomizedQuestions(data, 10);
});

onMounted(() => {
  // Replace with your actual async task
  const asyncTask = new Promise((resolve) => setTimeout(resolve, 100));
  loadWithMinimum(asyncTask);
});
</script>
