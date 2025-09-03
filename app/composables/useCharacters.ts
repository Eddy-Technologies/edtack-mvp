export interface Character {
  id: number;
  name: string;
  slug: string;
  subject: string;
  description?: string;
  image_url?: string;
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

// Global state using Vue's reactivity
const selectedCharacter = ref<Character | null>(null);
const characters = ref<Character[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isAvatarPlaying = ref(false);

export const useCharacters = () => {
  const supabase = useSupabaseClient();

  // Helper function to get public URL for character images
  const getCharacterImageUrl = (imageUrl: string | undefined): string => {
    // console.log('getCharacterImageUrl', imageUrl);
    if (!imageUrl) {
      return '/assets/eddy.png'; // fallback image
    }

    // Use Supabase storage getPublicUrl with characters bucket
    const { data } = supabase.storage
      .from('characters')
      .getPublicUrl(imageUrl);
    // console.log('getCharacterImageUrl', data);

    return data.publicUrl;
  };

  // API Methods
  const fetchCharacters = async (includeInactive: boolean = false): Promise<Character[]> => {
    loading.value = true;
    error.value = null;

    try {
      const query = includeInactive ? '?includeInactive=true' : '';
      const response = await $fetch<CharactersResponse>(`/api/characters${query}`);

      if (response.success) {
        // Transform characters to include public URLs for images
        const charactersWithImages = response.data.map((char) => ({
          ...char,
          image_url: getCharacterImageUrl(char.image_url)
        }));

        characters.value = charactersWithImages;

        // Set default character if none selected
        if (!selectedCharacter.value && charactersWithImages.length > 0) {
          selectedCharacter.value = getDefaultCharacter();
        }

        return charactersWithImages;
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

  const fetchCharacterBySlug = async (slug: string): Promise<Character | null> => {
    try {
      const response = await $fetch<CharacterResponse>(`/api/characters/slug/${slug}`);

      if (response.success) {
        // Transform character to include public URL for image
        const characterWithImage = {
          ...response.data,
          image_url: getCharacterImageUrl(response.data.image_url)
        };

        // Add to local cache if not already there
        const existingIndex = characters.value.findIndex((c) => c.id === characterWithImage.id);
        if (existingIndex >= 0) {
          characters.value[existingIndex] = characterWithImage;
        } else {
          characters.value.push(characterWithImage);
        }

        return characterWithImage;
      } else {
        throw new Error('Failed to fetch character');
      }
    } catch (err: any) {
      console.error('Error fetching character by slug:', err);
      return null;
    }
  };

  // Internal helper methods (not exported)
  const getCharacterById = (id: number): Character | undefined => {
    return characters.value.find((char) => char.id === id);
  };

  const getCharacterBySlug = (slug: string): Character | undefined => {
    return characters.value.find((char) => char.slug === slug);
  };

  const getDefaultCharacter = (): Character | undefined => {
    // Return Eddy as the default character (slug: 'eddy') or first character
    return characters.value.find((char) => char.slug === 'eddy') || characters.value[0];
  };

  const selectCharacterBySlug = async (slug: string) => {
    let character = getCharacterBySlug(slug);

    if (!character) {
      // Try to fetch from API if not in local cache
      try {
        character = await fetchCharacterBySlug(slug);
      } catch (err) {
        console.error('Error fetching character by slug:', err);
      }
    }

    if (character) {
      selectedCharacter.value = character;
      persistSelectedCharacter();
    } else {
      console.warn(`Character with slug "${slug}" not found`);
    }
  };

  // Persistence Methods
  const persistSelectedCharacter = () => {
    if (import.meta.client && selectedCharacter.value) {
      localStorage.setItem('selectedCharacter', JSON.stringify({
        id: selectedCharacter.value.id,
        slug: selectedCharacter.value.slug
      }));
    }
  };

  const loadPersistedCharacter = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('selectedCharacter');
      if (stored) {
        try {
          const { slug } = JSON.parse(stored);
          const character = getCharacterBySlug(slug);
          if (character) {
            selectedCharacter.value = character;
          }
        } catch (err) {
          console.error('Error loading persisted character:', err);
          localStorage.removeItem('selectedCharacter');
        }
      }
    }
  };

  const initializeStore = async () => {
    await fetchCharacters();
    loadPersistedCharacter();

    // Ensure we have a selected character
    if (!selectedCharacter.value) {
      selectedCharacter.value = getDefaultCharacter();
      persistSelectedCharacter();
    }
  };

  // Avatar Playback Methods
  const startAvatarPlayback = (duration?: number) => {
    isAvatarPlaying.value = true;

    // Auto-stop after duration if provided (default 3 seconds)
    if (duration !== undefined && duration > 0) {
      setTimeout(() => {
        stopAvatarPlayback();
      }, duration);
    }
  };

  const stopAvatarPlayback = () => {
    isAvatarPlaying.value = false;
  };

  const getCharacterBySubject = async (subject: string) => {
    return characters.value.find((char) => char.subject === subject);
  };

  return {
    // State (only what's actually used)
    selectedCharacter: readonly(selectedCharacter),
    isAvatarPlaying: readonly(isAvatarPlaying),

    // API Methods (only what's actually used)
    fetchCharacters,

    // State Management (only what's actually used)
    selectCharacterBySlug,
    getCharacterBySubject,
    initializeStore,

    // Avatar Playback Management
    startAvatarPlayback,
    stopAvatarPlayback
  };
};
