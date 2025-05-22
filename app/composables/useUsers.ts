import { useSupabaseClient } from '#imports';

export function useUsers() {
  const supabase = useSupabaseClient();

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
  async function loginEmail(email_val: string, password_val: string) {
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

    // --- END CRITICAL LOGGING ---

    return true; // Indicate success (even if no session, means API call was successful)
  }

  async function loginUsername(username_val: string, password_val: string) {
    const response = await $fetch('/api/app-auth/login', { // Call the new server route
      method: 'POST',
      body: { username: username_val, password: password_val },
    });
    return response;
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

  // Function to handle username registration (calls server route)
  async function signupUsername(payload: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }) {
    console.log('[useUsers.ts] Calling /api/app-auth/register with payload:', payload);
    const response = await $fetch('/api/app-auth/register', {
      method: 'POST',
      body: payload, // Send the entire payload object
    });
    return response;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }

  return {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginEmail,
    loginUsername,
    signupEmail,
    signupUsername,
    logout,
  };
}
