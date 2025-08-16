<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-6">
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
      <Button variant="primary" text="Send Feedback" @click="$emit('switchTab', 'feedback')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/common/Button.vue';

// Define emits for parent component communication
defineEmits(['switchTab']);
</script>
