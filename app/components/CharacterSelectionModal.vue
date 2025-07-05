<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">Choose Your Character</h2>
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Character Grid -->
        <div class="mb-6">
          <div class="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <div
              v-for="(avatar, index) in allAvatars"
              :key="index"
              class="group cursor-pointer w-24 sm:w-28"
              @click="selectCharacter(avatar)"
            >
              <div
                class="relative rounded-lg p-3 text-center transition-all duration-300 group-hover:scale-105 shadow-sm hover:shadow-md"
                :class="[
                  selectedCharacter?.id === avatar.id
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-2 border-transparent'
                ]"
              >
                <div class="relative mb-2">
                  <img
                    :src="avatar.image"
                    :alt="avatar.name"
                    class="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full object-cover border-2 transition-all duration-300"
                    :class="[
                      selectedCharacter?.id === avatar.id
                        ? 'border-primary-400'
                        : 'border-gray-300 group-hover:border-gray-400'
                    ]"
                  >
                </div>
                <h5 class="text-xs sm:text-sm font-semibold mb-1" :class="selectedCharacter?.id === avatar.id ? 'text-primary-800' : 'text-gray-800'">
                  {{ avatar.name }}
                </h5>
                <p class="text-xs" :class="selectedCharacter?.id === avatar.id ? 'text-primary-600' : 'text-gray-600'">
                  {{ avatar.type }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
        <button
          class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!selectedCharacter"
          @click="confirmSelection"
        >
          Select Character
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import boyAvatar from '../../assets/boy.png';
import girlAvatar from '../../assets/girl.png';
import defaultAvatar from '../../assets/default-avatar.png';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentCharacter: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'select']);

const selectedCharacter = ref(null);

const allAvatars = ref([
  {
    id: 1,
    name: 'Alex',
    image: boyAvatar,
    type: 'Explorer'
  },
  {
    id: 2,
    name: 'Luna',
    image: girlAvatar,
    type: 'Scholar'
  },
  {
    id: 3,
    name: 'Sam',
    image: defaultAvatar,
    type: 'Scientist'
  },
  {
    id: 4,
    name: 'Snorlax',
    image: '/snorlax.png',
    type: 'Sleepy'
  },
  {
    id: 5,
    name: 'Mystery',
    image: boyAvatar,
    type: 'Unknown'
  },
  {
    id: 6,
    name: 'Future',
    image: girlAvatar,
    type: 'Coming Soon'
  },
  {
    id: 7,
    name: 'Classic',
    image: defaultAvatar,
    type: 'Traditional'
  },
  {
    id: 8,
    name: 'Special',
    image: '/snorlax.png',
    type: 'Unique'
  }
]);

const selectCharacter = (avatar) => {
  selectedCharacter.value = avatar;
};

const closeModal = () => {
  emit('close');
};

const confirmSelection = () => {
  if (selectedCharacter.value) {
    emit('select', selectedCharacter.value);
    closeModal();
  }
};

// Watch for modal open/close to initialize selected character
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    selectedCharacter.value = props.currentCharacter || allAvatars.value[0];
  }
});

// Handle escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

// Add event listener when component mounts
if (import.meta.client) {
  document.addEventListener('keydown', handleKeydown);
}
</script>
