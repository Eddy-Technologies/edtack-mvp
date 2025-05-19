<template>
  <div class="relative w-full min-h-screen bg-background overflow-auto text-center flex flex-col">
    <!-- Desktop Background Image -->
    <img
        v-if="!isMobile"
        :src="background"
        class="fixed top-0 left-0 w-full h-full object-cover z-0 transition-all duration-500 ease-in-out"
        alt="about"
    />

    <!-- Mobile Background Layer -->
    <div v-if="isMobile" class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-background z-0" />
      <img :src="mobileRight" class="absolute bottom-0 right-0 w-[180px] sm:w-[200px] h-auto z-10 transition-all duration-500 ease-in-out">
    </div>

    <!-- Overlay Content -->
    <div class="relative z-10 pt-10 sm:pt-16 md:pt-20 flex flex-col items-center px-4 sm:px-6">
      <!-- Mission -->
      <div class="mb-6 max-w-3xl text-center">
        <h1 class="text-2xl md:text-3xl text-black font-serif mb-2">Our Mission</h1>
        <h2 class="text-lg sm:text-xl md:text-2xl text-black leading-snug">
          Our mission is to inspire children through rewards, engagement and targeted learning and allow parents to take charge of their children's education.
        </h2>
      </div>

      <!-- The Founders -->
      <div class="mb-6 max-w-3xl text-center mt-6">
        <h1 class="text-2xl md:text-3xl text-black font-serif mb-2">The Founders</h1>
        <h2 class="text-lg sm:text-xl md:text-2xl text-black leading-snug">
          We are a team of like-minded individuals that believe in using artificial intelligence to provide education for all.
          We met each other at the National University of Singapore (NUS).
        </h2>
      </div>

      <!-- The Community -->
      <div class="mb-6 max-w-3xl text-center mt-6">
        <h1 class="text-2xl md:text-3xl text-black font-serif mb-2">AI-Powered Learning with Customised LLMs</h1>
        <h2 class="text-lg sm:text-xl md:text-2xl text-black leading-snug">
          At <strong>Eddy</strong>, we leverage the power of <strong>customised Large Language Models (LLMs)</strong> designed specifically for education. Our models are fine-tuned using curriculum-based content, student interaction data, and real classroom feedback.
        </h2>
        <ul class="text-sm sm:text-lg list-disc list-inside text-black space-y-2 mb-4">
          <li><strong>Curriculum-aware content:</strong> Generates questions, hints, and explanations aligned to learning objectives.</li>
          <li><strong>Adaptive difficulty:</strong> Adjusts challenge level dynamically based on student responses and progress.</li>
          <li><strong>Smart feedback:</strong> Understands free-text student answers and provides constructive guidance.</li>
          <li><strong>Modular AI design:</strong> Supports multiple subjects and learning modes like quizzes and lessons.</li>
          <li><strong>Child-safe AI:</strong> Built with bias filters and content safety tailored for young learners.</li>
        </ul>
        <p>
          With domain-specific intelligence built directly into our models, Eddy delivers a learning experience that’s not only smart, but also truly meaningful—scaling personalised education like never before.
        </p>
      </div>

      <!-- The Community -->
      <div class="mb-6 max-w-3xl text-center mt-6">
        <h1 class="text-2xl md:text-3xl text-black font-serif mb-2">The Community</h1>
        <h2 class="text-lg sm:text-xl md:text-2xl text-black leading-snug">
          Thank you for your support and please let us know what features you would like to see on our platform.
        </h2>
      </div>

      <!-- Call-to-Actions -->
      <div class="flex flex-col items-center justify-center gap-4 mb-16 w-full">
        <button
          class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
          to="try"
        >
          Try Eddy Now
        </button>
        <button
            class="w-[220px] py-2 rounded-lg font-bold cursor-pointer bg-black text-white hover:bg-gray-800 text-base sm:text-lg md:text-xl transition-colors duration-300"
           to="feedback"
        >
          Write to Us
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import aboutDesktop from '../../assets/home.png'; // reuse or replace with a dedicated image
import aboutMobileLeft from '../../assets/parent.png';
import aboutMobileRight from '../../assets/child.png';

const isMobile = ref(false);
const background = ref(aboutDesktop);
const mobileRight = ref(aboutMobileRight);

const checkMobile = () => window.innerWidth <= 768;
const updateBackground = () => {
  isMobile.value = checkMobile();
  background.value = isMobile.value ? aboutMobileLeft : aboutDesktop;
};

onMounted(() => {
  updateBackground();
  window.addEventListener('resize', updateBackground);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBackground);
});
</script>
