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
                Character Type *
              </label>
              <input
                v-model="form.type"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., General, History, Biology"
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

          <!-- Voice Configuration -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Voice Configuration</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Voice Type
                </label>
                <select
                  v-model="voiceConfig.voice"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="default">Default</option>
                  <option value="friendly">Friendly</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="calm">Calm</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Speed
                </label>
                <input
                  v-model.number="voiceConfig.speed"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="1.0"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Pitch
                </label>
                <input
                  v-model.number="voiceConfig.pitch"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="1.0"
                >
              </div>
            </div>
          </div>

          <!-- Animation Configuration -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Animation Configuration</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Idle Animation
                </label>
                <input
                  v-model="animationConfig.idle"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="idle.gif"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Talking Animation
                </label>
                <input
                  v-model="animationConfig.talking"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="talking.gif"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Thinking Animation
                </label>
                <input
                  v-model="animationConfig.thinking"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="thinking.gif"
                >
              </div>
            </div>
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

// Separate reactive objects for voice and animation config
const voiceConfig = ref({
  voice: 'default',
  speed: 1.0,
  pitch: 1.0
});

const animationConfig = ref({
  idle: '',
  talking: '',
  thinking: ''
});

const isFormValid = computed(() => {
  return form.value.name && form.value.type;
});

// Watch for character changes to populate form
watch(() => props.character, (newCharacter) => {
  if (newCharacter) {
    form.value = {
      name: newCharacter.name || '',
      type: newCharacter.type || '',
      description: newCharacter.description || '',
      image_url: newCharacter.image_url || '',
      personality_prompt: newCharacter.personality_prompt || '',
      is_active: newCharacter.is_active !== false,
      display_order: newCharacter.display_order || 0
    };

    // Parse voice config
    const parsedVoiceConfig = newCharacter.voice_config || {};
    voiceConfig.value = {
      voice: parsedVoiceConfig.voice || 'default',
      speed: parsedVoiceConfig.speed || 1.0,
      pitch: parsedVoiceConfig.pitch || 1.0
    };

    // Parse animation config
    const parsedAnimationConfig = newCharacter.animation_config || {};
    animationConfig.value = {
      idle: parsedAnimationConfig.idle || '',
      talking: parsedAnimationConfig.talking || '',
      thinking: parsedAnimationConfig.thinking || ''
    };
  } else {
    // Reset form for new character
    form.value = {
      name: '',
      type: '',
      description: '',
      image_url: '',
      personality_prompt: '',
      is_active: true,
      display_order: 0
    };

    voiceConfig.value = {
      voice: 'default',
      speed: 1.0,
      pitch: 1.0
    };

    animationConfig.value = {
      idle: '',
      talking: '',
      thinking: ''
    };
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  const characterData = {
    ...form.value,
    voice_config: { ...voiceConfig.value },
    animation_config: { ...animationConfig.value }
  };

  emit('save', characterData);
};
</script>
