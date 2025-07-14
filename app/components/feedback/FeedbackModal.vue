<template>
  <Modal @close="handleClose">
    <template #default>
      <FeedbackForm @close="handleFormClose" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import FeedbackForm from './FeedbackForm.vue';
import Modal from '~/components/common/Modal.vue';

const emit = defineEmits(['close']);

function handleClose() {
  emit('close');
}

function handleFormClose() {
  emit('close');
}
</script>
