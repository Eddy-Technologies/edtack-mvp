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
      <div class="flex justify-end items-center px-4 py-3 bg-white relative z-10">
        <div class="relative">
          <img
            src="https://i.pravatar.cc/40"
            alt="User Avatar"
            class="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
            @click="menuOpen = !menuOpen"
          >
          <!-- Overflow Menu -->
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-20"
          >
            <template v-if="loggedIn">
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
                @click="routeTo('profile')"
              >
                Profile
              </button>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
                @click="routeTo('settings')"
              >
                Settings
              </button>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
                @click="routeTo('store')"
              >
                Store
              </button>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
                @click="routeTo('feedback')"
              >
                Feedback
              </button>
              <div class="border-t my-1" />
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                @click="logout"
              >
                Logout
              </button>
            </template>

            <template v-else>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600"
                @click="login"
              >
                Login
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Chat Content Below -->
      <ChatContent class="flex-1 overflow-y-auto pb-10" />
    </div>

    <LoginModal
      v-if="loginModalVisible"
      @close="loginModalVisible = false"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ChatContent from '@/components/ChatContent.vue';
import LoginModal from '@/components/login/LoginModal.vue';

const sidebarWidth = ref(600); // default width
const collapsed = ref(false);
const isDragging = ref(false);
const isMobile = ref(false);
const menuOpen = ref(false);
const loggedIn = ref(false);
const loginModalVisible = ref(false);

const router = useRouter();
const routeTo = (path) => router.push(path);

const login = () => {
  loginModalVisible.value = true;
};

const logout = () => {
  loggedIn.value = false;
  menuOpen.value = false;
};

const handleLoginSuccess = () => {
  loggedIn.value = true;
  loginModalVisible.value = false;
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
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', onClickOutside);
});

const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.relative')) {
    menuOpen.value = false;
  }
};
</script>

<style>
.no-select {
  user-select: none !important;
}
</style>
