import { defineNuxtPlugin } from 'nuxt/app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient();
  const meStore = useMeStore();
  const router = useRouter();

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);

    if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
      meStore.refreshMe();
    } else if (event === 'SIGNED_OUT') {
      meStore.resetMe();
      router.push('/login');
    }
  });
});
