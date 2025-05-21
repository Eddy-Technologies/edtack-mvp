import { ref, onMounted } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';

export function useUsers() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Fetch all users
  async function getUsers() {
  // Fetch from auth.users via RPC or REST API (special handling)
    const { data, error } = await supabase
      .from('all_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  // Fetch a single user by ID
  async function getUserById(id: string | number) {
    const { data, error } = await supabase
      .from('all_users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // Add a new user
  async function addAppUser(userData: Record<string, any>) {
    const { error } = await supabase
      .from('app_users')
      .insert([userData]);
    if (error) throw error;
    return true;
  }

  // Update a user by ID
  async function updateUser(id: string | number, updates: Record<string, any>) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Delete a user by ID
  async function deleteUser(id: string | number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Auth: login, logout, signup
  async function login(email_val: string, password_val: string) {
    console.log('[useUsers.ts] Calling signInWithPassword for:', email_val);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email_val,
      password: password_val
    });

    if (error) {
      console.error('[useUsers.ts] signInWithPassword ERROR:', error);
      throw error; // Re-throw the error
    }

    // --- CRITICAL LOGGING HERE ---
    console.log('[useUsers.ts] signInWithPassword SUCCESS. Full Data received:', data);
    if (data.session) {
      console.log('[useUsers.ts] Session present in data:', data.session);
      console.log('[useUsers.ts] Access Token:', data.session.access_token);
      console.log('[useUsers.ts] User from data:', data.user);
    } else {
      console.warn('[useUsers.ts] signInWithPassword returned NO SESSION in data despite no error! User might need to confirm email.');
    }
    // --- END CRITICAL LOGGING ---

    return true; // Indicate success (even if no session, means API call was successful)
  }

  async function signup(email: string, password: string) {
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

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }

  return {
    user,
    getUsers,
    getUserById,
    addAppUser,
    updateUser,
    deleteUser,
    login,
    signup,
    logout,
  };
}
