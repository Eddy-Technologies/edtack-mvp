<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-8">
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
</template>

<script setup lang="ts">
// No additional script needed for this component
</script>