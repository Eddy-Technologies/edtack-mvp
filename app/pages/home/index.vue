<template>
  <div class="relative w-full min-h-screen bg-background overflow-auto">
    <!-- Landing Message -->
    <div class="px-4 sm:px-8 py-8 text-center">
      <div class="flex items-center justify-center flex-wrap mb-4">
        <h1 class="text-3xl md:text-4xl text-black mr-3 font-heading">Welcome to Eddy</h1>
        <img src="/logo.png" class="w-[50px] sm:w-[60px] h-auto">
      </div>
      <h2 class="text-lg sm:text-xl md:text-2xl text-black leading-snug max-w-4xl mx-auto">
        An educational platform where parents can incentivise and motivate
        their children for consistent and fun learning.
      </h2>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <Button
          text="Login"
          route="/login"
          color="white"
          size="xl"
          bold
          rounded
          border
          hover
          extra-classes="w-[200px] text-base sm:text-lg"
        />
        <Button
          text="Try Eddy Now"
          route="/register"
          color="primary"
          size="xl"
          bold
          rounded
          hover
          extra-classes="w-[200px] text-base sm:text-lg"
        />
      </div>
    </div>

    <!-- First Section: 3x3 Character Grid -->
    <section class="py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-heading text-black mb-4">
            Meet Your Learning Companions
          </h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Choose from our diverse cast of AI tutors, each with their own expertise and personality.
            Click on any character to start your learning journey!
          </p>
        </div>
        <CharacterGrid />
      </div>
    </section>

    <!-- Second Section: Character Carousel -->
    <section class="py-12 px-4 bg-white/50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-heading text-black mb-4">
            Popular Tutors
          </h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover our most popular AI tutors and their specialties.
          </p>
        </div>
        <CharacterCarousel />
      </div>
    </section>

    <!-- Third Section: Chat Demo -->
    <section class="py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-heading text-black mb-4">
            Experience AI-Powered Learning
          </h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Try our interactive chat demo to see how Eddy can help with your studies.
            Ask questions, get explanations, and discover personalized learning!
          </p>
        </div>
        <ChatDemo />
      </div>
    </section>

    <!-- Final Call-to-Action -->
    <section class="py-16 px-4 bg-primary-50">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-heading text-black mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p class="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Join thousands of students and parents who are already using Eddy to make learning more engaging and effective.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            text="Start Free Trial"
            route="/register"
            color="primary"
            size="xl"
            bold
            rounded
            hover
            extra-classes="w-[220px] text-base sm:text-lg"
          />
          <Button
            text="Request Demo"
            route="/demo"
            color="white"
            size="xl"
            bold
            rounded
            border
            hover
            extra-classes="w-[220px] text-base sm:text-lg"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '~/components/common/Button.vue';
import CharacterGrid from '~/components/CharacterGrid.vue';
import CharacterCarousel from '~/components/CharacterCarousel.vue';
import ChatDemo from '~/components/ChatDemo.vue';
</script>

<style scoped></style>
