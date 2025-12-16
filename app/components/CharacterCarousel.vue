<template>
  <div
    ref="carouselContainerRef"
    class="flex-1 flex items-center justify-center relative overflow-hidden py-6 min-h-[220px]"
  >
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      <span class="ml-3 text-gray-600">Loading characters...</span>
    </div>

    <!-- Carousel Content -->
    <template v-else>
      <!-- Gradient overlays for blur effect -->
      <div class="absolute left-0 top-0 w-32 h-full z-10 pointer-events-none" />
      <div class="absolute right-0 top-0 w-32 h-full z-10 pointer-events-none" />

      <!-- Carousel container -->
      <div
        class="group flex ease-in-out"
        :class="isTransitioning ? 'transition-transform duration-500' : ''"
        :style="{ transform: `translateX(${containerWidth / 2 - (VISIBLE_BUFFER + 0.5) * cardWidth}px)` }"
      >
        <div
          v-for="card in visibleCards"
          :key="card.position"
          class="flex-shrink-0 px-4 transition-all duration-500 ease-in-out"
          :class="[
            card.position === currentIndex ? 'scale-100' : 'scale-95',
            card.position === currentIndex
              ? 'opacity-100'
              : 'opacity-80 blur-[1px] hover:opacity-100 hover:blur-0',
          ]"
          :style="{ width: cardWidth + 'px' }"
        >
          <div class="cursor-pointer" @click="selectAvatar(card)">
            <div
              class="relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl h-[320px] flex flex-col"
              :class="{
                'ring-4 ring-primary-500 ring-opacity-75':
                  card.slug === props.initialCharacterSlug,
              }"
            >
              <!-- Blurred background with gradient to primary -->
              <div
                class="absolute inset-0"
                :style="{
                  backgroundImage: `url(${card.image})`,
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
                  :src="card.image"
                  :alt="card.name"
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
                    {{ card.name }}
                  </h5>
                  <span
                    v-if="card.slug === props.initialCharacterSlug"
                    class="px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-lg"
                  >
                    Selected
                  </span>
                </div>
                <p class="text-white/90 text-sm drop-shadow-md">
                  {{ constantCaseToTitleCase(card.subject) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 transition-all duration-200 hover:scale-110"
        @click="previousCard"
      >
        <UIcon name="i-lucide-chevron-left" class="w-6 h-6 text-gray-800" />
      </button>

      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 transition-all duration-200 hover:scale-110"
        @click="nextCard"
      >
        <UIcon name="i-lucide-chevron-right" class="w-6 h-6 text-gray-800" />
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

const currentIndex = ref(0); // Current position (can grow unbounded for infinite scroll)
const cardWidth = ref(280);
const isTransitioning = ref(false);
const carouselContainerRef = ref(null);
const containerWidth = ref(0);

// Backend data fetching
const allAvatars = ref([]);
const loading = ref(false);

const { fetchCharacters } = useCharacters();

// Number of cards visible on each side of center
const VISIBLE_BUFFER = 4;

// Create sliding window of visible cards around current position
const visibleCards = computed(() => {
  const avatars = allAvatars.value;
  if (avatars.length === 0) return [];

  const cards = [];
  // Generate cards from (currentIndex - buffer) to (currentIndex + buffer)
  for (let i = -VISIBLE_BUFFER; i <= VISIBLE_BUFFER; i++) {
    const position = currentIndex.value + i;
    // Use modular arithmetic to cycle through characters
    const avatarIndex = ((position % avatars.length) + avatars.length) % avatars.length;
    cards.push({
      ...avatars[avatarIndex],
      position, // Absolute position for transform calculation and key
    });
  }
  return cards;
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

    // If initialCharacterSlug is provided, find its index and center on it
    if (props.initialCharacterSlug && allAvatars.value.length > 0) {
      const characterIndex = allAvatars.value.findIndex(
        (char) => char.slug === props.initialCharacterSlug
      );
      if (characterIndex !== -1) {
        currentIndex.value = characterIndex;
      }
    }
  } catch (error) {
    console.error('Failed to load characters:', error);
    allAvatars.value = [];
  } finally {
    loading.value = false;
  }
};

const selectAvatar = (card) => {
  // Use the card's position directly (for smooth centering)
  currentIndex.value = card.position;

  // Emit select event
  emit('select', card);
  emit('update:modelValue', card);

  // Navigate to chat using character slug
  if (props.goToChatOnClick && card.slug) {
    router.replace(`/chat/${card.slug}/new`);
  }
};

const nextCard = () => {
  isTransitioning.value = true;
  currentIndex.value++;
};

const previousCard = () => {
  isTransitioning.value = true;
  currentIndex.value--;
};

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'ArrowRight') {
    nextCard();
  } else if (event.key === 'ArrowLeft') {
    previousCard();
  }
};

// ResizeObserver to track container width
let resizeObserver = null;

// Add/remove event listeners
onMounted(async () => {
  document.addEventListener('keydown', handleKeydown);

  // Set up ResizeObserver to track container width changes
  if (carouselContainerRef.value) {
    containerWidth.value = carouselContainerRef.value.offsetWidth;
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width;
      }
    });
    resizeObserver.observe(carouselContainerRef.value);
  }

  // Load characters from backend
  await loadCharacters();

  // Initialize selected avatar to match current index
  if (props.modelValue === null && allAvatars.value.length > 0) {
    const avatarIndex = ((currentIndex.value % allAvatars.value.length) + allAvatars.value.length) % allAvatars.value.length;
    emit('update:modelValue', allAvatars.value[avatarIndex]);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>
