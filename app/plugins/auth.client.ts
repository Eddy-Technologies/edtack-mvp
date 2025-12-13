import { defineNuxtPlugin } from 'nuxt/app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

// plugins/auth.client.js
export default defineNuxtPlugin(async () => {
  console.log('Auth client plugin initialized');
  const supabase = useSupabaseClient();
  const { fetchAndSetMe, resetMe, initialize } = useMeStore();
  const router = useRouter();

  // Initialize authentication state
  await initialize();

  // Listen for changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);

    if (event === 'SIGNED_IN' && session) {
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
    // Note: INITIAL_SESSION is now handled by the initialize() call above
  });
});
