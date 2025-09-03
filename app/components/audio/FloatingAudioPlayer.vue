<template>
  <Transition name="float">
    <div
      v-if="show"
      ref="floatingContainer"
      :class="[
        'fixed z-50 bg-gray-700 rounded-xl shadow-2xl overflow-hidden',
        isDragging ? 'cursor-grabbing' : 'transition-all duration-300 ease-out',
      ]"
      :style="{
        left: position.x + 'px',
        top: position.y + 'px',
        width: width,
        height: isCollapsed ? collapsedHeight : expandedHeight,
      }"
    >
      <!-- Header Panel -->
      <div
        :class="[
          'bg-gray-800 px-3 py-2 flex items-center justify-between',
          isDragging ? 'cursor-grabbing' : 'cursor-move',
        ]"
        @mousedown="startDragging"
      >
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-musical-note" class="w-5 h-5 text-gray-300" />
          <span class="text-sm font-medium text-gray-300">{{ title }}</span>
        </div>
        <div class="flex items-center gap-1">
          <!-- Collapse/Expand Button -->
          <button
            class="p-1.5 hover:bg-gray-700 rounded transition-colors"
            @click="toggleCollapse"
          >
            <Icon
              :name="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
              class="w-4 h-4 text-gray-300"
            />
          </button>
          <!-- Close Button -->
          <button
            class="p-1.5 hover:bg-gray-700 rounded transition-colors"
            @click="handleClose"
          >
            <Icon name="i-heroicons-x-mark" class="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <!-- Container Content (visible when not collapsed) -->
      <div v-if="!isCollapsed" class="flex flex-col" style="height: calc(100% - 48px)">
        <slot>
          <!-- Default content - Avatar -->
          <div class="relative flex-1 overflow-hidden rounded-lg bg-white mx-2 mt-2 mb-2">
            <Avatar :is-playing="isPlaying" />
          </div>
        </slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import Avatar from '@/components/avatar/Avatar.vue';

interface Props {
  show: boolean;
  initialPosition?: { x: number; y: number };
  isPlaying?: boolean;
  title?: string;
  width?: string;
  collapsedHeight?: string;
  expandedHeight?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'position-change', position: { x: number; y: number }): void;
  (e: 'collapse-toggle', isCollapsed: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialPosition: () => ({ x: 0, y: 0 }),
  isPlaying: false,
  title: 'Audio Player',
  width: '300px',
  collapsedHeight: '48px',
  expandedHeight: '250px',
});

const emit = defineEmits<Emits>();

// Local state
const floatingContainer = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const isCollapsed = ref(false);
const position = ref({ ...props.initialPosition });

// Methods
const handleClose = () => {
  emit('close');
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapse-toggle', isCollapsed.value);
};

const startDragging = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.closest('button')) {
    return;
  }

  isDragging.value = true;
  const startX = e.clientX - position.value.x;
  const startY = e.clientY - position.value.y;

  const handleDrag = (e: MouseEvent) => {
    if (isDragging.value) {
      const newPosition = {
        x: e.clientX - startX,
        y: e.clientY - startY,
      };
      position.value = newPosition;
      emit('position-change', newPosition);
    }
  };

  const stopDragging = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDragging);
  };

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDragging);
};

// Expose methods for parent if needed
defineExpose({
  toggleCollapse,
});
</script>

<style scoped>
.float-enter-active,
.float-leave-active {
  transition: all 0.3s ease;
}

.float-enter-from,
.float-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
