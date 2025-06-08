<template>
  <Transition name="fade-scale">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      tabindex="0"
      @keydown.esc="emitClose"
    >
      <!-- Modal Panel -->
      <div
        ref="modalRef"
        class="relative bg-white rounded-3xl shadow-xl p-8 max-w-full"
        :class="sizeClass"
      >
        <!-- Close Button -->
        <button
          class="absolute top-5 right-8 text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="emitClose"
        >
          <span class="sr-only">Close</span>
          ✕
        </button>

        <header v-if="$slots.title" class="mb-4">
          <slot name="title" />
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
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue';

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

const visible = ref(props.visible);

onMounted(() => {
  document.addEventListener('keydown', handleKey);
  visible.value = true;
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
