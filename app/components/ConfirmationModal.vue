<template>
  <div v-if="showModal" class="modal-overlay" @click="cancel">
    <div class="modal-content bg-gray-100 dark:bg-gray-900" @click.stop>
      <h3>Are you sure you want to add ${{ amount }} credits for {{ name }}?</h3>
      <div class="modal-actions">
        <button @click="confirm">Confirm</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Modal visibility control and amount to be added
const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  showModal: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'confirm']);

// Close the modal without performing the action
const cancel = () => {
  emit('close');
};

// Confirm the action and close the modal
const confirm = () => {
  emit('confirm', props.amount);  // Emit amount when confirming
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}
.modal-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
