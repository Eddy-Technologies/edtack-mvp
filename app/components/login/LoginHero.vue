<template>
  <div class="flex flex-col justify-center h-full bg-secondary-100 p-8 lg:p-12">
    <!-- Main Hero Content -->
    <div class="max-w-xl mx-auto">
      <!-- Hero Headline -->
      <div class="mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          StudyWithEddy
        </h1>
        <p class="text-lg text-gray-600">
          AI-Powered Learning Platform for Singapore Students
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="space-y-4 mb-8">
        <!-- Feature 1: Curriculum-Aware -->
        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Curriculum-Aware Content</h3>
            <p class="text-sm text-gray-600">
              Aligned with Singapore's official syllabus and up-to-date educational standards
            </p>
          </div>
        </div>

        <!-- Feature 2: AI-Powered Chat -->
        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Interactive AI Chat</h3>
            <p class="text-sm text-gray-600">
              Learn through engaging conversations with AI-powered characters
            </p>
          </div>
        </div>

        <!-- Feature 3: Instant Feedback -->
        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-check-badge" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Quizzes & Instant Feedback</h3>
            <p class="text-sm text-gray-600">
              Automated marking and personalized feedback to accelerate learning
            </p>
          </div>
        </div>

        <!-- Feature 4: Parent Dashboard -->
        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Parent Dashboard</h3>
            <p class="text-sm text-gray-600">
              Track your child's progress, manage rewards, and stay involved in their learning journey
            </p>
          </div>
        </div>
      </div>

      <!-- Trust Signals -->
      <div class="p-6 bg-white/80 rounded-xl border border-gray-200 mb-6">
        <div class="flex items-center gap-3 mb-3">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-accent" />
          <h4 class="font-semibold text-gray-900">Designed for Singapore Families</h4>
        </div>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent flex-shrink-0" />
            <span>Safe, educational environment for students</span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent flex-shrink-0" />
            <span>Parent oversight and progress monitoring</span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-accent flex-shrink-0" />
            <span>Motivating reward system to keep students engaged</span>
          </li>
        </ul>
      </div>

      <!-- Learn More Link -->
      <div class="text-center">
        <NuxtLink
          to="/about"
          class="inline-flex items-center gap-2 text-primary hover:text-primary-600 font-medium transition-colors"
        >
          <span>Learn More</span>
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
