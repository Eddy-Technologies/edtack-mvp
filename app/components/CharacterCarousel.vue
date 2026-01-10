<template>
  <div class="flex-1 flex items-center justify-center relative overflow-hidden py-4 md:py-6 min-h-[180px] md:min-h-[220px]">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      <span class="ml-3 text-gray-600">Loading characters...</span>
    </div>

    <!-- Carousel Content -->
    <template v-else>
      <!-- Gradient overlays for blur effect (smaller on mobile) -->
      <div class="absolute left-0 top-0 w-12 md:w-32 h-full z-10 pointer-events-none" />
      <div class="absolute right-0 top-0 w-12 md:w-32 h-full z-10 pointer-events-none" />

      <!-- Carousel container -->
      <div
        class="group flex ease-in-out select-none"
        :class="[
          isTransitioning ? 'transition-transform duration-500' : '',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        ]"
        :style="{ transform: `translateX(calc(50% - ${(adjustedIndex + 0.5) * currentCardWidth}px + ${dragOffset}px))` }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div
          v-for="(avatar, index) in infiniteAvatars"
          :key="`${avatar.id}-${Math.floor(index / allAvatars.length)}`"
          class="flex-shrink-0 px-2 md:px-4 transition-all duration-500 ease-in-out"
          :class="[
            index === adjustedIndex ? 'scale-100' : 'scale-95',
            index === adjustedIndex
              ? 'opacity-100'
              : 'opacity-80 blur-[1px] hover:opacity-100 hover:blur-0',
          ]"
          :style="{ width: currentCardWidth + 'px' }"
        >
          <div class="cursor-pointer" @click="selectAvatar(avatar, index)">
            <div
              class="relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl h-[240px] md:h-[320px] flex flex-col"
              :class="{
                'ring-4 ring-primary-500 ring-opacity-75':
                  avatar.slug === props.initialCharacterSlug,
              }"
            >
              <!-- Blurred background with gradient to primary -->
              <div
                class="absolute inset-0"
                :style="{
                  backgroundImage: `url(${avatar.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(15px)',
                  transform: 'scale(1.2)',
                }"
              />
              <div
                class="absolute inset-0 bg-gradient-to-br from-gray via-transparent to-gray-600"
              />

              <!-- Image container - top 70% -->
              <div class="relative z-10 flex-grow overflow-hidden" style="height: 90%">
                <img
                  :src="avatar.image"
                  :alt="avatar.name"
                  class="w-full h-full object-cover"
                  :style="{
                    objectPosition: 'top',
                    transform: 'scale(1.1) translateY(10%)',
                  }"
                >
              </div>

              <!-- Text area - bottom 30% -->
              <div
                class="relative z-10 p-4 flex flex-col justify-center items-center text-center"
                style="height: 20%"
              >
                <div class="flex items-center gap-2 mb-1">
                  <h5 class="text-white text-base font-semibold drop-shadow-lg">
                    {{ avatar.name }}
                  </h5>
                  <span
                    v-if="avatar.slug === props.initialCharacterSlug"
                    class="px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-lg"
                  >
                    Selected
                  </span>
                </div>
                <p class="text-white/90 text-sm drop-shadow-md">
                  {{ constantCaseToTitleCase(avatar.subject) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons (responsive positioning, larger touch targets on mobile) -->
      <button
        class="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 bg-white/80 md:bg-transparent rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        @click="previousCard"
      >
        <UIcon name="i-lucide-chevron-left" class="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
      </button>

      <button
        class="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 bg-white/80 md:bg-transparent rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        @click="nextCard"
      >
        <UIcon name="i-lucide-chevron-right" class="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from '#vue-router';
import { useCharacters } from '~/composables/useCharacters';
import { constantCaseToTitleCase } from '~/utils/stringUtils';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  goToChatOnClick: {
    type: Boolean,
    default: false,
  },
  initialCharacterSlug: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

const router = useRouter();

const currentIndex = ref(2); // Start from center (index 2 out of 8 cards)
const baseCardWidth = ref(280);
const windowWidth = ref(768);
const isTransitioning = ref(false);

// Drag/swipe state
const isDragging = ref(false);
const wasDragging = ref(false);
const dragStartX = ref(0);
const dragOffset = ref(0);
const dragThreshold = 50; // Minimum distance to trigger card change

// Responsive card width - smaller cards on mobile
const currentCardWidth = computed(() => {
  // On mobile (< 768px), use smaller cards
  if (windowWidth.value < 768) {
    // Scale card width based on viewport, min 180px, max 220px on mobile
    return Math.max(180, Math.min(220, windowWidth.value * 0.55));
  }
  return baseCardWidth.value;
});

// Backend data fetching
const allAvatars = ref([]);
const loading = ref(false);

const { fetchCharacters } = useCharacters();

// Create infinite scroll array by duplicating cards
const infiniteAvatars = computed(() => {
  const avatars = allAvatars.value;
  return [...avatars, ...avatars, ...avatars]; // Triple the array for seamless scroll
});

// Adjust current index to account for the duplicated arrays
const adjustedIndex = computed(() => {
  return currentIndex.value + allAvatars.value.length; // Start from middle array
});

// Load characters from API
const loadCharacters = async () => {
  loading.value = true;
  try {
    const characters = await fetchCharacters(false); // Only active characters
    allAvatars.value = characters.map((char) => ({
      id: char.id,
      name: char.name,
      slug: char.slug,
      subject: char.subject,
      image: char.image_url, // Now comes with public URL from composable
      description: char.description,
      personality_prompt: char.personality_prompt,
    }));

    // Set initial character index if we have characters
    if (allAvatars.value.length > 0) {
      // If initialCharacterSlug is provided, find its index and center on it
      if (props.initialCharacterSlug) {
        const characterIndex = allAvatars.value.findIndex(
          (char) => char.slug === props.initialCharacterSlug
        );
        if (characterIndex !== -1) {
          currentIndex.value = characterIndex;
        } else {
          currentIndex.value = Math.min(currentIndex.value, allAvatars.value.length - 1);
        }
      } else {
        currentIndex.value = Math.min(currentIndex.value, allAvatars.value.length - 1);
      }
    }
  } catch (error) {
    console.error('Failed to load characters:', error);
    allAvatars.value = [];
  } finally {
    loading.value = false;
  }
};

const selectAvatar = (avatar, index) => {
  // Ignore clicks that happened during drag
  if (wasDragging.value) return;

  // Convert infinite array index back to original array index
  currentIndex.value = index % allAvatars.value.length;

  // Emit select event (like the modal does)
  emit('select', avatar);
  emit('update:modelValue', avatar);

  // Navigate to chat using character slug
  if (props.goToChatOnClick && avatar.slug) {
    router.replace(`/chat/${avatar.slug}/new`);
  }
};

const nextCard = () => {
  isTransitioning.value = true;
  currentIndex.value++;

  // Check if we've reached the end of the middle array
  if (currentIndex.value >= allAvatars.value.length) {
    // Allow the transition to complete, then reset to beginning
    setTimeout(() => {
      isTransitioning.value = false;
      currentIndex.value = 0;
    }, 500);
  }
};

const previousCard = () => {
  isTransitioning.value = true;
  currentIndex.value--;

  // Check if we've gone below the beginning of the middle array
  if (currentIndex.value < 0) {
    // Allow the transition to complete, then reset to end
    setTimeout(() => {
      isTransitioning.value = false;
      currentIndex.value = allAvatars.value.length - 1;
    }, 500);
  }
};

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'ArrowRight') {
    nextCard();
  } else if (event.key === 'ArrowLeft') {
    previousCard();
  }
};

// Handle drag/swipe
const handleDragStart = (clientX) => {
  isDragging.value = true;
  dragStartX.value = clientX;
  dragOffset.value = 0;
  isTransitioning.value = false;
};

const handleDragMove = (clientX) => {
  if (!isDragging.value) return;
  dragOffset.value = clientX - dragStartX.value;
};

const handleDragEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;

  // Mark as was dragging if there was significant movement (to prevent click)
  if (Math.abs(dragOffset.value) > 5) {
    wasDragging.value = true;
    setTimeout(() => {
      wasDragging.value = false;
    }, 100);
  }

  // Determine if we should navigate
  if (Math.abs(dragOffset.value) > dragThreshold) {
    if (dragOffset.value < 0) {
      nextCard();
    } else {
      previousCard();
    }
  } else {
    // Snap back with animation
    isTransitioning.value = true;
  }

  dragOffset.value = 0;
};

// Mouse events
const handleMouseDown = (e) => {
  e.preventDefault();
  handleDragStart(e.clientX);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e) => {
  handleDragMove(e.clientX);
};

const handleMouseUp = () => {
  handleDragEnd();
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

// Touch events
const handleTouchStart = (e) => {
  handleDragStart(e.touches[0].clientX);
};

const handleTouchMove = (e) => {
  e.preventDefault();
  handleDragMove(e.touches[0].clientX);
};

const handleTouchEnd = () => {
  handleDragEnd();
};

// Handle window resize for responsive card width
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Add/remove event listeners
onMounted(async () => {
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);

  // Initialize window width
  windowWidth.value = window.innerWidth;

  // Load characters from backend
  await loadCharacters();

  // Initialize selected avatar to match current index
  if (props.modelValue === null && allAvatars.value.length > 0) {
    emit('update:modelValue', allAvatars.value[currentIndex.value]);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
});
</script>
