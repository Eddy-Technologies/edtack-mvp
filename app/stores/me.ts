import { defineStore } from 'pinia';
import { generateInitials, getDisplayFullName } from '~/utils/avatarUtils';
import type { GetMeRes } from '~~/server/api/me.get';

interface MeState extends Partial<GetMeRes> {
  isLoading: boolean;
}

// Store pending promise outside state (not reactive)
let pendingRefresh: Promise<GetMeRes | null> | null = null;

export const useMeStore = defineStore('me', {
  state: (): MeState => ({
    isLoading: false,
    id: undefined,
    user_info_id: undefined,
    email: undefined,
    first_name: undefined,
    last_name: undefined,
    user_role: undefined,
    level_type: undefined,
    country_code: undefined,
    onboarding_completed: undefined,
    payment_customer_id: undefined,
    is_active: undefined,
    created_at: undefined,
    updated_at: undefined,
    auth_provider: undefined,
    syllabus_type: undefined
  }),

  actions: {
    async refreshMe() {
      // If already loading, wait for the existing request
      if (pendingRefresh) {
        return pendingRefresh;
      }

      this.isLoading = true;
      pendingRefresh = (async () => {
        try {
          const data = await $fetch<GetMeRes>('/api/me');
          this.$patch(data);
          return data;
        } catch (error) {
          console.error('Error fetching user profile:', error);
          return null;
        } finally {
          this.isLoading = false;
          pendingRefresh = null;
        }
      })();

      return pendingRefresh;
    },
    resetMe() {
      pendingRefresh = null;
      this.$reset();
    },
  },

  getters: {
    userDisplayName: (state) => {
      if (!state.first_name && !state.email) return 'User';
      return state.first_name || state.email?.split('@')[0] || 'User';
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
