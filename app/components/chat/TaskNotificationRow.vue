<template>
  <div v-if="openTasks.length > 0" class="mb-6">
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Pending Tasks</h3>
            <p class="text-sm text-gray-600">Complete these tasks to earn credits</p>
          </div>
          <div class="flex items-center bg-blue-50 px-3 py-1 rounded-full">
            <UIcon name="i-lucide-bell" class="w-4 h-4 text-blue-600 mr-1" />
            <span class="text-sm font-medium text-blue-600">{{ openTasks.length }} pending</span>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="flex items-center gap-4 overflow-x-auto pb-2">
          <div
            v-for="task in openTasks"
            :key="task.id"
            class="relative flex-shrink-0 cursor-pointer group"
            @click="navigateToTask(task)"
          >
            <!-- Character Avatar -->
            <div class="relative">
              <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200 group-hover:scale-110">
                <img
                  :src="getCharacterImage(task.subject)"
                  :alt="getCharacterName(task.subject)"
                  class="w-full h-full object-cover"
                >
              </div>

              <!-- Notification Bubble -->
              <div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-white">!</span>
              </div>
            </div>

            <!-- Hover Tooltip -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div class="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <div class="font-medium">{{ task.name }}</div>
                <div class="text-gray-300 mt-1">{{ task.credit }} credits</div>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
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
  chatThreadId?: string;
  name: string;
  subject: string;
  credit: number;
  status: string;
  isThread?: boolean;
}

const openTasks = ref<Task[]>([]);
const isLoading = ref(true);
const charactersLoaded = ref(false);

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

  // Ensure GENERAL fallback exists
  if (!map['GENERAL']) {
    const generalChar = dbCharacters.value.find((c) => c.slug === 'eddy') || dbCharacters.value[0];
    if (generalChar) {
      map['GENERAL'] = {
        name: generalChar.name,
        image: generalChar.image_url || '/assets/eddy.png',
        slug: generalChar.slug
      };
    }
  }

  return map;
});

const getCharacterImage = (subject: string): string => {
  const character = subjectToCharacterMap.value[subject.toUpperCase()] || subjectToCharacterMap.value['GENERAL'];
  return character?.image || '/assets/eddy.png';
};

const getCharacterName = (subject: string): string => {
  const character = subjectToCharacterMap.value[subject.toUpperCase()] || subjectToCharacterMap.value['GENERAL'];
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
  const threadId = task.chatThreadId || task.taskThreadId || task.id;
  if (threadId) {
    // Get character slug based on subject
    const character = subjectToCharacterMap.value[task.subject.toUpperCase()] || subjectToCharacterMap.value['GENERAL'];
    const characterSlug = character?.slug || 'eddy';

    router.push(`/chat/${characterSlug}/${threadId}`);
  }
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
</style>
