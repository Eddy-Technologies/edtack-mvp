import { defineStore } from 'pinia';
import { useMe } from '~/composables/useMe';
import { generateInitials, getDisplayFullName } from '~/utils/avatarUtils';
import type { GetMeRes } from '~~/server/api/me.get';
import { useSupabaseClient } from '#imports';

interface MeState extends GetMeRes {
  isInitialized: boolean;
}

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
    created_at: '',
    updated_at: '',
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
    },
    setInitialized(value: boolean = true) {
      this.isInitialized = value;
    },
    async initialize() {
      this.setInitialized(false);
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
      }
      this.setInitialized(true);
    },
    fetchAndSetMe: async function () {
      try {
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
      } finally {
        this.setInitialized(true);
        console.log('User profile fetch completed');
      }
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
