<template>
  <div>
    <h2 class="text-xl font-bold mb-4 text-center">We’d love your feedback!</h2>
    <form
        action="https://formspree.io/f/xgvkdgwj"
        method="POST"
        class="flex flex-col gap-4"
        @submit="handleSubmit"
    >
      <input
          type="text"
          name="name"
          v-model="formData.name"
          placeholder="Your Name"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
      />
      <input
          type="email"
          name="email"
          v-model="formData.email"
          placeholder="Your Email"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
      />
      <textarea
          name="message"
          v-model="formData.message"
          placeholder="Your Feedback"
          rows="5"
          required
          class="p-3 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
      ></textarea>

      <div class="flex justify-end">
        <UButton
            type="submit"
            :loading="isSubmitting"
            label="Submit Feedback"
            variant="outline"
            color="gray"
            size="xl"
            block
            class="sm:w-[220px]"
            :disabled="isSubmitting"
        >
          <template #default>
            {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
          </template>
        </UButton>
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
  event.preventDefault();
  isSubmitting.value = true;

  const form = event.target as HTMLFormElement;
  const data = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // Optionally, display a success message to the user
      alert('Feedback submitted successfully!');
      formData.value = { name: '', email: '', message: '' }; // Reset form
      emit('close'); // Close the modal/form
    } else {
      // Handle errors (e.g., show an error message)
      alert('There was an error submitting your feedback. Please try again.');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('There was an error submitting your feedback. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Add any additional styles if needed, ensuring they are scoped */
</style>
