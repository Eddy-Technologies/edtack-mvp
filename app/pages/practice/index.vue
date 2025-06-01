<template>
  <div class="relative flex flex-col min-h-screen bg-gray-100">
    <AppHeader />

    <!-- Main content is visually underneath, but interaction will be blocked -->
    <main class="flex-grow flex flex-col items-center p-4 min-h-[calc(100vh-3.5rem)]">
      <div class="w-full max-w-6xl mt-4">
        <h2 class="text-3xl font-extrabold text-primary text-center mb-4">Practice</h2>
        <QuizPage :is-practice="true" :quiz="quiz" @quiz-submitted="updateCredits" />
      </div>
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import QuizPage from '~/components/challenge/QuizPage.vue';
import { useQuizStore } from '~/stores/quiz';
import { useCreditStore } from '~/stores/credit';
import { useRouter } from 'vue-router';

const router = useRouter();
const quizStore = useQuizStore();
const creditStore = useCreditStore();

const quiz = computed(() => quizStore.quiz);

if (!quiz.value) {
  // Redirect back if no quiz data
  router.replace('/generate');
}

const updateCredits = (newCredits) => {
  const updatedCredits = [...creditStore.childCredits];
  updatedCredits[0] += newCredits * 10;
  creditStore.childCredits = updatedCredits; // Replace reference to trigger update
};
</script>

<style scoped></style>
