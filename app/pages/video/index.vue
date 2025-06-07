<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Draggable Sidebar -->
    <div
      ref="sidebar"
      :style="{ width: sidebarWidth + 'px' }"
      class="flex-shrink-0 transition-all duration-50 ease-in-out bg-gray-100 border-r flex flex-col"
    >
      <Sidebar :collapsed="collapsed" @toggle-sidebar="toggleSidebar" />
    </div>

    <!-- Drag Handle -->
    <div
      class="w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400"
      @mousedown="startDragging"
    />

    <!-- Main Chat Area -->
    <div class="flex flex-col flex-1 h-full">
      <ChatContent class="pb-10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';

const sidebarWidth = ref(600); // default width
const collapsed = ref(false);

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  sidebarWidth.value = collapsed.value ? 80 : 600;
};
const isDragging = ref(false);

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDragging);
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    sidebarWidth.value = Math.max(250, Math.min(e.clientX, window.innerWidth - 300));
  }
};

const stopDragging = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDragging);
};

watch(isDragging, (val) => {
  if (val) {
    document.body.classList.add('no-select');
  } else {
    document.body.classList.remove('no-select');
  }
});
</script>

<style>
.no-select {
  user-select: none !important;
}
</style>
