<template>
  <div class="space-y-6">
    <!-- Meet Your AI Tutors -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Meet Your AI Tutors</h3>
      <p class="text-slate-600 mb-6">StudyWithEddy features multiple AI characters, each with unique personalities to match your learning style.</p>
      <div class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Eddy (Default)</h4>
          <p class="text-sm text-slate-600">Friendly and encouraging, great for all subjects</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Pooh</h4>
          <p class="text-sm text-slate-600">Gentle and curious, perfect for biology and nature</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Snorlax</h4>
          <p class="text-sm text-slate-600">Patient and methodical, great for chemistry</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Einstein</h4>
          <p class="text-sm text-slate-600">Brilliant and inspiring, ideal for physics</p>
        </div>
      </div>
    </div>

    <!-- Chat Interface -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Using the Chat Interface</h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-4">Starting a Conversation</h4>
          <div class="rounded-xl bg-slate-50 p-5">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Choose your AI character by clicking "Choose a Character"</span>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Type your question or topic in the chat input</span>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Press Enter or click Send to start learning!</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Subject Questions</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• "Help me with math fractions"</li>
              <li>• "Explain photosynthesis"</li>
              <li>• "What's a metaphor in English?"</li>
              <li>• "Tell me about ancient Egypt"</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Learning Activities</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• "Give me a quiz on multiplication"</li>
              <li>• "Test my spelling skills"</li>
              <li>• "Practice science vocabulary"</li>
              <li>• "Challenge me with history facts"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Earning Credits -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Earning Credits Through Learning</h3>

      <div class="space-y-6">
        <p class="text-slate-600">
          Credits are virtual rewards you earn by completing learning activities. You can use them to "purchase" items from the shop, which your parents will then review and potentially buy for you in real life!
        </p>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Interactive Quizzes</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Ask for quizzes in any subject</li>
              <li>• Answer questions correctly</li>
              <li>• Complete the full quiz</li>
              <li>• Earn credits based on performance</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Assigned Tasks</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Complete quiz tasks from parents</li>
              <li>• Answer questions correctly</li>
              <li>• Meet the required score (usually 70%)</li>
              <li>• Credits awarded automatically</li>
            </ul>
          </div>
        </div>

        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Quiz Tips:</strong> Take your time before answering. If stuck, ask your AI tutor to explain the concept. Practice regularly - daily learning sessions earn more credits!
        </div>
      </div>
    </div>

    <!-- Shopping & Rewards -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Shopping & Wishlist</h3>

      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-4">Accessing the Shop</h4>
          <div class="rounded-xl bg-slate-50 p-5">
            <div class="space-y-3">
              <div v-for="(step, index) in shopSteps" :key="index" class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
                <span class="text-sm text-slate-600">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Shopping Cart</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Add items you want to buy</li>
              <li>• Adjust quantities</li>
              <li>• See total credit cost</li>
              <li>• Submit order request</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Wishlist</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Save items for later</li>
              <li>• Share with parents</li>
              <li>• Move to cart when ready</li>
              <li>• Track favorite items</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Order Tracking</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• View submitted orders</li>
              <li>• Check approval status</li>
              <li>• See order history</li>
              <li>• Track deliveries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Subjects -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Subjects You Can Learn</h3>
      <p class="text-slate-600 mb-6">StudyWithEddy covers all major school subjects and adapts to your grade level.</p>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="subject in subjects" :key="subject" class="rounded-xl bg-slate-50 p-4 text-center">
          <span class="text-sm font-medium text-slate-700">{{ subject }}</span>
        </div>
      </div>
    </div>

    <!-- Tips for Success -->
    <div class="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Tips for Learning Success</h3>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Make Learning Fun</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Try different AI characters for variety</li>
            <li>• Ask for games and interactive activities</li>
            <li>• Set learning goals and celebrate achievements</li>
            <li>• Use credits as motivation to keep learning</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Study Smart</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Take breaks between learning sessions</li>
            <li>• Ask questions when you don't understand</li>
            <li>• Practice regularly rather than cramming</li>
            <li>• Keep track of your progress and credits</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const shopSteps = [
  'Click on your profile avatar in the top-right corner',
  'Select "Dashboard" from the dropdown menu',
  'Navigate to the "Shop" tab in the sidebar',
  'Browse products and add items to your cart or wishlist'
];

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Literature',
  'Physics',
  'Chemistry'
];
</script>
