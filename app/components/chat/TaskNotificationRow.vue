<template>
  <div v-if="openTasks.length > 0" class="mb-6">
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Transition name="fade" mode="out-in">
              <h3
                v-if="!hoveredTask"
                key="default"
                class="text-lg font-semibold text-gray-800 transition-all duration-300"
              >
                Task control
              </h3>
              <h3
                v-else
                key="hovered"
                class="text-lg font-semibold text-primary-600 transition-all duration-300"
              >
                Task: {{ hoveredTask.name }} • {{ hoveredTask.credit }} credits 💎
              </h3>
            </Transition>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="flex justify-center items-center gap-4 overflow-x-auto pb-2">
          <div
            v-for="task in openTasks"
            :key="task.id"
            class="flex-shrink-0"
          >
            <!-- Mini Carousel Card -->
            <div
              class="relative w-20 h-24 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              @click="navigateToTask(task)"
              @mouseenter="hoveredTask = task"
              @mouseleave="hoveredTask = null"
            >
              <!-- Blurred background -->
              <div
                class="absolute inset-0"
                :style="{
                  backgroundImage: `url(${getCharacterImage(task.subject)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(15px)',
                  transform: 'scale(1.2)'
                }"
              />

              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-br from-gray via-transparent to-gray-600" />

              <!-- Character image -->
              <div class="relative z-10 w-full h-full overflow-hidden">
                <img
                  :src="getCharacterImage(task.subject)"
                  :alt="getCharacterName(task.subject)"
                  class="w-full h-full object-cover"
                  :style="{
                    objectPosition: 'top',
                    transform: 'scale(1.1) translateY(10%)'
                  }"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCharacters } from '~/composables/useCharacters';

const router = useRouter();

interface Task {
  id: string;
  taskThreadId?: string;
  name: string;
  subject: string;
  credit: number;
  status: string;
  isThread?: boolean;
}

const openTasks = ref<Task[]>([]);
const isLoading = ref(true);
const charactersLoaded = ref(false);
const hoveredTask = ref<Task | null>(null);

// Use the characters composable
const { fetchCharacters } = useCharacters();
const dbCharacters = ref<any[]>([]);

// Dynamic subject to character mapping from database
const subjectToCharacterMap = computed(() => {
  const map: Record<string, { name: string; image: string; slug: string }> = {};

  // Build map from database characters
  dbCharacters.value.forEach((char) => {
    if (char.subject) {
      map[char.subject] = {
        name: char.name,
        image: char.image_url || '/assets/eddy.png',
        slug: char.slug
      };
    }
  });

  return map;
});

const getCharacterImage = (subject: string): string => {
  const character = subjectToCharacterMap.value[subject.toUpperCase()];
  return character?.image || '/assets/eddy.png';
};

const getCharacterName = (subject: string): string => {
  const character = subjectToCharacterMap.value[subject.toUpperCase()];
  return character?.name || 'Eddy';
};

const loadOpenTasks = async () => {
  try {
    isLoading.value = true;

    // Use the new task threads endpoint directly
    const response = await $fetch('/api/tasks/threads', {
      query: {
        status: 'OPEN',
        limit: 20,
        offset: 0
      }
    });

    if (response.success && response.threads) {
      // All items from threads endpoint are task threads
      openTasks.value = response.threads.filter((task: Task) =>
        task.status === 'OPEN'
      );
    }
  } catch (error) {
    console.error('Failed to load open tasks:', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateToTask = (task: Task) => {
  // Navigate to the chat thread with the appropriate character
  // Use chatThreadId if available, otherwise fallback to taskThreadId or id
  // Get character slug based on subject
  const character = subjectToCharacterMap.value[task.subject.toUpperCase()];
  const characterSlug = character?.slug;

  router.replace(`/chat/${characterSlug}/${task.taskThreadId}`);
};

onMounted(async () => {
  // Fetch characters from database first
  try {
    const chars = await fetchCharacters();
    dbCharacters.value = chars;
    charactersLoaded.value = true;
  } catch (error) {
    console.error('Failed to load characters:', error);
    // Continue anyway with empty character map
    charactersLoaded.value = true;
  }

  // Then load tasks
  loadOpenTasks();
});
</script>

<style scoped>
/* Custom scrollbar for horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Fade transition for header text */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
