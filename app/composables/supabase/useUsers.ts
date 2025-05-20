import { ref, onMounted } from 'vue';
import type { User } from '@supabase/supabase-js';

export const useSupabaseClient = () => {
  const nuxtApp = useNuxtApp();
  const supabase = nuxtApp.$supabase;
  return supabase;
};

export const useSupabaseUser = () => {
  const supabase = useNuxtApp().$supabase;
  const user = ref<User | null>(null);

  onMounted(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user.value = data.user;
    }
  });

  return { user };
};

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
  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
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
