<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar Navigation -->
    <div class="w-72 bg-white border-r border-slate-200 flex flex-col">
      <!-- Header -->
      <div class="px-6 py-6 border-b border-slate-200">
        <div class="flex items-center space-x-3">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-700 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">StudyWithEddy</h1>
              <p class="text-xs text-slate-500">About</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-6 py-6 space-y-2">
        <div class="space-y-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Information</p>

          <div v-for="tab in tabs" :key="tab.id">
            <div
              :class="[
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-secondary-50 text-secondary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
              @click="activeTab = tab.id"
            >
              <UIcon :name="tab.icon" class="w-5 h-5 mr-3" />
              {{ tab.name }}
            </div>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="pt-6 mt-6 border-t border-slate-200">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Quick Actions</p>

          <div
            class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            @click="router.push('/feedback')"
          >
            <UIcon name="i-lucide-message-square" class="w-5 h-5 mr-3" />
            Send Feedback
          </div>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-6 pb-6 space-y-4">
        <!-- Back to Chat Button -->
        <Button
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-secondary rounded-xl hover:bg-secondary-700 transition-colors shadow-sm"
          icon="i-lucide-message-circle"
          @click="router.push('/')"
        >
          Back to Chat
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Page Content -->
      <main class="flex-1 p-8 overflow-auto">
        <div class="max-w-7xl mx-auto">
          <!-- Tab Content -->
          <!-- About Tab -->
          <div v-if="activeTab === 'about'" class="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-4">About Eddy</h3>
              <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Our mission is to inspire children through rewards, engagement and targeted
                learning and allow parents to take charge of their children's education.
              </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- What is Eddy Card -->
              <div
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div class="text-center mb-4">
                  <div
                    class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                  >
                    <UIcon name="i-lucide-lightbulb" class="w-6 h-6 text-secondary-600" />
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-3">What is Eddy?</h4>
                </div>
                <p class="text-gray-600 text-center">
                  An AI-powered educational platform featuring customized Large Language Models
                  designed specifically for education. Our AI tutors provide personalized learning
                  experiences for children.
                </p>
              </div>

              <!-- Key Features Card -->
              <div
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div class="text-center mb-4">
                  <div
                    class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                  >
                    <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-green-600" />
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-3">Key Features</h4>
                </div>
                <ul class="text-gray-600 space-y-2">
                  <li>• Curriculum-aware content</li>
                  <li>• Adaptive difficulty</li>
                  <li>• Smart feedback system</li>
                  <li>• Multiple AI personalities</li>
                  <li>• Child-safe AI filters</li>
                </ul>
              </div>

              <!-- Subjects Card -->
              <div
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div class="text-center mb-4">
                  <div
                    class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                  >
                    <UIcon name="i-lucide-book-open" class="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-3">Subjects Covered</h4>
                </div>
                <div class="grid grid-cols-2 gap-1 text-sm text-gray-600">
                  <div>• Mathematics</div>
                  <div>• Science</div>
                  <div>• English</div>
                  <div>• History</div>
                  <div>• Art</div>
                  <div>• Music</div>
                  <div>• PE</div>
                  <div>• Technology</div>
                </div>
              </div>

              <!-- AI Characters Card -->
              <div
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 md:col-span-2 lg:col-span-3"
              >
                <div class="text-center mb-4">
                  <div
                    class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                  >
                    <UIcon name="i-lucide-users" class="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-3">AI Characters</h4>
                </div>
                <p class="text-gray-600 text-center max-w-2xl mx-auto">
                  Choose from multiple AI tutors including Alex the Explorer, Luna the Scholar,
                  Sam the Scientist, and more - each with unique personalities to match your
                  child's learning style.
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ Tab -->
          <div v-if="activeTab === 'faq'" class="bg-white rounded-lg shadow-sm p-8 space-y-6">
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

          <!-- Subscription Tab -->
          <div v-if="activeTab === 'subscription'" class="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <SubscriptionStripeProductsDisplay />
          </div>

          <!-- Team Tab -->
          <div v-if="activeTab === 'team'" class="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">Our Team</h3>

            <div class="bg-secondary-50 rounded-lg p-8 mb-8">
              <h4 class="text-xl font-semibold text-gray-800 mb-4">The Founders</h4>
              <p class="text-gray-700 leading-relaxed mb-4">
                We are a team of like-minded individuals that believe in using artificial
                intelligence to provide education for all. We met each other at the National
                University of Singapore (NUS).
              </p>
              <p class="text-gray-600">
                Thank you for your support and please let us know what features you would like to
                see on our platform.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Our Mission</h4>
                <p class="text-gray-600 leading-relaxed">
                  To inspire children through rewards, engagement and targeted learning while
                  empowering parents to take charge of their children's education using
                  cutting-edge AI technology.
                </p>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Technology Stack</h4>
                <ul class="text-gray-600 space-y-2">
                  <li>• Vue.js & Nuxt 3 Framework</li>
                  <li>• Supabase Backend</li>
                  <li>• Google AI Studio Integration</li>
                  <li>• Cloudflare Deployment</li>
                  <li>• Advanced Analytics</li>
                </ul>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-6 text-center">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Get in Touch</h4>
              <p class="text-gray-600 mb-4">We'd love your feedback and suggestions!</p>
              <Button variant="primary" text="Send Feedback" @click="router.push('/feedback')" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '~/components/common/Button.vue';
import { useRouter } from '#vue-router';

const router = useRouter();
const selectedAvatar = ref(null);

// Tabs functionality
const activeTab = ref('about');
const openFaqs = ref([]);

const tabs = ref([
  { id: 'about', name: 'About', icon: 'i-lucide-info' },
  { id: 'faq', name: 'FAQ', icon: 'i-lucide-help-circle' },
  { id: 'subscription', name: 'Subscription', icon: 'i-lucide-credit-card' },
  { id: 'team', name: 'Team', icon: 'i-lucide-users' },
]);

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

const toggleFaq = (index) => {
  if (openFaqs.value.includes(index)) {
    openFaqs.value = openFaqs.value.filter((i) => i !== index);
  } else {
    openFaqs.value.push(index);
  }
};
</script>

<style scoped></style>
