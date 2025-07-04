<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4">
    <div class="bg-white shadow-lg rounded-xl border border-gray-200 p-8 w-full max-w-xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">We'd love your feedback!</h1>
        <p class="text-gray-600">Help us improve Eddy by sharing your thoughts and suggestions.</p>
      </div>

      <form action="https://formspree.io/f/xgvkdgwj" method="POST" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
            class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
          <textarea
            id="message"
            name="message"
            placeholder="Share your thoughts, suggestions, or report any issues..."
            rows="6"
            required
            class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
          />
        </div>

        <div class="flex justify-center pt-4">
          <Button
            type="submit"
            variant="primary"
            text="Submit Feedback"
            class="w-full sm:w-auto min-w-[200px]"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Button from '~/components/common/Button.vue';
</script>
