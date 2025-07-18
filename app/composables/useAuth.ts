import type { QueryData } from '@supabase/supabase-js';
import { onMounted } from 'vue';
import { useMeStore } from '../stores/me';
import { useSupabaseClient, useSupabaseUser } from '#imports';
// Import the clearMe function from the store
export interface SignUpReq {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userRole: string;
  studentLevel?: string;
  acceptTerms: boolean; // Optional, can be used for terms acceptance
}

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const meStore = useMeStore();
  const { clearMe, fetchMe } = meStore;

  const signUp = async (input: SignUpReq) => {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: input
    });
    console.log('Sign up response:', data);
    return data;
  };

  const signIn = async (email_val: string, password_val: string) => {
    // const body = JSON.stringify();
    console.log(email_val, email_val);
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email_val, password: password_val }
    });
    fetchMe();
    console.log('Sign in response:', data);
    return data;
  };

  const signOut = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    });
    // Sign out from Supabase client side
    await supabase.auth.signOut();
    clearMe(); // Clear the user store state
    console.log('User signed out and store cleared');
    return;
  };

  const getUserProfile = async () => {
    if (!user.value) return null;

    const userInfoWithRoleQuery = supabase
      .from('user_infos')
      .select('*, user_roles(role_id, roles(role_name))')
      .eq('user_id', user.value.id)
      .single();

    // type UserInfoWithRole = QueryData<typeof userInfoWithRoleQuery>;
    const { data, error } = await userInfoWithRoleQuery;
    if (error) throw error;
    console.log('User profile data:', user);
    return { ...data, user_role: data.user_roles?.[0]?.roles?.role_name }; // user role is same as USER_ROLE
  };

  const updateUserProfile = async (updates: Record<string, any>) => {
    if (!user.value) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('user_infos')
      .update(updates)
      .eq('user_id', user.value.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Computed properties for easier access
  const isLoggedIn = computed(() => !!user.value);

  const userDisplayName = computed(() => {
    if (!user.value) return 'User';
    return user.value.user_metadata?.first_name ||
      user.value.email?.split('@')[0] ||
      'User';
  });

  return {
    user: readonly(user),
    isLoggedIn,
    userDisplayName,
    signUp,
    signIn,
    signOut,
    getUserProfile,
    updateUserProfile,
  };
};
