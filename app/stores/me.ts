import { defineStore } from 'pinia';
import { useMe } from '~/composables/useMe';
import { generateInitials, getDisplayFullName } from '~/utils/avatarUtils';
import type { GetMeRes } from '~~/server/api/me.get';

export const useMeStore = defineStore('me', {
  state: (): GetMeRes => ({
    id: '',
    user_info_id: '',
    email: '',
    first_name: '',
    last_name: '',
    user_role: '',
    level_type: undefined,
    onboarding_completed: false,
    is_active: false,
    created_at: '',
    updated_at: '',
  }),

  actions: {
    setMe(data: GetMeRes) {
      this.$patch(data);
    },
    resetMe() {
      this.$reset();
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
        console.log('User profile fetch completed');
      }
    },
  },
  getters: {
    // Check if user is logged in by getting supabase user session
    isLoggedIn: (state) => !!state.id,
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
    }
  }
});
