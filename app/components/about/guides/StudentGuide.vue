<template>
  <div class="space-y-6">
    <!-- Choose Your AI Tutor -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Choose Your AI Tutor</h3>
      <p class="text-slate-600 mb-4">Select from Eddy, Pooh, Snorlax, or Einstein - each with unique personalities.</p>
      <img src="/assets/guide-screenshots/student-tutor-selection.png" alt="AI Tutor Selection" class="w-full rounded-lg shadow-md">
    </div>

    <!-- Chat & Learn -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Chat & Learn</h3>
      <p class="text-slate-600 mb-4">Ask questions, request quizzes, or explore any subject. Your AI tutor provides instant feedback and explanations.</p>
      <img src="/assets/guide-screenshots/student-chat-interface.png" alt="Chat Interface" class="w-full rounded-lg shadow-md">
    </div>

    <!-- Earn Credits -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Earn Credits</h3>
      <p class="text-slate-600 mb-4">Complete quizzes and learning tasks to earn credits. Check your balance anytime in your dashboard.</p>
      <img src="/assets/guide-screenshots/student-credit-balance.png" alt="Credit Balance" class="w-full rounded-lg shadow-md mb-4">
      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Tip:</strong> Meet the 70% passing score on parent-assigned tasks to earn credits automatically!
      </div>
    </div>

    <!-- Shop & Orders -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Shop & Orders</h3>
      <p class="text-slate-600 mb-4">Browse items, add to cart or wishlist, and submit orders for parent approval.</p>

      <div class="space-y-4">
        <div>
          <h4 class="font-medium text-slate-800 mb-2">Browse Shop</h4>
          <img src="/assets/guide-screenshots/student-shop-browse.png" alt="Shop Browse" class="w-full rounded-lg shadow-md">
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium text-slate-800 mb-2">Wishlist</h4>
            <img src="/assets/guide-screenshots/student-wishlist.png" alt="Wishlist" class="w-full rounded-lg shadow-md">
          </div>
          <div>
            <h4 class="font-medium text-slate-800 mb-2">Track Orders</h4>
            <img src="/assets/guide-screenshots/student-orders.png" alt="Orders" class="w-full rounded-lg shadow-md">
          </div>
        </div>
      </div>
    </div>

    <!-- Subjects -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Available Subjects</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="subject in subjects" :key="subject" class="rounded-xl bg-slate-50 p-3 text-center">
          <span class="text-sm font-medium text-slate-700">{{ subject }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
