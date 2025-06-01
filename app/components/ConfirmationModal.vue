<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="cancel"
  >
    <div class="bg-gray-100 p-6 rounded-lg shadow-lg max-w-sm w-full" @click.stop>
      <h3 class="text-lg font-semibold text-gray-800">
        Are you sure you want to add ${{ amount }} credits for {{ name }}?
      </h3>

      <div class="flex justify-around mt-4">
        <button
          @click="confirm"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition"
        >
          Confirm
        </button>
        <button
          @click="cancel"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  showModal: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'confirm']);

const cancel = () => {
  emit('close');
};

const confirm = () => {
  emit('confirm', props.amount);
};
</script>
