<template>
  <div>
    <h2 class="text-xl font-bold mb-4 text-center">We’d love your feedback!</h2>
    <form
        class="flex flex-col gap-4"
        @submit="handleSubmit"
    >
      <input
          type="text"
          name="name"
          v-model="formData.name"
          placeholder="Your Name"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
      />
      <input
          type="email"
          name="email"
          v-model="formData.email"
          placeholder="Your Email"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
      />
      <textarea
          name="message"
          v-model="formData.message"
          placeholder="Your Feedback"
          rows="5"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
      ></textarea>

      <div class="flex justify-end">
        <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full sm:w-[220px] py-2 rounded-lg border-2 border-black dark:border-white font-bold cursor-pointer bg-white text-black dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 text-base sm:text-lg md:text-xl transition-colors duration-300"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const formData = ref({
  name: '',
  email: '',
  message: '',
});

const isSubmitting = ref(false);
const emit = defineEmits(['close']);

async function handleSubmit(event: Event) {
  event.preventDefault(); // Keep this
  isSubmitting.value = true;

  // Remove: const form = event.target as HTMLFormElement;
  // Remove: const data = new FormData(form);

  try {
    const response = await fetch('/api/feedback', { // New API endpoint
      method: 'POST', // Explicitly POST
      headers: {
        'Content-Type': 'application/json', // Set content type
      },
      body: JSON.stringify(formData.value), // Send JSON data
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        alert('Feedback submitted successfully!'); // Or a more subtle notification
        formData.value = { name: '', email: '', message: '' }; // Reset form
        emit('close');
      } else {
        // Handle cases where response is ok but operation wasn't successful (e.g. handled error by API)
        alert(result.statusMessage || 'There was an issue submitting your feedback.');
      }
    } else {
      // Handle HTTP errors (4xx, 5xx)
      const errorData = await response.json().catch(() => ({ statusMessage: 'An unexpected error occurred.' }));
      alert(`Error: ${response.status} - ${errorData.statusMessage || 'Could not submit feedback.'}`);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('An error occurred while submitting your feedback. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Add any additional styles if needed, ensuring they are scoped */
</style>
