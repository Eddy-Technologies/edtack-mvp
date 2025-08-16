<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-6">
    <h3 class="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>

    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="border border-gray-200 rounded-lg"
      >
        <button
          class="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
          @click="toggleFaq(index)"
        >
          <span class="font-medium text-gray-800">{{ faq.question }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-5 h-5 text-gray-500 transition-transform duration-200"
            :class="openFaqs.includes(index) ? 'rotate-180' : ''"
          />
        </button>
        <div
          v-if="openFaqs.includes(index)"
          class="p-4 pt-0 text-gray-600 leading-relaxed"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const openFaqs = ref<number[]>([]);

const faqs = ref([
  {
    question: 'What is Eddy and how does it work?',
    answer:
      'Eddy is an AI-powered educational platform featuring customized Large Language Models designed specifically for education. Our AI tutors provide personalized learning experiences, adapt to your child\'s learning pace, and offer curriculum-aligned content across multiple subjects.',
  },
  {
    question: 'What subjects does Eddy cover?',
    answer:
      'Eddy covers Mathematics, Science, English, History, Art, Music, Physical Education, and Technology. Our content is aligned with primary school curricula and adapts to different grade levels.',
  },
  {
    question: 'How do the AI characters work?',
    answer:
      'Choose from multiple AI tutors including Alex the Explorer, Luna the Scholar, Sam the Scientist, and more. Each character has a unique personality and teaching style to match your child\'s preferences and learning style.',
  },
  {
    question: 'Is Eddy safe for children?',
    answer:
      'Yes! Eddy is built with child safety as a priority. Our AI includes bias filters, content safety measures, and is designed specifically for young learners. We also provide comprehensive parental controls.',
  },
  {
    question: 'How does the credit system work?',
    answer:
      'Students earn credits by completing quizzes and challenges. Credits can be used in our shop system for educational materials and rewards, encouraging continued learning and engagement.',
  },
  {
    question: 'Can parents track their child\'s progress?',
    answer:
      'Absolutely! Our parent dashboard provides detailed progress tracking, study hours, completion rates, and comprehensive analytics to help you monitor your child\'s learning journey.',
  },
  {
    question: 'What devices can I use Eddy on?',
    answer:
      'Eddy is a web-based platform that works on any device with an internet connection. Our responsive design ensures a great experience on computers, tablets, and smartphones.',
  },
  {
    question: 'Do you offer family accounts?',
    answer:
      'Yes! We support multi-child family accounts with individual tracking for each child, separate subscriptions per child, and comprehensive family management features.',
  },
]);

const toggleFaq = (index: number) => {
  if (openFaqs.value.includes(index)) {
    openFaqs.value = openFaqs.value.filter((i) => i !== index);
  } else {
    openFaqs.value.push(index);
  }
};
</script>
