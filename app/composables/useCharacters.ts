import type { Ref } from 'vue';

export interface Character {
  id: number;
  name: string;
  type: string;
  description?: string;
  image_url?: string;
  voice_config?: Record<string, any>;
  animation_config?: Record<string, any>;
  personality_prompt?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CharactersResponse {
  success: boolean;
  data: Character[];
  count: number;
}

export interface CharacterResponse {
  success: boolean;
  data: Character;
}

export const useCharacters = () => {
  const characters: Ref<Character[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCharacters = async (includeInactive: boolean = false) => {
    loading.value = true;
    error.value = null;

    try {
      const query = includeInactive ? '?includeInactive=true' : '';
      const response = await $fetch<CharactersResponse>(`/api/characters${query}`);

      if (response.success) {
        characters.value = response.data;
        return response.data;
      } else {
        throw new Error('Failed to fetch characters');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch characters';
      console.error('Error fetching characters:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCharacter = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<CharacterResponse>(`/api/characters/${id}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch character');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch character';
      console.error('Error fetching character:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getCharacterById = (id: number) => {
    return computed(() => characters.value.find((char) => char.id === id));
  };

  const activeCharacters = computed(() =>
    characters.value.filter((char) => char.is_active)
  );

  const refreshCharacters = () => {
    return fetchCharacters();
  };

  return {
    characters: readonly(characters),
    loading: readonly(loading),
    error: readonly(error),
    fetchCharacters,
    fetchCharacter,
    getCharacterById,
    activeCharacters,
    refreshCharacters
  };
};
