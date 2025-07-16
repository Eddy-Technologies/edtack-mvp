<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4">
    <div class="w-full max-w-4xl">
      <!-- Back Button -->
      <div class="mb-6">
        <Button
          variant="secondary"
          text="← Back"
          class="w-auto"
          @click="goBack"
        />
      </div>

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">We need your help!</h1>
        <p class="text-gray-600 text-md mb-4">
          We are currently collecting as much surveys as we can to help improve our platform both for parents and students.

          We want to make sure we provide the best experience for all our users and we can only do that with your help.
        </p>
        <p class="font-bold mb-4">
          Help us improve Eddy by sharing your thoughts and suggestions. It can be as simple as telling us what other characters you would like to see!
        </p>
      </div>

      <!-- Survey buttons layout -->
      <div class="space-y-6">
        <!-- First row: Parent and Student surveys -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Parent Survey Card -->
          <div class="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Parent Survey</h2>
              <p class="pb-4">This survey will take approximately 8-10 minutes to complete. Your responses are valuable and will help us understand parent perspectives on student learning and education.</p>
              <Button
                variant="primary"
                text="Take Parent Survey"
                class="w-full"
                @click="openParentSurvey"
              />
            </div>
          </div>

          <!-- Student Survey Card -->
          <div class="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Student Survey</h2>
              <p class="pb-4">
                This survey will take approximately 10-12 minutes to complete. Your responses are valuable and will help us understand student learning habits and preferences.
              </p>
              <Button
                variant="primary"
                text="Take Student Survey"
                class="w-full"
                @click="openStudentSurvey"
              />
            </div>
          </div>
        </div>

        <!-- Second row: Platform Feedback -->
        <div class="flex justify-center">
          <div class="bg-white shadow-lg rounded-xl border border-gray-200 p-8 w-full max-w-md">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Platform Feedback Form</h2>
              <p class="pb-4">Please provide us with any technical feedback or improvements for our platform.</p>
              <Button
                variant="primary"
                text="Give Platform Feedback"
                class="w-full"
                @click="openPlatformFeedback"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Embedded form -->
    </div>
  </div>
</template>

<script setup>
import Button from '~/components/common/Button.vue';

function openParentSurvey() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSdbxaBt-Dhu5MKdNe3SeqJaEoEABQ3vdMmWtPkZZxhBRJVDZw/viewform?usp=header', '_blank');
}

function openStudentSurvey() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSc8lvJDasa55YB-W71hWaDmEur5fvyHSanZGw8-zdJJF_MFjg/viewform?usp=header', '_blank');
}

function openPlatformFeedback() {
  window.open('https://docs.google.com/forms/d/e/1FAIpQLSf7p6x_ui5jar1s1g1h87UTwoD5asMwH54ZzLIk36Nc9Y5YXw/viewform?usp=header', '_blank');
}

function goBack() {
  const referrer = document.referrer;

  if (referrer && !referrer.includes('/feedback')) {
    window.history.back();
  } else {
    navigateTo('/');
  }
}
</script>
