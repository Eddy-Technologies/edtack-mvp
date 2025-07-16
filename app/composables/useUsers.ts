import { ref, computed, onMounted } from 'vue';
import { useSupabaseClient } from '#imports';

// Reactive state to hold the current app_user's info (no longer the token itself)
const currentAppUser = ref<any | null>(null);

export function useUsers() {
  const supabase = useSupabaseClient(); // Supabase client for email/password auth

  // On component mount or composable initialization, try to fetch app_user profile
  // This is how we re-hydrate the session from the HttpOnly cookie
  onMounted(async () => {
    // Only attempt to fetch if not already loaded and on client side
    if (!currentAppUser.value && import.meta.client) {
      try {
        const response: { user: any; type: string } = await $fetch('/api/auth/me');
        if (response.user && response.type === 'user') {
          currentAppUser.value = response.user;
          console.log('[useUsers.ts] User session re-hydrated:', response.user.id);
        }
      } catch (error) {
        console.debug('[useUsers.ts] No active app user session or session invalid.', error);
        currentAppUser.value = null; // Ensure state is clear if session is invalid
      }
    }
  });

  // --- Email/Password Authentication ---

  async function loginEmail(email_val: string, password_val: string) {
    console.log('[useUsers.ts] Calling /api/auth/email-login');
    try {
      const response = await $fetch('/api/auth/email-login', {
        method: 'POST',
        body: { email: email_val, password: password_val },
      });

      if (response.user) {
        currentAppUser.value = response.user;
        console.log('[useUsers.ts] Email login successful, state updated.');
      }
      return response;
    } catch (error: any) {
      console.error('[useUsers.ts] Email login failed:', error);
      throw error;
    }
  }

  async function signupEmail(email: string, password: string, firstName: string, lastName: string) {
    console.log('[useUsers.ts] Calling /api/auth/email-register');
    try {
      const response = await $fetch('/api/auth/email-register', {
        method: 'POST',
        body: { email, password, firstName, lastName },
      });

      console.log('[useUsers.ts] Email registration successful:', response);
      return response;
    } catch (error: any) {
      console.error('[useUsers.ts] Email registration failed:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      // Call our logout API endpoint which handles Supabase signOut
      await $fetch('/api/auth/logout', { method: 'POST' });
      currentAppUser.value = null; // Clear client-side state
      console.log('[useUsers.ts] User logged out successfully.');
      return true;
    } catch (error) {
      console.error('[useUsers.ts] Logout failed:', error);
      throw error;
    }
  }

  // --- General User Management (for both types, assuming RLS allows) ---

  // Fetch all users (from 'all_users' view, which combines both types)
  async function getUsers() {
    // This will implicitly send the app_user_jwt cookie if present,
    // but RLS on 'all_users' view would need to be configured to allow access.
    const { data, error } = await supabase
      .from('all_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  // Fetch a single user's profile by user_info_id
  async function getUserInfoById(user_info_id: string) {
    const { data, error } = await supabase
      .from('user_infos') // Directly query user_infos
      .select('*')
      .eq('id', user_info_id)
      .single();
    if (error) throw error;
    return data;
  }

  // Update a user's profile by user_info_id
  async function updateUserInfo(user_info_id: string, updates: Record<string, any>) {
    const { error } = await supabase.from('user_infos').update(updates).eq('id', user_info_id);
    if (error) throw error;
    return true;
  }

  // NEW/UPDATED: Delete a user by user_info_id (delegates to server for actual deletion)
  async function deleteUser(user_info_id: string) {
    console.log(`[useUsers.ts] Requesting deletion for user_info_id: ${user_info_id}`);
    try {
      const response = await $fetch('/api/admin/delete-user', {
        method: 'POST',
        body: { user_info_id },
      });
      console.log(`[useUsers.ts] User deletion successful: ${response.message}`);
      // If the deleted user was the current user, clear their session
      if (currentAppUser.value?.id === user_info_id) {
        logout();
      }
      return true;
    } catch (error: any) {
      console.error('[useUsers.ts] User deletion failed:', error);
      throw error;
    }
  }

  // --- Enhanced User Display Logic ---

  // Computed property to handle user display name
  const currentUserDisplayName = computed(() => {
    if (!currentAppUser.value) return '';

    return currentAppUser.value.firstName ||
      currentAppUser.value.email?.split('@')[0] ||
      'User';
  });

  // Computed property to check if user is logged in
  const isLoggedIn = computed(() => {
    return !!currentAppUser.value;
  });

  return {
    currentAppUser, // Reactive state for current user
    currentUserDisplayName, // Computed display name
    isLoggedIn, // Computed login status
    logout, // Logout function
    loginEmail,
    signupEmail,
    getUsers,
    getUserInfoById,
    updateUserInfo,
    deleteUser,
  };
}
