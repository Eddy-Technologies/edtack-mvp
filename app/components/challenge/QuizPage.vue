<template>
 <div class="mx-auto sm:w-11/12 sm:max-w-6xl sm:px-6">
 <h1 class="font-bold mb-2 text-center text-primary">{{ name }}</h1>

 <!-- Quiz Phase -->
 <div v-if="!quizFinished">
 <div
 v-for="(question, index) in questions"
 :key="index"
 class="bg-white rounded-xl p-5 mb-5 border border-gray-200 shadow hover:shadow-lg transition"
 >
 <Question
 :question="question"
 :question-index="index"
 :selected-answer="userAnswers[index]"
 @answer-selected="updateAnswer(index, $event)"
 />
 </div>

 <div class="w-full flex justify-center md:justify-start">
 <UButton
 class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
 @click="submitQuiz"
 >
 Submit Challenge
 </UButton>
 </div>
 </div>

 <!-- Result Phase -->
 <div v-else ref="content">
 <h3 class="text-2xl font-semibold mb-5 text-center text-primary">Results</h3>

 <div
 v-for="(question, index) in questions"
 :key="index"
 class="bg-white rounded-xl mb-5 border border-gray-200 shadow"
 >
 <QuestionResult
 :question="question"
 :question-index="index"
 :selected-answer="userAnswers[index]"
 />
 </div>

 <div
 class="mt-8 p-6 bg-blue-50 border border-blue-200 text-center rounded-lg shadow"
 >
 <h4 class="text-xl font-bold mb-2">Your Score: {{ score }} / {{ questions.length }}</h4>
 <span class="text-lg font-medium text-primary">You earned {{ score }} credits!</span>
 </div>

 <div class="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center md:flex-wrap">
 <UButton to="store" aria-label="store" class="bg-primary px-6 py-3">
 Redeem your credits!
 </UButton>

 <UButton
 class="px-6 py-3 bg-zinc-500 hover:bg-zinc-600 text-white"
 @click="retryQuiz"
 >
 Retry Quiz
 </UButton>

 <UButton
 class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white"
 @click="regenerateWeakQuiz"
 >
 Regenerate Quiz Based on Weak Areas
 </UButton>

 <UButton
 class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white"
 @click="reviewWeakTopics"
 >
 Review Weak Topics
 </UButton>
 </div>
 </div>
 </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Question from '~/components/challenge/Question.vue';
import QuestionResult from '~/components/challenge/QuestionResult.vue';

interface QuestionType {
 correctAnswer: string;
 [key: string]: any;
}

interface Props {
 quiz: QuestionType[];
 isPractice: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
 (e: 'quiz-submitted', score: number): void;
}>();

const route = useRoute();
const name = computed(() => route.query.name as string);

const questions = ref(props.quiz);
const userAnswers = ref<(string | null)[]>([]);
const quizFinished = ref(false);
const score = ref(0);
const content = ref<HTMLElement | null>(null);

function submitQuiz() {
 quizFinished.value = true;
 calculateScore();
 emit('quiz-submitted', score.value);
}

function updateAnswer(index: number, answer: string) {
 userAnswers.value[index] = answer;
}

function calculateScore() {
 score.value = userAnswers.value.reduce((total, answer, index) => {
 return total + (answer === questions.value[index].correctAnswer ? 1 : 0);
 }, 0);
}

function retryQuiz() {
 quizFinished.value = false;
 userAnswers.value = [];
 window.scrollTo({ top: 0, behavior: 'smooth' });
}

function regenerateWeakQuiz() {
 console.log('Regenerating quiz based on weak areas...');
 // Placeholder: Replace with logic to regenerate the quiz
}

function reviewWeakTopics() {
 console.log('Reviewing weak topics...');
 // Placeholder: Replace with logic to show weak topics
}
</script>
