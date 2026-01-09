<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="props.visible"
        class="fixed inset-0 z-50"
        @keydown.esc="handleClose"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleClose"
        />

        <!-- Drawer Panel -->
        <div
          ref="drawerRef"
          class="absolute top-0 left-0 h-full bg-white shadow-xl overflow-y-auto"
          :class="widthClass"
          :style="drawerStyle"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  visible: boolean;
  width?: 'sm' | 'md' | 'lg' | 'full';
}>();

const emit = defineEmits<{
  close: [];
}>();

const drawerRef = ref<HTMLElement | null>(null);

// Touch swipe state
const touchStartX = ref(0);
const touchCurrentX = ref(0);
const isSwiping = ref(false);
const swipeThreshold = 50; // Minimum swipe distance to close

// Width classes
const widthClass = computed(() => {
  switch (props.width) {
    case 'sm':
      return 'w-64'; // 256px
    case 'lg':
      return 'w-80'; // 320px
    case 'full':
      return 'w-full';
    case 'md':
    default:
      return 'w-72'; // 288px - matches dashboard/admin sidebar
  }
});

// Dynamic style for swipe animation
const drawerStyle = computed(() => {
  if (!isSwiping.value) return {};
  const diff = touchCurrentX.value - touchStartX.value;
  if (diff >= 0) return {}; // Only allow swiping left (to close)
  return {
    transform: `translateX(${diff}px)`,
    transition: 'none',
  };
});

const handleClose = () => {
  emit('close');
};

// Touch handlers for swipe-to-close
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
  touchCurrentX.value = e.touches[0].clientX;
  isSwiping.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return;
  touchCurrentX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isSwiping.value) return;

  const diff = touchCurrentX.value - touchStartX.value;
  if (diff < -swipeThreshold) {
    // Swiped left far enough - close drawer
    handleClose();
  }

  // Reset swipe state
  isSwiping.value = false;
  touchStartX.value = 0;
  touchCurrentX.value = 0;
};

// Keyboard handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    handleClose();
  }
};

// Body scroll lock
let scrollPosition = 0;

const lockScroll = () => {
  scrollPosition = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollPosition);
};

// Watch visibility for scroll lock
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  if (props.visible) {
    lockScroll();
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  unlockScroll();
});
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(-100%);
}
</style>
