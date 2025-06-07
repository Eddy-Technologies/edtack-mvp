<template>
  <Modal :show="show" @close="handleClose">
    <template #default>
      <FeedbackForm @close="handleFormClose" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import FeedbackForm from './FeedbackForm.vue';
import Modal from '~/components/common/Modal.vue';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close']);

function handleClose() {
  emit('close');
}

function handleFormClose() {
  // This is called when the form itself emits 'close' (e.g., after successful submission)
  emit('close');
}
</script>
