import { ref } from 'vue';

interface Chapter {
  value: string;
  label: string;
  description?: string;
  level: number;
  chapterNumber?: number;
}

interface ChapterResponse {
  success: boolean;
  chapters: Chapter[];
}

// Cache to prevent redundant API calls
const chapterCache = new Map<string, Chapter[]>();

export const useChapters = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch chapters for a given subject
   * @param subject - The subject identifier (e.g., 'BIOLOGY', 'CHEMISTRY')
   * @returns Array of formatted chapters
   */
  const fetchChaptersBySubject = async (subject: string): Promise<Chapter[]> => {
    // Return cached data if available
    if (chapterCache.has(subject)) {
      return chapterCache.get(subject)!;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ChapterResponse>(`/api/chapters/by-subject/${subject}`);

      if (response.success && response.chapters) {
        // Cache the results
        chapterCache.set(subject, response.chapters);
        return response.chapters;
      }

      return [];
    } catch (err: any) {
      console.error('Error fetching chapters:', err);
      error.value = err.message || 'Failed to fetch chapters';
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear the chapter cache (useful for testing or forced refresh)
   */
  const clearCache = () => {
    chapterCache.clear();
  };

  return {
    fetchChaptersBySubject,
    clearCache,
    loading,
    error,
  };
};
