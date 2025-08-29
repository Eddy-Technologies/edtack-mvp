<template>
  <div class="bg-white rounded-lg shadow-sm p-8 space-y-8">
    <div class="text-center">
      <div class="flex flex-row justify-center items-center mb-6 space-x-2">
        <AppIcon class="w-16 h-16 text-gray-500 mb-4" />
        <h3 class="text-2xl font-bold text-primary mb-4">Welcome to StudyWithEddy</h3>
      </div>
      <H2 class="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
        An AI powered chat platform where Singapore Students can learn through interactive conversations and personalized learning experiences.
      </H2>
    </div>

    <div
      class="bg-white border-2 border-primary rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex flex-row justify-center items-center text-center mb-4 space-x-2">
        <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
          <UIcon name="i-lucide-lightbulb" class="w-6 h-6 text-primary-600" />
        </div>
        <h4 class="flex text-lg font-semibold text-gray-800">Technology</h4>
      </div>
      <p class="text-gray-600 text-center">
        Our platform is using an underlying LLM model from major LLM providers such as OpenAI, Anthropic, and more. We then improve on those models and
        processes by fine-tuning them with our proprietary dataset and incorporating feedback from our users.
      </p>
    </div>

    <div
      class="bg-white border-2 border-secondary rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex flex-row justify-center items-center text-left mb-4 space-x-2">
        <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
          <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-secondary-600" />
        </div>
        <h4 class="flex text-lg font-semibold text-gray-800">Key features</h4>
      </div>

      <ul class="text-gray-600 space-y-2">
        <li class="text-lg font-bold">1. Curriculum-aware content</li>
        <li>We make use of up to date syllabus, cirriculum notes, and exam papers to ensure that the generated content is strictly within the boundaries of the curriculum.</li>
        <li class="text-lg font-bold">2. Lessons, Quizzes and Marking</li>
        <li>Our platform provides a variety of lessons and quizzes, complete with automated marking to give students instant feedback. We can adjust the difficulty and content level based on the student's proficiency and progress.</li>
        <li class="text-lg font-bold">3. Students motivation and engagement</li>
        <li>We use AI characters, text-to-speech technology, credit-reward systems and other elements to keep students motivated and engaged.</li>
        <li class="text-lg font-bold">4. Parents are kept in the loop</li>
        <li>Beyond our AI systems providing feedback to students, our platform includes features that keep parents informed about their child's progress and learning journey. Parents can also reward students through our platform.</li>
      </ul>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Subjects Card -->
      <div class="bg-white border-2 border-purple-500 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <UIcon name="i-lucide-book-open" class="w-6 h-6 text-purple-600" />
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-3">Subjects Covered</h4>
        </div>
        <div class="gap-1 text-sm text-gray-600">
          <div>• Mathematics</div>
          <div>• Additional Mathematics</div>
          <div>• Biology</div>
          <div>• Chemistry</div>
          <div>• Physics</div>
          <div>• English</div>
          <div>• Literature</div>
          <div>• History</div>
          <div>• Geography</div>
          <div>• Social Studies</div>
        </div>
      </div>

      <div class="bg-white border-2 border-blue-500 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
        <div class="text-center mb-4">
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600" />
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-3">AI Characters</h4>
        </div>
        <p class="text-gray-600 text-center max-w-2xl mx-auto">
          Choose from multiple AI tutors with unique personalities for each subject
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script needed for this component
</script>
