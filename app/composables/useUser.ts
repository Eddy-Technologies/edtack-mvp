import { ref } from 'vue';
import type { GetMeRes } from '../../server/api/me.get';

export function useMe() {
  const data = ref<GetMeRes | null>(null);
  const isLoading = ref(false);
  const error = ref<any | null>(null);

  async function fetchMe() {
    isLoading.value = true;
    error.value = null;
    try {
      data.value = await $fetch<GetMeRes>('/api/me');
    } catch (e: any) {
      error.value = e;
      data.value = null;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return { data, isLoading, error, fetchMe };
}
