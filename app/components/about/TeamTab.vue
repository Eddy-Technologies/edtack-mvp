<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="mb-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
          <UIcon name="i-lucide-users" class="w-5 h-5 text-primary-600" />
        </div>
        <h2 class="text-3xl font-heading font-bold text-slate-900">Our Team</h2>
      </div>
      <p class="text-lg text-slate-500">Meet the people behind StudyWithEddy</p>
    </div>

    <!-- Founders Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-50 via-secondary-50/50 to-white p-10 shadow-sm ring-1 ring-secondary-100/50">
      <div class="absolute top-0 right-0 w-48 h-48 bg-secondary-100/50 rounded-full blur-3xl" />
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <UIcon name="i-lucide-heart-handshake" class="w-6 h-6 text-secondary-600" />
          </div>
          <h3 class="text-2xl font-heading font-bold text-slate-900">The Founders</h3>
        </div>
        <p class="text-slate-600 leading-relaxed mb-4">
          We are a team of like-minded individuals that believe in using artificial
          intelligence to provide education for all. We met each other at the National
          University of Singapore (NUS).
        </p>
        <p class="text-slate-500">
          Thank you for your support and please let us know what features you would like to
          see on our platform.
        </p>
      </div>
    </div>

    <!-- Mission & Tech Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Mission Card -->
      <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
            <UIcon name="i-lucide-target" class="w-6 h-6 text-primary-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900">Our Mission</h4>
        </div>
        <p class="text-slate-600 leading-relaxed">
          To inspire children through rewards, engagement and targeted learning while
          empowering parents to take charge of their children's education using
          cutting-edge AI technology.
        </p>
      </div>

      <!-- Tech Stack Card -->
      <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
            <UIcon name="i-lucide-code-2" class="w-6 h-6 text-blue-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900">Technology Stack</h4>
        </div>
        <div class="space-y-3">
          <div v-for="tech in techStack" :key="tech.name" class="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <div class="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <UIcon :name="tech.icon" class="w-4 h-4 text-slate-600" />
            </div>
            <span class="text-slate-700 text-sm font-medium">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact CTA -->
    <div class="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-center shadow-lg shadow-primary-500/20">
      <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-mail" class="w-6 h-6 text-white" />
      </div>
      <h4 class="text-xl font-heading font-semibold text-white mb-3">Get in Touch</h4>
      <p class="text-primary-100 mb-6">We'd love your feedback and suggestions!</p>
      <button
        class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-sm"
        @click="$emit('switchTab', 'feedback')"
      >
        <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
        Send Feedback
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['switchTab']);

const techStack = [
  { name: 'Vue.js & Nuxt 3 Framework', icon: 'i-lucide-layers' },
  { name: 'Supabase Backend', icon: 'i-lucide-database' },
  { name: 'Google AI Studio Integration', icon: 'i-lucide-brain' },
  { name: 'Cloudflare Deployment', icon: 'i-lucide-cloud' },
  { name: 'Advanced Analytics', icon: 'i-lucide-bar-chart-3' },
];
</script>
