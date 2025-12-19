import { defineStore } from 'pinia';
import { generateInitials, getDisplayFullName } from '~/utils/avatarUtils';
import type { GetMeRes } from '~~/server/api/me.get';
import { useSupabaseClient } from '#imports';

interface MeState extends GetMeRes {
  isInitialized: boolean;
  isLoading: boolean;
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
    isLoading: false,
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
      if (this.isInitialized) return;

      try {
        const supabase = useSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await this.refreshMe();
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
      } finally {
        this.isInitialized = true;
      }
    },
    async refreshMe() {
      if (this.isLoading) return;

      this.isLoading = true;
      try {
        const data = await $fetch<GetMeRes>('/api/me');
        this.$patch(data);
        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      } finally {
        this.isLoading = false;
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
