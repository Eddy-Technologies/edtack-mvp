import { defineNuxtPlugin } from 'nuxt/app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

// plugins/auth.client.js
export default defineNuxtPlugin(async () => {
  console.log('Auth client plugin initialized');
  const supabase = useSupabaseClient();
  const { fetchAndSetMe, resetMe } = useMeStore();
  const router = useRouter();

  // Listen for changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);

    if (event === 'INITIAL_SESSION' && session) {
      console.log('User signed initial session onAuthStateChange:', session);
      fetchAndSetMe();
    } else if (event === 'SIGNED_IN') {
      console.log('User signed in:', session.user);
      fetchAndSetMe();
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out from auth state change');
      resetMe();
      router.push('/login');
    } else if (event === 'USER_UPDATED' && session) {
      console.log('User profile updated');
      fetchAndSetMe();
    }
  });
});
