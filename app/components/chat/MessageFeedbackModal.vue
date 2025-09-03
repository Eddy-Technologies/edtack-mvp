<template>
  <Modal :visible="true" size="md" @close="handleClose">
    <template #default>
      <div>
        <h2 class="text-xl font-bold my-4 text-center">
          {{ isLike ? 'Thanks for your positive feedback!' : 'Help us improve' }}
        </h2>

        <p class="text-gray-600 text-sm mb-6 text-center">
          {{ isLike
            ? 'What did you like about this response?'
            : 'What could we improve about this response?'
          }}
        </p>

        <form class="flex flex-col gap-4" @submit="handleSubmit">
          <!-- Category Selection -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              Category (optional)
            </label>
            <USelect
              id="category"
              v-model="formData.category"
              placeholder="Select a category"
              :options="categoryOptions"
            />
          </div>

          <!-- Feedback Textarea -->
          <div>
            <label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">
              Additional feedback (optional)
            </label>
            <UTextarea
              id="feedback"
              v-model="formData.feedback"
              name="feedback"
              placeholder="Tell us more about your experience..."
              :rows="4"
            />
          </div>

          <!-- Buttons -->
          <div class="flex justify-end">
            <Button
              type="submit"
              :disabled="isSubmitting"
              variant="primary"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
            </Button>
          </div>
        </form>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '../common/Button.vue';
import Modal from '~/components/common/Modal.vue';
import { useToast } from '#imports';

interface Props {
  isLike: boolean;
  messageText: string;
  messageId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'submitted']);

const toast = useToast();

const formData = ref({
  category: '',
  feedback: '',
});

const isSubmitting = ref(false);

// Category options for USelect
// TOOD: move to code table
const categoryOptions = [
  { value: 'accuracy', label: 'Accuracy - Information correctness' },
  { value: 'clarity', label: 'Clarity - Explanation quality' },
  { value: 'helpfulness', label: 'Helpfulness - Usefulness of response' },
  { value: 'completeness', label: 'Completeness - Thoroughness of answer' },
  { value: 'relevance', label: 'Relevance - On-topic response' },
  { value: 'technical_issue', label: 'Technical Issue - Bugs or errors' },
  { value: 'too_simple', label: 'Too Simple - Need more detail' },
  { value: 'too_complex', label: 'Too Complex - Need simpler explanation' },
  { value: 'formatting', label: 'Formatting - Display or layout issues' },
  { value: 'speed', label: 'Speed - Response time concerns' },
  { value: 'other', label: 'Other - General feedback' },
];

const handleClose = () => {
  emit('close');
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();
  isSubmitting.value = true;

  // Validate we have a message ID
  if (!props.messageId) {
    toast.add({
      title: 'Error',
      description: 'Cannot submit feedback: Message ID not found',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    });
    isSubmitting.value = false;
    return;
  }

  try {
    // Use real API endpoint
    const response = await fetch('/api/chat/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_id: props.messageId,
        feedback_type: props.isLike ? 'like' : 'dislike',
        category: formData.value.category || null,
        feedback_text: formData.value.feedback || null,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      toast.add({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        icon: props.isLike ? 'i-heroicons-hand-thumb-up' : 'i-heroicons-hand-thumb-down',
        timeout: 3000
      });

      emit('submitted', result);
      emit('close');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.statusMessage || 'Failed to submit feedback');
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to submit feedback. Please try again.',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
