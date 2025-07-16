<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Draggable Sidebar -->
    <div
      ref="sidebar"
      :class="[
        'flex-shrink-0 bg-gray-150 border-r flex flex-col z-30',
        isMobile ? 'fixed top-0 left-0 h-full shadow-lg' : '',
        collapsed && !isDragging ? 'w-20' : '',
      ]"
      :style="{ width: sidebarWidth + 'px', maxWidth: '900px', minWidth: '80px' }"
    >
      <Sidebar
        :collapsed="collapsed"
        :sidebar-width="sidebarWidth"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleSidebar"
        @change-character="openCharacterModal"
      />
    </div>

    <!-- Backdrop for mobile -->
    <div
      v-if="isMobile && !collapsed"
      class="fixed inset-0 z-20 bg-black bg-opacity-40"
      @click="toggleSidebar"
    />

    <!-- Drag Handle -->
    <div
      v-show="!collapsed && !isMobile"
      class="w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400"
      @mousedown="startDragging"
    />

    <!-- Main Content -->
    <div class="flex flex-col flex-1 h-full relative">
      <!-- Top Bar with User Avatar -->
      <div class="flex justify-end items-center px-4 py-3 bg-white relative z-50">
        <AuthenticationWidget
          @login-success="handleLoginSuccess"
          @register-success="handleRegisterSuccess"
          @logout="handleLogout"
        />
      </div>

      <!-- Chat Content Below -->
      <ChatContent class="flex-1 overflow-y-auto pb-10" />
    </div>

    <CharacterSelectionModal
      :is-open="characterModalVisible"
      :current-character="currentCharacter"
      @close="characterModalVisible = false"
      @select="handleCharacterSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import CharacterSelectionModal from '@/components/CharacterSelectionModal.vue';
import AuthenticationWidget from '@/components/AuthenticationWidget.vue';
import { useAuth } from '~/composables/useAuth';
import { useSupabaseUser, useToast } from '#imports';

const toast = useToast();

const sidebarWidth = ref(600); // default width
const collapsed = ref(false);
const isDragging = ref(false);
const isMobile = ref(false);
const characterModalVisible = ref(false);
const currentCharacter = ref(null);

const router = useRouter();

const { signOut } = useAuth();
const user = useSupabaseUser();
const loggedIn = computed(() => !!user.value);

const handleLoginSuccess = () => {
  // Handle any additional actions after successful login
  // AuthenticationWidget already handles the modal closing
};

const handleRegisterSuccess = () => {
  // Handle any additional actions after successful registration
  // AuthenticationWidget already handles the modal closing
};

const handleLogout = () => {
  // Handle any additional actions after logout
  // AuthenticationWidget already handles the logout process
};

const openCharacterModal = () => {
  characterModalVisible.value = true;
};

const handleCharacterSelection = (character) => {
  currentCharacter.value = character;
  console.log('Character selected:', character);
  // Here you can add logic to update the chat context with the new character
};
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  sidebarWidth.value = collapsed.value ? 80 : 600;
};

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDragging);
};

const MIN_WIDTH = 80;
const MAX_WIDTH = 900;

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    sidebarWidth.value = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
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

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) collapsed.value = true;
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
.no-select {
  user-select: none !important;
}
</style>
