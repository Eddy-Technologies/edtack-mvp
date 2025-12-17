import { defineStore } from 'pinia';
import { useMe } from '~/composables/useMe';
import { generateInitials, getDisplayFullName } from '~/utils/avatarUtils';
import type { GetMeRes } from '~~/server/api/me.get';
import { useSupabaseClient } from '#imports';

interface MeState extends GetMeRes {
  isInitialized: boolean;
}

// Initialization promise - allows middleware/components to wait for init completion
let initializationPromise: Promise<void> | null = null;

export const useMeStore = defineStore('me', {
  state: (): MeState => ({
    id: '',
    user_info_id: '',
    email: '',
    first_name: '',
    last_name: '',
    user_role: '',
    level_type: undefined,
    country_code: undefined,
    onboarding_completed: false,
    payment_customer_id: undefined,
    is_active: false,
    auth_provider: '',
    isInitialized: false,
    syllabus_type: undefined
  }),

  actions: {
    setMe(data: GetMeRes) {
      this.$patch(data);
    },
    resetMe() {
      this.$reset();
      initializationPromise = null; // Clear on logout so next login re-initializes
    },
    setInitialized(value: boolean = true) {
      this.isInitialized = value;
    },
    async initialize() {
      // Return existing promise if already initializing (prevents duplicate calls)
      if (initializationPromise) {
        return initializationPromise;
      }

      // Return immediately if already initialized
      if (this.isInitialized) {
        return Promise.resolve();
      }

      initializationPromise = this._doInitialize();
      return initializationPromise;
    },
    async _doInitialize() {
      try {
        const supabase = useSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // User is authenticated, fetch their profile
          await this.fetchAndSetMe();
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
        // Still mark as initialized to prevent infinite loading
      } finally {
        this.isInitialized = true;
      }
    },
    async waitForInitialization() {
      if (this.isInitialized) return;
      // If initialize() hasn't been called yet, call it now
      // This handles the race condition where middleware runs before the plugin
      if (!initializationPromise) {
        await this.initialize();
      } else {
        await initializationPromise;
      }
    },
    fetchAndSetMe: async function () {
      const { fetchMe } = useMe();
      const { data, error } = await fetchMe();
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      if (!data) {
        console.warn('No user profile data found');
        return;
      }
      console.log('Fetched user profile:', data);
      this.setMe(data);
      return data;
    },
  },
  getters: {
    // Check if user is logged in by getting supabase user session
    isLoggedIn: (state) => !!state.id,
    isInitializing: (state) => !state.isInitialized,
    userDisplayName: (state) => {
      if (!state.first_name && !state.email) return 'User';
      return state.first_name || state.email.split('@')[0] || 'User';
    },
    userInitials: (state) => {
      if (!state.first_name && !state.last_name) return '';
      return generateInitials(state.first_name, state.last_name, state.email);
    },
    userDisplayFullName: (state) => {
      return getDisplayFullName(state.first_name, state.last_name, state.email);
    },
    isParent: (state) => state.user_role === 'PARENT',
    isStudent: (state) => state.user_role === 'STUDENT',
    isTeacher: (state) => state.user_role === 'TEACHER',
  }
});
