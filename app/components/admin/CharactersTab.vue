<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Characters</h1>
        <p class="text-gray-600 mt-2">Manage AI characters and their configurations</p>
      </div>
      <button
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        @click="openCreateModal"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
        <span>Add Character</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search characters..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="selectedType"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option v-for="type in characterTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Characters Grid -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span class="ml-3 text-gray-600">Loading characters...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCharacters.length === 0" class="text-center py-12">
        <UIcon name="i-lucide-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No characters found</h3>
        <p class="text-gray-600 mb-4">Get started by creating your first character.</p>
        <button
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
          @click="openCreateModal"
        >
          Add Character
        </button>
      </div>

      <!-- Characters Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div
          v-for="character in filteredCharacters"
          :key="character.id"
          class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <!-- Character Avatar -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <img
                  :src="character.image_url || '/assets/eddy.png'"
                  :alt="character.name"
                  class="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                >
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ character.name }}</h3>
                <p class="text-sm text-gray-600">{{ character.type }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="getStatusBadgeClass(character.is_active)">
                {{ character.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Character Info -->
          <div class="mb-4">
            <p class="text-sm text-gray-600 line-clamp-3">
              {{ character.description || 'No description available' }}
            </p>
          </div>

          <!-- Character Metadata -->
          <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div class="bg-gray-50 rounded p-2">
              <span class="font-medium text-gray-700">Display Order:</span>
              <span class="text-gray-600 ml-1">{{ character.display_order }}</span>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <span class="font-medium text-gray-700">Created:</span>
              <span class="text-gray-600 ml-1">{{ formatDate(character.created_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex space-x-2">
              <button
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                @click="editCharacter(character)"
              >
                Edit
              </button>
              <button
                class="text-red-600 hover:text-red-900 text-sm font-medium"
                @click="confirmDelete(character)"
              >
                Deactivate
              </button>
            </div>
            <div class="text-xs text-gray-500">
              ID: {{ character.id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Character Modal -->
    <AdminCharacterModal
      :is-open="isModalOpen"
      :character="selectedCharacter"
      @close="closeModal"
      @save="handleSaveCharacter"
    />

    <!-- Delete Confirmation Modal -->
    <AdminConfirmModal
      :is-open="isDeleteModalOpen"
      title="Deactivate Character"
      :message="`Are you sure you want to deactivate '${characterToDelete?.name}'? This will hide the character from users but preserve chat history.`"
      confirm-text="Deactivate"
      cancel-text="Cancel"
      @confirm="handleDeleteCharacter"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// State
const characters = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const isModalOpen = ref(false);
const selectedCharacter = ref(null);
const isDeleteModalOpen = ref(false);
const characterToDelete = ref(null);

// Computed
const characterTypes = computed(() => {
  const types = [...new Set(characters.value.map((c) => c.type).filter(Boolean))];
  return types.sort();
});

const filteredCharacters = computed(() => {
  let filtered = characters.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.type.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter((c) => c.type === selectedType.value);
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active';
    filtered = filtered.filter((c) => c.is_active === isActive);
  }

  return filtered.sort((a, b) => a.display_order - b.display_order);
});

// Methods
const loadCharacters = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/admin/characters?includeInactive=true');
    if (response.success) {
      characters.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load characters:', error);
    // TODO: Show error toast
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedCharacter.value = null;
  isModalOpen.value = true;
};

const editCharacter = (character) => {
  selectedCharacter.value = { ...character };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCharacter.value = null;
};

const handleSaveCharacter = async (characterData) => {
  try {
    if (selectedCharacter.value?.id) {
      // Update existing character
      await $fetch(`/api/admin/characters/${selectedCharacter.value.id}`, {
        method: 'PUT',
        body: characterData
      });
    } else {
      // Create new character
      await $fetch('/api/admin/characters', {
        method: 'POST',
        body: characterData
      });
    }

    await loadCharacters();
    closeModal();
    // TODO: Show success toast
  } catch (error) {
    console.error('Failed to save character:', error);
    // TODO: Show error toast
  }
};

const confirmDelete = (character) => {
  characterToDelete.value = character;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  characterToDelete.value = null;
};

const handleDeleteCharacter = async () => {
  if (!characterToDelete.value) return;

  try {
    await $fetch(`/api/admin/characters/${characterToDelete.value.id}`, {
      method: 'DELETE'
    });

    await loadCharacters();
    closeDeleteModal();
    // TODO: Show success toast
  } catch (error) {
    console.error('Failed to delete character:', error);
    // TODO: Show error toast
  }
};

const getStatusBadgeClass = (isActive) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';
  return isActive ?
    `${baseClass} bg-green-100 text-green-700` :
    `${baseClass} bg-red-100 text-red-700`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Load characters on mount
onMounted(() => {
  loadCharacters();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>