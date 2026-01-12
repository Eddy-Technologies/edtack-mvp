<template>
  <Transition name="fade-scale">
    <div
      v-if="props.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      tabindex="0"
      @keydown.esc="emitClose"
    >
      <!-- Modal Panel -->
      <div
        ref="modalRef"
        class="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto"
        :class="sizeClass"
      >
        <!-- Close Button -->
        <button
          class="absolute top-3 right-3 sm:top-5 sm:right-8 p-1.5 text-gray-400 hover:text-gray-600 active:text-gray-800 focus:outline-none rounded-lg hover:bg-gray-100"
          @click="emitClose"
        >
          <span class="sr-only">Close</span>
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>

        <header v-if="$slots.header">
          <slot name="header" />
        </header>

        <!-- Main Slot -->
        <div>
          <slot />
        </div>

        <!-- Footer Slot -->
        <div v-if="$slots.footer" class="mt-6">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['close']);
const props = defineProps({
  size: {
    type: String,
    default: 'md',
  },
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const modalRef = ref<HTMLElement | null>(null);

const emitClose = () => {
  emit('close');
};

const sizeClass = {
  sm: 'w-[320px]',
  md: 'w-[400px]',
  lg: 'w-[600px]',
}[props.size];

onMounted(() => {
  document.addEventListener('keydown', handleKey);
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKey);
});

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emitClose();
  }
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
