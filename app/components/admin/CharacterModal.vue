<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          {{ character?.id ? 'Edit Character' : 'Create Character' }}
        </h2>
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          @click="closeModal"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Modal Content -->
      <form class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]" @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Character Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter character name"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                v-model="form.subject"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., GENERAL, HISTORY, PURE_BIOLOGY"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., eddy, pooh, maya"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter character description"
            />
          </div>

          <!-- Image and Display -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                v-model="form.image_url"
                type="url"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/character.png"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                v-model.number="form.display_order"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              >
            </div>
          </div>

          <!-- Personality Prompt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Personality Prompt
            </label>
            <textarea
              v-model="form.personality_prompt"
              rows="4"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the character's personality, teaching style, and behavior..."
            />
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              id="is_active"
              v-model="form.is_active"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <label for="is_active" class="ml-2 block text-sm text-gray-900">
              Character is active and visible to users
            </label>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ character?.id ? 'Update Character' : 'Create Character' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  character: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

// Form data
const form = ref({
  name: '',
  type: '',
  description: '',
  image_url: '',
  personality_prompt: '',
  is_active: true,
  display_order: 0
});

const isFormValid = computed(() => {
  return form.value.name && form.value.subject && form.value.slug;
});

// Watch for character changes to populate form
watch(() => props.character, (newCharacter) => {
  if (newCharacter) {
    form.value = {
      name: newCharacter.name || '',
      subject: newCharacter.subject || '',
      slug: newCharacter.slug || '',
      description: newCharacter.description || '',
      image_url: newCharacter.image_url || '',
      personality_prompt: newCharacter.personality_prompt || '',
      is_active: newCharacter.is_active !== false,
      display_order: newCharacter.display_order || 0
    };
  } else {
    // Reset form for new character
    form.value = {
      name: '',
      subject: '',
      slug: '',
      description: '',
      image_url: '',
      personality_prompt: '',
      is_active: true,
      display_order: 0
    };
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  const characterData = {
    ...form.value
  };

  emit('save', characterData);
};
</script>
