import { ref } from 'vue';
import type { GetMeRes } from '../../server/api/me.get';
import { useSupabaseClient } from '#imports';

export function useMe() {
  const data = ref<GetMeRes | null>(null);
  const isLoading = ref(false);
  const error = ref<any | null>(null);
  const supabase = useSupabaseClient();

  async function fetchMe() {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await $fetch<GetMeRes>('/api/me');
      data.value = result;
    } catch (e: any) {
      error.value = e;
      data.value = null;
    } finally {
      isLoading.value = false;
    }
    return { data: data.value, error: error.value };
  }

  return { meIsLoading: isLoading, fetchMe };
}
