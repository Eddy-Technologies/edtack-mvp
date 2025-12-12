import { defineNuxtPlugin } from 'nuxt/app';
import { useSupabaseClient } from '#imports';
import { useMeStore } from '~/stores/me';

// plugins/auth.client.js
export default defineNuxtPlugin(() => {
  console.log('Auth client plugin initialized');
  const supabase = useSupabaseClient();
  const { fetchAndSetMe, resetMe } = useMeStore();
  const router = useRouter();

  // Listen for in-session auth changes (login/logout while app is running)
  // Note: INITIAL_SESSION and initial auth state are handled by app.vue
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);

    // Skip INITIAL_SESSION - handled by app.vue initialization
    if (event === 'INITIAL_SESSION') {
      return;
    }

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
  });
});
