<template>
  <div class="relative">
    <!-- Hidden file inputs -->
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="acceptAttribute"
      class="hidden"
      @change="handleFileSelect"
    >
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="handleCameraSelect"
    >

    <!-- Upload button -->
    <button
      ref="buttonRef"
      type="button"
      class="p-1 bg-white text-primary border-2 border-primary rounded-md hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="disabled"
      :title="disabled ? 'Upload in progress...' : 'Attach files'"
      @click="handleClick"
    >
      <Icon
        name="i-heroicons-paper-clip"
        class="w-4 h-4 -rotate-45"
      />
    </button>

    <!-- Dropdown menu (mobile/tablet only) -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        ref="menuRef"
        class="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <!-- Files option -->
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="openFilePicker"
        >
          <Icon
            name="i-heroicons-document-text"
            class="w-5 h-5 text-gray-500"
          />
          <span>Files</span>
        </button>

        <!-- Take Photo option -->
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="openCamera"
        >
          <Icon
            name="i-heroicons-camera"
            class="w-5 h-5 text-gray-500"
          />
          <span>Take Photo</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { FILE_UPLOAD_CONFIG, compressImage, isImageType } from '~/constants/fileUpload';
import { useResponsive } from '~/composables/useResponsive';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void;
}>();

const { isMobile, isTablet } = useResponsive();

const fileInput = ref<HTMLInputElement | null>(null);
const cameraInput = ref<HTMLInputElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);
const showMenu = ref(false);

const acceptAttribute = FILE_UPLOAD_CONFIG.ACCEPT_ATTRIBUTE;

// On mobile/tablet, show menu with options; on desktop, directly open file picker
function handleClick() {
  if (isMobile.value || isTablet.value) {
    showMenu.value = !showMenu.value;
  } else {
    fileInput.value?.click();
  }
}

function closeMenu() {
  showMenu.value = false;
}

function openFilePicker() {
  closeMenu();
  fileInput.value?.click();
}

function openCamera() {
  closeMenu();
  cameraInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files.length > 0) {
    emit('files-selected', Array.from(files));
  }

  // Reset input so same file can be selected again
  input.value = '';
}

async function handleCameraSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files.length > 0) {
    // Compress camera photos since they can be large
    const processedFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (isImageType(file.type)) {
        const compressed = await compressImage(file);
        processedFiles.push(compressed);
      } else {
        processedFiles.push(file);
      }
    }
    emit('files-selected', processedFiles);
  }

  input.value = '';
}

// Click outside to close menu
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    showMenu.value &&
    buttonRef.value &&
    menuRef.value &&
    !buttonRef.value.contains(target) &&
    !menuRef.value.contains(target)
  ) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
