<template>
  <div class="space-y-10">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="flex justify-center mb-4">
        <div class="w-14 h-14 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl flex items-center justify-center">
          <UIcon name="i-lucide-message-square-heart" class="w-7 h-7 text-secondary-600" />
        </div>
      </div>
      <h2 class="text-3xl font-heading font-bold text-slate-900 mb-4">We Need Your Help!</h2>
      <p class="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
        We are collecting feedback to improve our platform for parents and students. Your input helps us create the best learning experience.
      </p>
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-full text-secondary-700 font-medium">
        <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
        Tell us what characters you'd like to see!
      </div>
    </div>

    <!-- Survey Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Parent Survey Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 hover:shadow-lg transition-all duration-300">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400" />
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-lucide-users" class="w-8 h-8 text-primary-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900 mb-3">Parent Survey</h4>
          <p class="text-sm text-slate-500 mb-6 leading-relaxed">
            Help us understand parent perspectives on student learning and education.
          </p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600 mb-6">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
            8-10 minutes
          </div>
          <button
            class="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            @click="openParentSurvey"
          >
            Take Parent Survey
          </button>
        </div>
      </div>

      <!-- Student Survey Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 hover:shadow-lg transition-all duration-300">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-400 to-primary-400" />
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
            <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-secondary-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900 mb-3">Student Survey</h4>
          <p class="text-sm text-slate-500 mb-6 leading-relaxed">
            Help us understand student learning habits and preferences.
          </p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600 mb-6">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
            10-12 minutes
          </div>
          <button
            class="w-full py-3 px-4 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-medium rounded-xl hover:from-secondary-600 hover:to-secondary-700 shadow-lg shadow-secondary-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            @click="openStudentSurvey"
          >
            Take Student Survey
          </button>
        </div>
      </div>
    </div>

    <!-- Platform Feedback Card -->
    <div class="flex justify-center">
      <div class="max-w-md w-full rounded-2xl bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm ring-1 ring-slate-100">
        <div class="text-center">
          <div class="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-5 mx-auto">
            <UIcon name="i-lucide-settings" class="w-7 h-7 text-slate-600" />
          </div>
          <h4 class="text-xl font-heading font-semibold text-slate-900 mb-3">Platform Feedback</h4>
          <p class="text-sm text-slate-500 mb-6 leading-relaxed">
            Share technical feedback or suggestions for platform improvements.
          </p>
          <button
            class="w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            @click="openPlatformFeedback"
          >
            Give Platform Feedback
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function openParentSurvey() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSdbxaBt-Dhu5MKdNe3SeqJaEoEABQ3vdMmWtPkZZxhBRJVDZw/viewform?usp=header', '_blank');
}

function openStudentSurvey() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSc8lvJDasa55YB-W71hWaDmEur5fvyHSanZGw8-zdJJF_MFjg/viewform?usp=header', '_blank');
}

function openPlatformFeedback() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSf7p6x_ui5jar1s1g1h87UTwoD5asMwH54ZzLIk36Nc9Y5YXw/viewform?usp=header', '_blank');
}
</script>
