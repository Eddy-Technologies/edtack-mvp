import { ref, onMounted } from 'vue';
import { useSupabaseClient } from '#imports';
import { navigateTo } from '#app';

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
        const response: { user: any; type: string } = await $fetch('/api/app-auth/me');
        if (response.user && response.type === 'app_user') {
          currentAppUser.value = response.user;
          console.log('[useUsers.ts] App user session re-hydrated:', response.user.id);
        }
      } catch (error) {
        console.debug('[useUsers.ts] No active app user session or session invalid.', error);
        currentAppUser.value = null; // Ensure state is clear if session is invalid
      }
    }
  });

  // --- App User (Username/Password) Authentication ---

  async function loginUsername(username_val: string, password_val: string) {
    console.log('[useUsers.ts] Calling /api/app-auth/login');
    try {
      const response: { user: any; type: string; message: string } = await $fetch('/api/app-auth/login', {
        method: 'POST',
        body: { username: username_val, password: password_val },
      });

      if (response.user) {
        currentAppUser.value = response.user;
        console.log('[useUsers.ts] App user login successful, state updated.');
      }
      return response;
    } catch (error: any) {
      console.error('[useUsers.ts] App user login failed:', error);
      throw error;
    }
  }

  async function signupUsername(payload: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }) {
    const response = await $fetch('/api/app-auth/register', {
      method: 'POST',
      body: payload,
    });
    // Note: Registration does not automatically log in or set a cookie here.
    // User will need to call loginUsername after successful registration.
    return response;
  }

  async function logoutUsername() {
    try {
      await $fetch('/api/app-auth/logout', { method: 'POST' });
      currentAppUser.value = null; // Clear client-side state
      console.log('[useUsers.ts] App user session cleared.');
      navigateTo('/login'); // Redirect after logout
    } catch (error) {
      console.error('[useUsers.ts] Failed to clear app user session:', error);
      throw error;
    }
  }

  // --- Supabase User (Email/Password) Authentication ---

  async function loginEmail(email_val: string, password_val: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email_val,
      password: password_val
    });

    if (error) {
      console.error('[useUsers.ts] signInWithPassword ERROR:', error);
      throw error;
    }
    console.log('[useUsers.ts] signInWithPassword SUCCESS. Full Data received:', data);
    return true;
  }

  async function signupEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: '/auth/callback',
      },
    });
    if (error) throw error;
    return true;
  }

  async function logoutEmail() { // Renamed from general 'logout' to clarify it's for email users
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[useUsers.ts] Email user logged out.');
    navigateTo('/login'); // Redirect after logout
    return true;
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
    const { error } = await supabase
      .from('user_infos')
      .update(updates)
      .eq('id', user_info_id);
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
      // If the deleted user was the current app_user, clear their session
      if (currentAppUser.value?.id === user_info_id) {
        logoutUsername();
      }
      return true;
    } catch (error: any) {
      console.error('[useUsers.ts] User deletion failed:', error);
      throw error;
    }
  }

  return {
    currentAppUser, // Reactive state for app_user
    loginUsername,
    signupUsername,
    logoutUsername,
    loginEmail,
    signupEmail,
    logoutEmail,
    getUsers,
    getUserInfoById,
    updateUserInfo,
    deleteUser,
  };
}
