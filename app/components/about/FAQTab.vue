<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="mb-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
          <UIcon name="i-lucide-help-circle" class="w-5 h-5 text-primary-600" />
        </div>
        <h2 class="text-3xl font-heading font-bold text-slate-900">Frequently Asked Questions</h2>
      </div>
      <p class="text-lg text-slate-500">Find answers to common questions about StudyWithEddy</p>
    </div>

    <!-- FAQ Items -->
    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        :class="[
          'rounded-2xl bg-white shadow-sm ring-1 overflow-hidden transition-all duration-300',
          openFaqs.includes(index) ? 'ring-primary-100 shadow-md' : 'ring-slate-100 hover:shadow-md hover:ring-slate-200'
        ]"
      >
        <button
          class="w-full text-left px-6 py-5 flex justify-between items-center"
          @click="toggleFaq(index)"
        >
          <span class="font-medium text-slate-900 pr-4">{{ faq.question }}</span>
          <div
            :class="[
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
              openFaqs.includes(index) ? 'bg-primary-100 rotate-180' : 'bg-slate-100'
            ]"
          >
            <UIcon
              name="i-lucide-chevron-down"
              :class="[
                'w-4 h-4 transition-colors duration-200',
                openFaqs.includes(index) ? 'text-primary-600' : 'text-slate-500'
              ]"
            />
          </div>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out overflow-hidden"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-200 ease-in overflow-hidden"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="openFaqs.includes(index)" class="px-6 pb-6">
            <p class="text-slate-600 leading-relaxed">{{ faq.answer }}</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Help CTA -->
    <div class="rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 p-8 ring-1 ring-slate-100">
      <div class="text-center">
        <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-message-circle" class="w-6 h-6 text-primary-600" />
        </div>
        <h3 class="text-lg font-heading font-semibold text-slate-900 mb-2">Still have questions?</h3>
        <p class="text-slate-600 mb-4">We're here to help! Reach out to our support team.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const openFaqs = ref<number[]>([]);

const faqs = ref([
  {
    question: 'What is StudyWithEddy and how does it work?',
    answer:
      'StudyWithEddy is an AI-powered chat platform specifically designed for Singapore students. Our platform uses advanced Large Language Models from providers like OpenAI and Anthropic, fine-tuned with Singapore\'s curriculum data. Students learn through interactive conversations with AI tutors that adapt to their learning pace and provide personalized educational experiences.',
  },
  {
    question: 'Which Singapore curriculum levels and subjects are supported?',
    answer:
      'We support the full range of Singapore education levels following MOE syllabus including Primary, Secondary (O-Level), and Pre-University (A-Level). Our subjects include Mathematics, Additional Mathematics, Biology, Chemistry, Physics, English, Literature, History, Geography, and Social Studies - all aligned with the latest MOE curriculum guidelines.',
  },
  {
    question: 'How do I get started with StudyWithEddy?',
    answer:
      'Simply sign up for an account, choose your education level and subjects, then select an AI character that matches your learning style. You can start with a free trial to explore our interactive lessons, quizzes, and chat-based learning before choosing a subscription plan.',
  },
  {
    question: 'How do the AI tutors personalize learning for Singapore students?',
    answer:
      'Our AI tutors analyze your responses, learning patterns, and progress to adapt content difficulty and teaching methods. They use Singapore-specific examples, incorporate local context, and follow MOE curriculum progression to ensure relevant and effective learning experiences tailored to each student.',
  },
  {
    question: 'What makes the lessons and quizzes effective for exam preparation?',
    answer:
      'Our platform provides curriculum-aware lessons with automated marking that gives instant feedback. We use up-to-date syllabus content, past exam papers, and practice questions that mirror PSLE, O-Level, and A-Level formats. The difficulty adjusts based on your proficiency to optimize learning outcomes.',
  },
  {
    question: 'How do AI characters keep students motivated and engaged?',
    answer:
      'Each AI character has a unique personality and teaching style. We use text-to-speech technology, interactive conversations, gamified learning experiences, and a credit-reward system to maintain student engagement. Characters remember your progress and celebrate achievements to keep you motivated.',
  },
  {
    question: 'How can parents monitor their child\'s learning progress?',
    answer:
      'Parents have access to comprehensive dashboards showing detailed progress tracking, study hours, quiz scores, topic mastery, and learning analytics. You can set learning goals, receive progress reports, and even reward your child through our platform to encourage continued learning.',
  },
  {
    question: 'How does the credit and reward system work?',
    answer:
      'Students earn credits by completing lessons, quizzes, and learning challenges. Credits can be used in our reward system for educational materials, achievements, and motivational rewards. Parents can also add bonus credits to encourage consistent learning habits.',
  },
  {
    question: 'Is StudyWithEddy safe and appropriate for children?',
    answer:
      'Absolutely! Child safety is our top priority. Our AI includes content safety filters, bias prevention measures, and age-appropriate responses. We have strict data protection policies, comprehensive parental controls, and all content is designed specifically for young learners in Singapore.',
  },
  {
    question: 'How often is the curriculum content updated?',
    answer:
      'We continuously update our content to align with the latest MOE syllabus changes, new exam formats, and educational best practices. Our team regularly reviews and incorporates feedback from students, parents, and educators to ensure our platform remains current and effective.',
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
